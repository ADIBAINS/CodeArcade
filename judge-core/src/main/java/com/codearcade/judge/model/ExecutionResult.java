package com.codearcade.judge.model;

public class ExecutionResult {
    private final boolean timeout;
    private final int exitCode;
    private final String output;
    private final String error;
    private final long executionTimeMs;

    public ExecutionResult(boolean timeout, int exitCode, String output, String error, long executionTimeMs) {
        this.timeout = timeout;
        this.exitCode = exitCode;
        this.output = output;
        this.error = error;
        this.executionTimeMs = executionTimeMs;
    }

    public boolean isTimeout() {
        return timeout;
    }

    public int getExitCode() {
        return exitCode;
    }

    public String getOutput() {
        return output;
    }

    public String getError() {
        return error;
    }

    public long getExecutionTimeMs() {
        return executionTimeMs;
    }
}

