package com.codearcade.judge.service;

import com.codearcade.judge.config.JudgeConfig;
import com.codearcade.judge.model.ExecutionResult;
import com.codearcade.judge.model.JudgeResult;
import com.codearcade.judge.model.Submission;
import com.codearcade.judge.model.TestCase;
import com.codearcade.judge.model.Verdict;
import com.codearcade.judge.util.FileUtil;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;

public class JudgeService {
    private final JudgeConfig config;
    private final CompilerService compilerService;
    private final ExecutionService executionService;
    private final OutputComparator outputComparator;

    public JudgeService(JudgeConfig config, CompilerService compilerService, ExecutionService executionService, OutputComparator outputComparator) {
        this.config = config;
        this.compilerService = compilerService;
        this.executionService = executionService;
        this.outputComparator = outputComparator;
    }

    public JudgeResult judge(Submission submission) {
        Path workspace = null;
        int totalTests = submission.getTestCases() == null ? 0 : submission.getTestCases().size();

        try {
            workspace = createWorkspace(submission.getId());
            writeSourceCode(submission, workspace);
            copyRunWrapper(workspace);

            boolean functionMode = "FUNCTION".equalsIgnoreCase(submission.getJudgeMode());
            if (!functionMode && !compilerService.compile(submission.getLanguage(), workspace.toFile())) {
                return new JudgeResult(submission.getId(), Verdict.CE, 0, totalTests, 0, "Compilation Error");
            }

            int passed = 0;
            long maxExecutionTime = 0;
            File workspaceFile = workspace.toFile();
            List<String> runCommand = compilerService.getRunCommand(submission.getLanguage(), submission.getMemoryLimitMb(), workspaceFile);

            for (TestCase testCase : submission.getTestCases()) {
                if (functionMode) {
                    writeFunctionDriver(submission, testCase, workspace);
                    if (!compilerService.compile(submission.getLanguage(), workspace.toFile())) {
                        return new JudgeResult(submission.getId(), Verdict.CE, passed, totalTests, maxExecutionTime, "Compilation Error");
                    }
                }
                ExecutionResult executionResult = executionService.execute(
                        runCommand, workspaceFile,
                        functionMode ? "" : testCase.getInput(),
                        submission.getTimeLimitMs());

                maxExecutionTime = Math.max(maxExecutionTime, executionResult.getExecutionTimeMs());

                if (executionResult.isTimeout()) {
                    return new JudgeResult(
                            submission.getId(),
                            Verdict.TLE,
                            passed,
                            totalTests,
                            maxExecutionTime,
                            "Time Limit Exceeded",
                            testCase.getInput(),
                            testCase.getExpected(),
                            executionResult.getOutput()
                    );
                }

                if (executionResult.getExitCode() != 0) {
                    return new JudgeResult(
                            submission.getId(),
                            Verdict.RE,
                            passed,
                            totalTests,
                            maxExecutionTime,
                            trimError(executionResult.getError()),
                            testCase.getInput(),
                            testCase.getExpected(),
                            executionResult.getOutput()
                    );
                }

                if (!outputComparator.compare(executionResult.getOutput(), testCase.getExpected())) {
                    return new JudgeResult(
                            submission.getId(),
                            Verdict.WA,
                            passed,
                            totalTests,
                            maxExecutionTime,
                            "Wrong Answer",
                            testCase.getInput(),
                            testCase.getExpected(),
                            executionResult.getOutput()
                    );
                }

                passed++;
            }

            return new JudgeResult(submission.getId(), Verdict.AC, passed, totalTests, maxExecutionTime, null);
        } catch (Exception error) {
            return new JudgeResult(submission.getId(), Verdict.RE, 0, totalTests, 0, error.getMessage());
        } finally {
            FileUtil.deleteRecursively(workspace);
        }
    }

    private Path createWorkspace(String submissionId) throws IOException {
        Files.createDirectories(config.getWorkspaceRoot());
        String safePrefix = "submission-" + submissionId.replaceAll("[^a-zA-Z0-9_-]", "");
        return Files.createTempDirectory(config.getWorkspaceRoot(), safePrefix);
    }

    private void writeSourceCode(Submission submission, Path workspace) throws IOException {
        String fileName = "JAVA".equalsIgnoreCase(submission.getLanguage()) ? "Main.java" : "Main.cpp";
        Files.writeString(workspace.resolve(fileName), submission.getSourceCode());
    }

    private void writeFunctionDriver(Submission submission, TestCase testCase, Path workspace) throws IOException {
        String source = "JAVA".equalsIgnoreCase(submission.getLanguage())
                ? FunctionAdapter.javaSource(submission, testCase)
                : FunctionAdapter.cppSource(submission, testCase);
        String fileName = "JAVA".equalsIgnoreCase(submission.getLanguage()) ? "Main.java" : "Main.cpp";
        Files.writeString(workspace.resolve(fileName), source);
    }

    private void copyRunWrapper(Path workspace) throws IOException {
        try (InputStream stream = JudgeService.class.getResourceAsStream("/run.sh")) {
            if (stream == null) {
                throw new IOException("run.sh resource not found");
            }
            Path target = workspace.resolve("run.sh");
            Files.copy(stream, target, StandardCopyOption.REPLACE_EXISTING);
            target.toFile().setExecutable(true);
        }
    }

    private String trimError(String value) {
        if (value == null || value.isBlank()) {
            return "Runtime Error";
        }
        return value.length() > 2000 ? value.substring(0, 2000) : value;
    }
}
