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
    public ExecutionResult execute(List<String> command, File workspace, String input, int timeLimitMs)
            throws IOException, InterruptedException {
        long start = System.currentTimeMillis();
        ProcessBuilder builder = new ProcessBuilder(command);
        builder.directory(workspace);
        Process process = builder.start();

        ExecutorService streamPool = Executors.newFixedThreadPool(3);
        CompletableFuture<String> stdout = CompletableFuture.supplyAsync(() -> ProcessUtil.readLimited(process.getInputStream()), streamPool);
        CompletableFuture<String> stderr = CompletableFuture.supplyAsync(() -> ProcessUtil.readLimited(process.getErrorStream()), streamPool);
        CompletableFuture<Void> stdin = CompletableFuture.runAsync(() -> writeInput(process.getOutputStream(), input), streamPool);

        boolean completed = process.waitFor(timeLimitMs, TimeUnit.MILLISECONDS);
        long end = System.currentTimeMillis();

        if (!completed) {
            process.destroyForcibly();
            process.waitFor(2, TimeUnit.SECONDS);
            stdin.cancel(true);
            streamPool.shutdownNow();
            return new ExecutionResult(true, -1, "", "Time Limit Exceeded", end - start);
        }

        // The input task closes stdin after writing. A closed stdin is important
        // for programs that read until EOF instead of reading a fixed count.
        stdin.join();
        String output = stdout.join();
        String error = stderr.join();
        streamPool.shutdownNow();

        return new ExecutionResult(false, process.exitValue(), output, error, end - start);
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
