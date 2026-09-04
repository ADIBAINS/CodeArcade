package com.codearcade.judge.service;

import com.codearcade.judge.model.JudgeResult;
import com.codearcade.judge.util.JsonUtil;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

public class ResultReporter {
    private final String apiBaseUrl;
    private final String internalToken;
    private final int connectTimeoutSeconds;
    private final int requestTimeoutSeconds;
    private final HttpClient httpClient;

    public ResultReporter(String apiBaseUrl, String internalToken) {
        this(apiBaseUrl, internalToken, 5, 10);
    }

    public ResultReporter(String apiBaseUrl, String internalToken, int connectTimeoutSeconds, int requestTimeoutSeconds) {
        this.apiBaseUrl = apiBaseUrl;
        this.internalToken = internalToken;
        this.connectTimeoutSeconds = Math.max(1, connectTimeoutSeconds);
        this.requestTimeoutSeconds = Math.max(1, requestTimeoutSeconds);
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(this.connectTimeoutSeconds)).build();
    }

    public void report(JudgeResult result) {
        RuntimeException lastError = null;
        for (int attempt = 1; attempt <= 3; attempt += 1) {
            try {
                if (tryReport(result)) {
                    return;
                }
            } catch (IOException | InterruptedException error) {
                if (error instanceof InterruptedException) {
                    Thread.currentThread().interrupt();
                    return;
                }
                lastError = new RuntimeException(error.getMessage(), error);
            }
            try {
                Thread.sleep(Math.min(1000L * attempt, 5000L));
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
                return;
            }
        }
        System.err.println("Result report failed for " + result.getSubmissionId()
                + (lastError == null ? ": non-2xx response" : ": " + lastError.getMessage()));
    }

    private boolean tryReport(JudgeResult result) throws IOException, InterruptedException {
        String body = JsonUtil.stringify(toBody(result));
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiBaseUrl + "/api/internal/judge/results"))
                .timeout(Duration.ofSeconds(requestTimeoutSeconds))
                .header("Authorization", "Bearer " + internalToken)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            return true;
        }
        // 4xx (except 429/408) will not succeed on retry.
        if (response.statusCode() >= 400 && response.statusCode() < 500
                && response.statusCode() != 408 && response.statusCode() != 429) {
            System.err.println("Result report rejected for " + result.getSubmissionId() + ": HTTP " + response.statusCode() + " " + response.body());
            return true;
        }
        System.err.println("Result report failed for " + result.getSubmissionId() + ": HTTP " + response.statusCode() + " " + response.body());
        return false;
    }

    private Map<String, Object> toBody(JudgeResult result) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("submissionId", result.getSubmissionId());
        body.put("verdict", result.getVerdict().name());
        body.put("passedTests", result.getPassedTests());
        body.put("totalTests", result.getTotalTests());
        body.put("executionTimeMs", result.getExecutionTimeMs());
        body.put("errorMessage", result.getErrorMessage());
        body.put("failedTestInput", result.getFailedTestInput());
        body.put("expectedOutput", result.getExpectedOutput());
        body.put("actualOutput", result.getActualOutput());
        return body;
    }
}
