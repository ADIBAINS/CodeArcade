package com.codearcade.judge.config;

import java.nio.file.Path;

public class JudgeConfig {
    private final String apiBaseUrl;
    private final String internalToken;
    private final int workerCount;
    private final int pollIntervalMs;
    private final int fetchLimit;
    private final Path workspaceRoot;
    private final Path dockerWorkspaceRoot;
    private final String executionMode;
    private final String dockerBinary;
    private final String javaDockerImage;
    private final String cppDockerImage;
    private final String dockerUser;
    private final String dockerCpuLimit;
    private final int compilerMemoryMb;
    private final int compileTimeoutSeconds;
    private final int httpConnectTimeoutSeconds;
    private final int httpRequestTimeoutSeconds;
    private final int maxSourceBytes;
    private final int maxTestCases;
    private final int maxOutputBytes;

    public JudgeConfig(
            String apiBaseUrl,
            String internalToken,
            int workerCount,
            int pollIntervalMs,
            int fetchLimit,
            Path workspaceRoot,
            Path dockerWorkspaceRoot,
            String executionMode,
            String dockerBinary,
            String javaDockerImage,
            String cppDockerImage,
            String dockerUser,
            String dockerCpuLimit,
            int compilerMemoryMb,
            int compileTimeoutSeconds,
            int httpConnectTimeoutSeconds,
            int httpRequestTimeoutSeconds,
            int maxSourceBytes,
            int maxTestCases,
            int maxOutputBytes
    ) {
        this.apiBaseUrl = apiBaseUrl;
        this.internalToken = internalToken;
        this.workerCount = workerCount;
        this.pollIntervalMs = pollIntervalMs;
        this.fetchLimit = fetchLimit;
        this.workspaceRoot = workspaceRoot;
        this.dockerWorkspaceRoot = dockerWorkspaceRoot;
        this.executionMode = executionMode;
        this.dockerBinary = dockerBinary;
        this.javaDockerImage = javaDockerImage;
        this.cppDockerImage = cppDockerImage;
        this.dockerUser = dockerUser;
        this.dockerCpuLimit = dockerCpuLimit;
        this.compilerMemoryMb = compilerMemoryMb;
        this.compileTimeoutSeconds = compileTimeoutSeconds;
        this.httpConnectTimeoutSeconds = httpConnectTimeoutSeconds;
        this.httpRequestTimeoutSeconds = httpRequestTimeoutSeconds;
        this.maxSourceBytes = maxSourceBytes;
        this.maxTestCases = maxTestCases;
        this.maxOutputBytes = maxOutputBytes;
    }

    public static JudgeConfig fromEnvironment() {
        boolean production = isProduction();
        String executionMode = env("JUDGE_EXECUTION_MODE", production ? "" : "local");

        if (production && !"docker".equalsIgnoreCase(executionMode)) {
            throw new IllegalStateException("JUDGE_EXECUTION_MODE=docker is required in production");
        }

        int workerCount = intEnv("JUDGE_WORKER_COUNT", 3);
        int pollIntervalMs = intEnv("JUDGE_POLL_INTERVAL_MS", 3000);
        int fetchLimit = intEnv("JUDGE_FETCH_LIMIT", 5);
        if (workerCount <= 0 || workerCount > 32) {
            throw new IllegalStateException("JUDGE_WORKER_COUNT must be between 1 and 32");
        }
        if (pollIntervalMs < 500 || pollIntervalMs > 60000) {
            throw new IllegalStateException("JUDGE_POLL_INTERVAL_MS must be between 500 and 60000");
        }
        if (fetchLimit <= 0 || fetchLimit > 50) {
            throw new IllegalStateException("JUDGE_FETCH_LIMIT must be between 1 and 50");
        }

        return new JudgeConfig(
                production ? requiredEnv("API_BASE_URL") : env("API_BASE_URL", "http://localhost:4000"),
                production ? requiredSecret("INTERNAL_JUDGE_TOKEN", "judge-secret-token", "change-me-use-openssl-rand-hex-32") : env("INTERNAL_JUDGE_TOKEN", "judge-secret-token"),
                workerCount,
                pollIntervalMs,
                fetchLimit,
                Path.of(env("JUDGE_WORKSPACE_ROOT", "/app/workspaces")).toAbsolutePath(),
                Path.of(env("JUDGE_DOCKER_WORKSPACE_ROOT", env("JUDGE_WORKSPACE_ROOT", "/app/workspaces"))).toAbsolutePath(),
                executionMode,
                env("JUDGE_DOCKER_BINARY", "docker"),
                env("JUDGE_JAVA_IMAGE", "eclipse-temurin:17-jdk"),
                env("JUDGE_CPP_IMAGE", "gcc:14"),
                env("JUDGE_DOCKER_USER", detectDockerUser()),
                env("JUDGE_DOCKER_CPUS", "1"),
                intEnv("JUDGE_COMPILER_MEMORY_MB", 512),
                intEnv("JUDGE_COMPILE_TIMEOUT_SECONDS", 20),
                intEnv("JUDGE_HTTP_CONNECT_TIMEOUT_SECONDS", 5),
                intEnv("JUDGE_HTTP_REQUEST_TIMEOUT_SECONDS", 10),
                intEnv("JUDGE_MAX_SOURCE_BYTES", 20000),
                intEnv("JUDGE_MAX_TESTCASES", 100),
                intEnv("JUDGE_MAX_OUTPUT_BYTES", 1024 * 1024)
        );
    }

