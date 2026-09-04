package com.codearcade.judge.service;

import com.codearcade.judge.model.ExecutionResult;
import com.codearcade.judge.util.ProcessUtil;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class ExecutionService {
    private static final ExecutorService STREAM_POOL = Executors.newCachedThreadPool(r -> {
        Thread thread = new Thread(r, "judge-exec-io");
        thread.setDaemon(true);
        return thread;
    });

    public ExecutionResult execute(List<String> command, File workspace, String input, int timeLimitMs)
            throws IOException, InterruptedException {
        int safeLimitMs = Math.min(Math.max(timeLimitMs, 500), 10000);
        long start = System.nanoTime();
        ProcessBuilder builder = new ProcessBuilder(command);
        builder.directory(workspace);
        Process process = builder.start();

        CompletableFuture<String> stdout = CompletableFuture.supplyAsync(() -> ProcessUtil.readLimited(process.getInputStream()), STREAM_POOL);
        CompletableFuture<String> stderr = CompletableFuture.supplyAsync(() -> ProcessUtil.readLimited(process.getErrorStream()), STREAM_POOL);
        CompletableFuture<Void> stdin = CompletableFuture.runAsync(() -> writeInput(process.getOutputStream(), input), STREAM_POOL);

        boolean completed = process.waitFor(safeLimitMs, TimeUnit.MILLISECONDS);
        long elapsedMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start);

        if (!completed) {
            process.destroyForcibly();
            process.waitFor(2, TimeUnit.SECONDS);
            stdin.cancel(true);
            stdout.cancel(true);
            stderr.cancel(true);
            return new ExecutionResult(true, -1, "", "Time Limit Exceeded", Math.max(elapsedMs, safeLimitMs));
        }

        // The input task closes stdin after writing. A closed stdin is important
        // for programs that read until EOF instead of reading a fixed count.
        try {
            stdin.join();
        } catch (RuntimeException ignored) {
        }
        String output;
        String error;
        try {
            output = stdout.join();
            error = stderr.join();
        } catch (RuntimeException joinError) {
            output = "";
            error = "Judge I/O error";
        }

        return new ExecutionResult(false, process.exitValue(), output, error, elapsedMs);
    }

    private void writeInput(OutputStream outputStream, String input) {
        try (OutputStream output = outputStream) {
            byte[] inputBytes = (input == null ? "" : input).getBytes(StandardCharsets.UTF_8);
            output.write(inputBytes);
            output.flush();
        } catch (IOException ignored) {
            // The child process may exit before consuming stdin.
        }
    }
}
