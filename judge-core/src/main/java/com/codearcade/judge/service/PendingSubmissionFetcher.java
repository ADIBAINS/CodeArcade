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
    private final HttpClient httpClient;

    public PendingSubmissionFetcher(String apiBaseUrl, String internalToken) {
        this.apiBaseUrl = apiBaseUrl;
        this.internalToken = internalToken;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    }

    public List<Submission> fetchPending(int limit) {
        try {
            String body = JsonUtil.stringify(Map.of("limit", limit));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiBaseUrl + "/api/internal/judge/pending"))
                    .timeout(Duration.ofSeconds(10))
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
            Map<String, Object> map = (Map<String, Object>) item;
            Submission submission = new Submission();
            submission.setId(stringValue(map.get("id")));
            submission.setProblemId(stringValue(map.get("problemId")));
            submission.setLanguage(stringValue(map.get("language")));
            submission.setSourceCode(stringValue(map.get("sourceCode")));
            submission.setTimeLimitMs(intValue(map.get("timeLimitMs")));
            submission.setMemoryLimitMb(intValue(map.get("memoryLimitMb")));
            submission.setJudgeMode(stringValue(map.get("judgeMode")));
            submission.setFunctionName(stringValue(map.get("functionName")));
            submission.setArgumentTypes(stringValue(map.get("argumentTypes")));
            submission.setReturnType(stringValue(map.get("returnType")));
            submission.setTestCases(toTestCases(map.get("testCases")));
            submissions.add(submission);
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
            Map<String, Object> map = (Map<String, Object>) item;
            testCases.add(new TestCase(stringValue(map.get("input")), stringValue(map.get("expected"))));
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
        return Integer.parseInt(String.valueOf(value));
    }
}
