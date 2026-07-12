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
            try {
                Submission submission = submissionQueue.takeSubmission();
                JudgeResult result = judgeService.judge(submission);
                resultReporter.report(result);
            } catch (InterruptedException error) {
                Thread.currentThread().interrupt();
            } catch (Exception error) {
                error.printStackTrace();
            }
        }
    }
}

