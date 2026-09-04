package com.codearcade.judge;

import com.codearcade.judge.config.JudgeConfig;
import com.codearcade.judge.model.Submission;
import com.codearcade.judge.queue.SubmissionQueue;
import com.codearcade.judge.service.CompilerService;
import com.codearcade.judge.service.ExecutionService;
import com.codearcade.judge.service.JudgeService;
import com.codearcade.judge.service.OutputComparator;
import com.codearcade.judge.service.PendingSubmissionFetcher;
import com.codearcade.judge.service.ResultReporter;
import com.codearcade.judge.worker.JudgeWorker;

import java.nio.file.Files;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        JudgeConfig config = JudgeConfig.fromEnvironment();
        SubmissionQueue submissionQueue = new SubmissionQueue(Math.max(16, config.getWorkerCount() * 4));

        JudgeService judgeService = new JudgeService(
                config,
                new CompilerService(config),
                new ExecutionService(),
                new OutputComparator()
        );
        ResultReporter resultReporter = new ResultReporter(config.getApiBaseUrl(), config.getInternalToken(), config.getHttpConnectTimeoutSeconds(), config.getHttpRequestTimeoutSeconds());
        PendingSubmissionFetcher fetcher = new PendingSubmissionFetcher(config.getApiBaseUrl(), config.getInternalToken(), config.getHttpConnectTimeoutSeconds(), config.getHttpRequestTimeoutSeconds());

        sweepStaleWorkspaces(config);
        prePullImages(config);
        ThreadFactory factory = new ThreadFactory() {
            private final AtomicInteger counter = new AtomicInteger();
            @Override
            public Thread newThread(Runnable task) {
                Thread thread = new Thread(task, "judge-worker-" + counter.getAndIncrement());
                thread.setDaemon(false);
                return thread;
            }
        };
        ExecutorService workers = Executors.newFixedThreadPool(config.getWorkerCount(), factory);
        for (int i = 0; i < config.getWorkerCount(); i++) {
            workers.submit(new JudgeWorker(submissionQueue, judgeService, resultReporter));
        }
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Shutting down judge workers...");
            workers.shutdown();
            try {
                if (!workers.awaitTermination(30, TimeUnit.SECONDS)) {
                    workers.shutdownNow();
                }
            } catch (InterruptedException error) {
                workers.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }));

        System.out.println("CodeArcade judge started with " + config.getWorkerCount() + " workers in " + config.getExecutionMode() + " execution mode");

        int consecutiveFailures = 0;
        while (true) {
            List<Submission> pendingSubmissions;
            try {
                pendingSubmissions = fetcher.fetchPending(config.getFetchLimit());
                consecutiveFailures = 0;
            } catch (RuntimeException error) {
                // Poison payloads are skipped inside the fetcher; anything
                // escaping here is unexpected. Back off instead of crash-looping.
                consecutiveFailures++;
                System.err.println("Fetch loop error: " + error.getMessage());
                Thread.sleep(backoffMs(config.getPollIntervalMs(), consecutiveFailures));
                continue;
            }

            for (Submission submission : pendingSubmissions) {
                // Bounded queue applies backpressure: drop (leave RUNNING to
                // stale-timeout) rather than OOM the judge on bursts.
                if (!submissionQueue.addSubmission(submission)) {
                    System.err.println("Queue full, skipping submission " + submission.getId());
                }
            }

            if (!pendingSubmissions.isEmpty()) {
                System.out.println("Queued " + pendingSubmissions.size() + " submissions. Queue size: " + submissionQueue.size());
            }

            Thread.sleep(config.getPollIntervalMs());
        }
    }

    static long backoffMs(int baseMs, int failures) {
        long backoff = (long) baseMs * (1L << Math.min(failures, 5));
        long capped = Math.min(backoff, 60000L);
        return capped + (long) (Math.random() * baseMs);
    }

    private static void prePullImages(JudgeConfig config) {
        if (!config.isDockerExecutionMode()) {
            return;
        }
        // Cold `docker pull` during a judgment exceeds the compile timeout and
        // produces false CE verdicts. Pull once at boot; failures only warn
        // because the daemon may already have the images cached.
        java.util.Set<String> images = new java.util.LinkedHashSet<>(java.util.List.of(
                config.getJavaDockerImage(), config.getJavaRunImage(), config.getCppDockerImage()));
        for (String image : images) {
            try {
                Process process = new ProcessBuilder(config.getDockerBinary(), "pull", image).start();
                boolean done = process.waitFor(5, TimeUnit.MINUTES);
                System.out.println("Image pull " + image + ": " + (done && process.exitValue() == 0 ? "ok" : "failed"));
            } catch (Exception error) {
                System.err.println("Image pull " + image + " failed: " + error.getMessage());
            }
        }
    }

    private static void sweepStaleWorkspaces(JudgeConfig config) {
        try {
            Files.createDirectories(config.getWorkspaceRoot());
            try (var stream = Files.list(config.getWorkspaceRoot())) {
                stream.filter(p -> p.getFileName().toString().startsWith("submission-")).forEach(p -> {
                    try {
                        com.codearcade.judge.util.FileUtil.deleteRecursively(p);
                    } catch (RuntimeException ignored) {
                    }
                });
            }
        } catch (Exception error) {
            System.err.println("Workspace sweep failed: " + error.getMessage());
        }
    }
}
