package com.codearcade.judge.service;

import com.codearcade.judge.config.JudgeConfig;
import com.codearcade.judge.util.ProcessUtil;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
public class CompilerService {
    private static final int MAX_DIAGNOSTIC_CHARS = 4000;
    private static final ExecutorService STREAM_POOL = Executors.newCachedThreadPool(r -> {
        Thread thread = new Thread(r, "judge-compile-io");
        thread.setDaemon(true);
        return thread;
    });
    private final JudgeConfig config;
    private final DockerCommandFactory dockerCommandFactory;

    public CompilerService(JudgeConfig config) {
        this.config = config;
        this.dockerCommandFactory = new DockerCommandFactory(config);
    }

    /** Compiles and captures the compiler output so failures carry real diagnostics. */
    public CompileResult compile(String language, File workspace) throws IOException, InterruptedException {
        if (config.isDockerExecutionMode()) {
            return runWithTimeout(new ProcessBuilder(dockerCommandFactory.compileCommand(language, workspace)), workspace, config.getCompileTimeoutSeconds());
        }

        if ("JAVA".equalsIgnoreCase(language)) {
            return runWithTimeout(new ProcessBuilder("javac", "Main.java"), workspace, Math.min(config.getCompileTimeoutSeconds(), 30));
        }

        if ("CPP".equalsIgnoreCase(language)) {
            return runWithTimeout(new ProcessBuilder("g++", "Main.cpp", "-O2", "-o", "Main"), workspace, Math.min(config.getCompileTimeoutSeconds(), 30));
        }

        throw new IllegalArgumentException("Unsupported language: " + language);
    }

    public List<String> getRunCommand(String language, int memoryLimitMb, File workspace) {
        if (config.isDockerExecutionMode()) {
            return dockerCommandFactory.runCommand(language, workspace, memoryLimitMb);
        }

        if ("JAVA".equalsIgnoreCase(language)) {
            return List.of("java", "-Xmx" + memoryLimitMb + "m", "Main");
        }

        if ("CPP".equalsIgnoreCase(language)) {
            return List.of("./run.sh", String.valueOf(memoryLimitMb * 1024), "./Main");
        }

        throw new IllegalArgumentException("Unsupported language: " + language);
    }

    private CompileResult runWithTimeout(ProcessBuilder builder, File workspace, int timeoutSeconds)
            throws IOException, InterruptedException {
        builder.directory(workspace);
        Process process = builder.start();
        CompletableFuture<String> stdout = CompletableFuture.supplyAsync(() -> ProcessUtil.readLimited(process.getInputStream()), STREAM_POOL);
        CompletableFuture<String> stderr = CompletableFuture.supplyAsync(() -> ProcessUtil.readLimited(process.getErrorStream()), STREAM_POOL);
        boolean completed = false;
        try {
            completed = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        } finally {
            if (!completed) {
                process.destroyForcibly();
                process.waitFor(2, TimeUnit.SECONDS);
            }
        }

        if (!completed) {
            stdout.cancel(true);
            stderr.cancel(true);
            return new CompileResult(false, -1, "Compilation timed out after " + timeoutSeconds + "s");
        }

        String output;
        String error;
        try {
            output = stdout.join();
            error = stderr.join();
        } catch (RuntimeException joinError) {
            return new CompileResult(false, -1, "Failed to read compiler output");
        }
        boolean ok = process.exitValue() == 0;
        String diagnostics = !error.isBlank() ? error : output;
        if (diagnostics.length() > MAX_DIAGNOSTIC_CHARS) {
            diagnostics = diagnostics.substring(0, MAX_DIAGNOSTIC_CHARS);
        }
        return new CompileResult(ok, process.exitValue(), diagnostics);
    }

    /** Outcome of one compilation, carrying the compiler diagnostics for CE verdicts. */
    public record CompileResult(boolean ok, int exitCode, String output) {
    }
}
