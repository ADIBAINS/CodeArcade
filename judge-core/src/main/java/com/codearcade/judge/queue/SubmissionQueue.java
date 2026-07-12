package com.codearcade.judge.queue;

import com.codearcade.judge.model.Submission;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

public class SubmissionQueue {
    private final BlockingQueue<Submission> queue = new LinkedBlockingQueue<>();

    public void addSubmission(Submission submission) {
        queue.offer(submission);
    }

    public Submission takeSubmission() throws InterruptedException {
        return queue.take();
    }

    public int size() {
        return queue.size();
    }
}

