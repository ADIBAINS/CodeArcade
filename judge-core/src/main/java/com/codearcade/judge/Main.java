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

import java.util.List;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        JudgeConfig config = JudgeConfig.fromEnvironment();
        SubmissionQueue submissionQueue = new SubmissionQueue();

        JudgeService judgeService = new JudgeService(
                config,
                new CompilerService(config),
                new ExecutionService(),
                new OutputComparator()
        );
        ResultReporter resultReporter = new ResultReporter(config.getApiBaseUrl(), config.getInternalToken());
        PendingSubmissionFetcher fetcher = new PendingSubmissionFetcher(config.getApiBaseUrl(), config.getInternalToken());

        for (int i = 0; i < config.getWorkerCount(); i++) {
            Thread workerThread = new Thread(
                    new JudgeWorker(submissionQueue, judgeService, resultReporter),
                    "judge-worker-" + i
            );
            workerThread.start();
        }

        System.out.println("CodeArcade judge started with " + config.getWorkerCount() + " workers in " + config.getExecutionMode() + " execution mode");

        while (true) {
            List<Submission> pendingSubmissions = fetcher.fetchPending(config.getFetchLimit());

            for (Submission submission : pendingSubmissions) {
                submissionQueue.addSubmission(submission);
            }

            if (!pendingSubmissions.isEmpty()) {
                System.out.println("Queued " + pendingSubmissions.size() + " submissions. Queue size: " + submissionQueue.size());
            }

            Thread.sleep(config.getPollIntervalMs());
        }
    }
}
