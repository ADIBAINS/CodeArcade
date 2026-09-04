package com.codearcade.judge.service;

import com.codearcade.judge.model.Submission;
import com.codearcade.judge.model.TestCase;
import com.codearcade.judge.util.JsonUtil;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class PendingSubmissionFetcher {
    private final String apiBaseUrl;
    private final String internalToken;
    private final int requestTimeoutSeconds;
    private final HttpClient httpClient;

    public PendingSubmissionFetcher(String apiBaseUrl, String internalToken) {
        this(apiBaseUrl, internalToken, 5, 10);
    }

    public PendingSubmissionFetcher(String apiBaseUrl, String internalToken, int connectTimeoutSeconds, int requestTimeoutSeconds) {
        this.apiBaseUrl = apiBaseUrl;
        this.internalToken = internalToken;
        this.requestTimeoutSeconds = Math.max(1, requestTimeoutSeconds);
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(Math.max(1, connectTimeoutSeconds))).build();
    }

    public List<Submission> fetchPending(int limit) {
        try {
            String body = JsonUtil.stringify(Map.of("limit", limit));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiBaseUrl + "/api/internal/judge/pending"))
                    .timeout(Duration.ofSeconds(requestTimeoutSeconds))
                    .header("Authorization", "Bearer " + internalToken)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                System.err.println("Pending fetch failed: HTTP " + response.statusCode() + " " + response.body());
                return List.of();
            }

            return toSubmissions(JsonUtil.parse(response.body()));
        } catch (IOException | InterruptedException error) {
            if (error instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            System.err.println("Pending fetch error: " + error.getMessage());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Submission> toSubmissions(Object parsed) {
        if (!(parsed instanceof List<?> items)) {
            return List.of();
        }

        List<Submission> submissions = new ArrayList<>();
        for (Object item : items) {
            try {
                if (!(item instanceof Map<?, ?> raw)) {
                    continue;
                }
                Map<String, Object> map = (Map<String, Object>) raw;
                Submission submission = new Submission();
                submission.setId(stringValue(map.get("id")));
                submission.setProblemId(stringValue(map.get("problemId")));
                submission.setLanguage(stringValue(map.get("language")));
                submission.setSourceCode(stringValue(map.get("sourceCode")));
                submission.setTimeLimitMs(clampedInt(map.get("timeLimitMs"), 500, 10000, 2000));
                submission.setMemoryLimitMb(clampedInt(map.get("memoryLimitMb"), 64, 1024, 256));
                submission.setJudgeMode(stringValue(map.get("judgeMode")));
                submission.setFunctionName(stringValue(map.get("functionName")));
                submission.setArgumentTypes(stringValue(map.get("argumentTypes")));
                submission.setReturnType(stringValue(map.get("returnType")));
                submission.setTestCases(toTestCases(map.get("testCases")));
                if (submission.getId().isBlank() || submission.getSourceCode().isBlank()) {
                    continue;
                }
                submissions.add(submission);
            } catch (RuntimeException error) {
                // Skip poison items without killing the whole fetch loop.
                System.err.println("Skipping malformed submission payload: " + error.getMessage());
            }
        }
        return submissions;
    }

    @SuppressWarnings("unchecked")
    private List<TestCase> toTestCases(Object parsed) {
        if (!(parsed instanceof List<?> items)) {
            return List.of();
        }

        List<TestCase> testCases = new ArrayList<>();
        for (Object item : items) {
            try {
                if (!(item instanceof Map<?, ?> raw)) {
                    continue;
                }
                Map<String, Object> map = (Map<String, Object>) raw;
                testCases.add(new TestCase(stringValue(map.get("input")), stringValue(map.get("expected"))));
            } catch (RuntimeException ignored) {
            }
        }
        return testCases;
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private int intValue(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (NumberFormatException error) {
            return 0;
        }
    }

    private int clampedInt(Object value, int min, int max, int fallback) {
        int parsed = intValue(value);
        if (parsed < min || parsed > max) {
            return fallback;
        }
        return parsed;
    }
}
