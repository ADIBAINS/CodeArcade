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

    public boolean compile(String language, File workspace) throws IOException, InterruptedException {
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

    private boolean runWithTimeout(ProcessBuilder builder, File workspace, int timeoutSeconds)
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
            return false;
        }

        try {
            stdout.join();
            stderr.join();
        } catch (RuntimeException error) {
            return false;
        }
        return process.exitValue() == 0;
    }
}
