package com.codearcade.judge.worker;

import com.codearcade.judge.model.JudgeResult;
import com.codearcade.judge.model.Submission;
import com.codearcade.judge.queue.SubmissionQueue;
import com.codearcade.judge.service.JudgeService;
import com.codearcade.judge.service.ResultReporter;

public class JudgeWorker implements Runnable {
    private final SubmissionQueue submissionQueue;
    private final JudgeService judgeService;
    private final ResultReporter resultReporter;

    public JudgeWorker(SubmissionQueue submissionQueue, JudgeService judgeService, ResultReporter resultReporter) {
        this.submissionQueue = submissionQueue;
        this.judgeService = judgeService;
        this.resultReporter = resultReporter;
    }

    @Override
    public void run() {
        while (!Thread.currentThread().isInterrupted()) {
            Submission current = null;
            try {
                current = submissionQueue.takeSubmission();
                JudgeResult result = judgeService.judge(current);
                resultReporter.report(result);
            } catch (InterruptedException error) {
                Thread.currentThread().interrupt();
                if (current != null) {
                    // Best-effort terminal report so the backend does not hang
                    // on RUNNING forever; stale-timeout requeues if this fails.
                    try {
                        resultReporter.report(new JudgeResult(current.getId(), com.codearcade.judge.model.Verdict.RE, 0, testCount(current), 0, "Judge worker interrupted"));
                    } catch (RuntimeException ignored) {
                    }
                }
            } catch (Exception error) {
                System.err.println("Judge worker failure: " + error.getMessage());
                if (current != null) {
                    try {
                        resultReporter.report(new JudgeResult(current.getId(), com.codearcade.judge.model.Verdict.RE, 0, testCount(current), 0, "Judge system error"));
                    } catch (RuntimeException ignored) {
                    }
                }
            } catch (Error error) {
                System.err.println("Judge worker fatal error: " + error.getMessage());
                if (current != null) {
                    try {
                        resultReporter.report(new JudgeResult(current.getId(), com.codearcade.judge.model.Verdict.RE, 0, testCount(current), 0, "Judge system error"));
                    } catch (RuntimeException ignored) {
                    }
                }
                throw error;
            }
        }
    }

    private static int testCount(Submission submission) {
        return submission != null && submission.getTestCases() != null ? submission.getTestCases().size() : 0;
    }
}

