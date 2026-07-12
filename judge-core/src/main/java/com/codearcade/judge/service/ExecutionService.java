package com.codearcade.judge.service;

import com.codearcade.judge.model.ExecutionResult;
import com.codearcade.judge.util.ProcessUtil;

import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.io.OutputStreamWriter;
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

        ExecutorService streamPool = Executors.newFixedThreadPool(2);
        CompletableFuture<String> stdout = CompletableFuture.supplyAsync(() -> ProcessUtil.readLimited(process.getInputStream()), streamPool);
        CompletableFuture<String> stderr = CompletableFuture.supplyAsync(() -> ProcessUtil.readLimited(process.getErrorStream()), streamPool);

        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()))) {
            writer.write(input == null ? "" : input);
            writer.flush();
        } catch (IOException ignored) {
            // The child process may exit before reading stdin.
        }

        boolean completed = process.waitFor(timeLimitMs, TimeUnit.MILLISECONDS);
        long end = System.currentTimeMillis();

        if (!completed) {
            process.destroyForcibly();
            process.waitFor(2, TimeUnit.SECONDS);
            streamPool.shutdownNow();
            return new ExecutionResult(true, -1, "", "Time Limit Exceeded", end - start);
        }

        String output = stdout.join();
        String error = stderr.join();
        streamPool.shutdownNow();

        return new ExecutionResult(false, process.exitValue(), output, error, end - start);
    }
}
