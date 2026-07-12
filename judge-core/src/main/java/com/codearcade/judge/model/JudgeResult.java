package com.codearcade.judge.model;

public class JudgeResult {
    private final String submissionId;
    private final Verdict verdict;
    private final int passedTests;
    private final int totalTests;
    private final long executionTimeMs;
    private final String errorMessage;
    private final String failedTestInput;
    private final String expectedOutput;
    private final String actualOutput;

    public JudgeResult(String submissionId, Verdict verdict, int passedTests, int totalTests, long executionTimeMs, String errorMessage) {
        this(submissionId, verdict, passedTests, totalTests, executionTimeMs, errorMessage, null, null, null);
    }

    public JudgeResult(
            String submissionId,
            Verdict verdict,
            int passedTests,
            int totalTests,
            long executionTimeMs,
            String errorMessage,
            String failedTestInput,
            String expectedOutput,
            String actualOutput
    ) {
        this.submissionId = submissionId;
        this.verdict = verdict;
        this.passedTests = passedTests;
        this.totalTests = totalTests;
        this.executionTimeMs = executionTimeMs;
        this.errorMessage = errorMessage;
        this.failedTestInput = failedTestInput;
        this.expectedOutput = expectedOutput;
        this.actualOutput = actualOutput;
    }

    public String getSubmissionId() {
        return submissionId;
    }

    public Verdict getVerdict() {
        return verdict;
    }

    public int getPassedTests() {
        return passedTests;
    }

    public int getTotalTests() {
        return totalTests;
    }

    public long getExecutionTimeMs() {
        return executionTimeMs;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public String getFailedTestInput() {
        return failedTestInput;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public String getActualOutput() {
        return actualOutput;
    }
}
