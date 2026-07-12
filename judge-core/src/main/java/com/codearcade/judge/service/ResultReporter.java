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
    private final HttpClient httpClient;

    public ResultReporter(String apiBaseUrl, String internalToken) {
        this.apiBaseUrl = apiBaseUrl;
        this.internalToken = internalToken;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    }

    public void report(JudgeResult result) {
        try {
            String body = JsonUtil.stringify(toBody(result));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiBaseUrl + "/api/internal/judge/results"))
                    .timeout(Duration.ofSeconds(10))
                    .header("Authorization", "Bearer " + internalToken)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                System.err.println("Result report failed for " + result.getSubmissionId() + ": HTTP " + response.statusCode() + " " + response.body());
            }
        } catch (IOException | InterruptedException error) {
            if (error instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            System.err.println("Result report error for " + result.getSubmissionId() + ": " + error.getMessage());
        }
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
