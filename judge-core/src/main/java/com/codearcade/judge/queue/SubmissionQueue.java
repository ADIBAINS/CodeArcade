package com.codearcade.judge.queue;

import com.codearcade.judge.model.Submission;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

public class SubmissionQueue {
    private final BlockingQueue<Submission> queue;

    public SubmissionQueue() {
        this(256);
    }

    public SubmissionQueue(int capacity) {
        this.queue = new LinkedBlockingQueue<>(Math.max(1, capacity));
    }

    public boolean addSubmission(Submission submission) {
        return queue.offer(submission);
    }

    public boolean offerSubmission(Submission submission, long timeoutMs) throws InterruptedException {
        return queue.offer(submission, timeoutMs, java.util.concurrent.TimeUnit.MILLISECONDS);
    }

    public Submission takeSubmission() throws InterruptedException {
        return queue.take();
    }

    public int size() {
        return queue.size();
    }
}

