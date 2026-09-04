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
        int requestedTests = submission.getTestCases() == null ? 0 : submission.getTestCases().size();
        int totalTests = Math.min(requestedTests, config.getMaxTestCases());

        if (submission.getSourceCode() == null || submission.getSourceCode().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > config.getMaxSourceBytes()) {
            return new JudgeResult(submission.getId(), Verdict.CE, 0, totalTests, 0, "Source code too large");
        }
        int timeLimitMs = Math.min(Math.max(submission.getTimeLimitMs(), 500), 10000);
        int memoryLimitMb = Math.min(Math.max(submission.getMemoryLimitMb(), 64), 1024);

        try {
            workspace = createWorkspace(submission.getId());
            boolean functionMode = "FUNCTION".equalsIgnoreCase(submission.getJudgeMode());
            File workspaceFile = workspace.toFile();
            List<TestCase> cases = submission.getTestCases() == null ? List.of() : submission.getTestCases().subList(0, totalTests);

            if (functionMode) {
                // Single harness for all cases: compile ONCE, then run once per
                // case index. The harness prints results in canonical form.
                writeFunctionHarness(submission, cases, workspace);
            } else {
                writeSourceCode(submission, workspace);
            }
            copyRunWrapper(workspace);

            if (totalTests > 0 || !functionMode) {
                CompilerService.CompileResult compileResult = compilerService.compile(submission.getLanguage(), workspaceFile);
                System.out.println("compile submission=" + submission.getId() + " ok=" + compileResult.ok()
                        + " exit=" + compileResult.exitCode());
                if (!compileResult.ok()) {
                    String diagnostics = compileResult.output() == null || compileResult.output().isBlank()
                            ? "Compilation Error"
                            : trimError(compileResult.output());
                    return new JudgeResult(submission.getId(), Verdict.CE, 0, totalTests, 0, diagnostics);
                }
            }

            int passed = 0;
            long maxExecutionTime = 0;
            List<String> runCommand = compilerService.getRunCommand(submission.getLanguage(), memoryLimitMb, workspaceFile);

            for (int i = 0; i < cases.size(); i++) {
                TestCase testCase = cases.get(i);
                List<String> command = runCommand;
                String stdin = testCase.getInput();
                if (functionMode) {
                    command = new java.util.ArrayList<>(runCommand);
                    command.add(String.valueOf(i));
                    stdin = "";
                }
                ExecutionResult executionResult = executionService.execute(command, workspaceFile, stdin, timeLimitMs);

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
                    String message = trimError(executionResult.getError());
                    Verdict verdict = Verdict.RE;
                    // Docker OOM-kill (137) and cgroup kills surface as plain
                    // non-zero exits; report them as MLE, not generic RE.
                    if (executionResult.getExitCode() == 137) {
                        verdict = Verdict.MLE;
                        message = "Memory Limit Exceeded";
                    }
                    System.out.println("run submission=" + submission.getId() + " case=" + i
                            + " exit=" + executionResult.getExitCode() + " verdict=" + verdict);
                    return new JudgeResult(
                            submission.getId(),
                            verdict,
                            passed,
                            totalTests,
                            maxExecutionTime,
                            message.isBlank() ? verdict.name() : message,
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
            System.out.println("judge submission=" + submission.getId() + " error=" + error.getMessage());
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

    private void writeFunctionHarness(Submission submission, List<TestCase> cases, Path workspace) throws IOException {
        String source = "JAVA".equalsIgnoreCase(submission.getLanguage())
                ? FunctionAdapter.javaHarness(submission, cases)
                : FunctionAdapter.cppHarness(submission, cases);
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