    private static String requiredEnv(String key) {
        String value = System.getenv(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(key + " is required");
        }
        return value;
    }

    private static String requiredSecret(String key, String... rejectedValues) {
        String value = requiredEnv(key);
        for (String rejectedValue : rejectedValues) {
            if (rejectedValue.equals(value)) {
                throw new IllegalStateException(key + " must be changed before running in production");
            }
        }
        return value;
    }

    private static String env(String key, String fallback) {
        String value = System.getenv(key);
        return value == null || value.isBlank() ? fallback : value;
    }

    private static int intEnv(String key, int fallback) {
        String value = System.getenv(key);
        if (value == null || value.isBlank()) {
            return fallback;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException error) {
            throw new IllegalStateException(key + " must be an integer, got: " + value);
        }
    }

    private static boolean isProduction() {
        return "production".equalsIgnoreCase(System.getenv("CODEARCADE_ENV"))
                || "production".equalsIgnoreCase(System.getenv("NODE_ENV"));
    }

    private static String detectDockerUser() {
        try {
            String uid = runAndRead("id", "-u");
            String gid = runAndRead("id", "-g");
            return uid + ":" + gid;
        } catch (Exception ignored) {
            return "1000:1000";
        }
    }

    private static String runAndRead(String... command) throws Exception {
        Process process = new ProcessBuilder(command).start();
        if (!process.waitFor(2, java.util.concurrent.TimeUnit.SECONDS) || process.exitValue() != 0) {
            throw new IllegalStateException("Command failed");
        }
        return new String(process.getInputStream().readAllBytes()).trim();
    }

    public String getApiBaseUrl() {
        return apiBaseUrl;
    }

    public String getInternalToken() {
        return internalToken;
    }

    public int getWorkerCount() {
        return workerCount;
    }

    public int getPollIntervalMs() {
        return pollIntervalMs;
    }

    public int getFetchLimit() {
        return fetchLimit;
    }

    public Path getWorkspaceRoot() {
        return workspaceRoot;
    }

    public Path getDockerWorkspacePath(Path workspace) {
        return dockerWorkspaceRoot.resolve(workspaceRoot.relativize(workspace));
    }

    public String getExecutionMode() {
        return executionMode;
    }

    public boolean isDockerExecutionMode() {
        return "docker".equalsIgnoreCase(executionMode);
    }

    public String getDockerBinary() {
        return dockerBinary;
    }

    public String getJavaDockerImage() {
        return javaDockerImage;
    }

    public String getCppDockerImage() {
        return cppDockerImage;
    }

    public String getDockerUser() {
        return dockerUser;
    }

    public String getDockerCpuLimit() {
        return dockerCpuLimit;
    }

    public int getCompilerMemoryMb() {
        return compilerMemoryMb;
    }

    public int getCompileTimeoutSeconds() {
        return compileTimeoutSeconds;
    }

    public int getHttpConnectTimeoutSeconds() {
        return httpConnectTimeoutSeconds;
    }

    public int getHttpRequestTimeoutSeconds() {
        return httpRequestTimeoutSeconds;
    }

    public int getMaxSourceBytes() {
        return maxSourceBytes;
    }

    public int getMaxTestCases() {
        return maxTestCases;
    }

    public int getMaxOutputBytes() {
        return maxOutputBytes;
    }
}
