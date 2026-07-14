package com.codearcade.judge.service;

import com.codearcade.judge.config.JudgeConfig;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class DockerCommandFactory {
    private final JudgeConfig config;

    public DockerCommandFactory(JudgeConfig config) {
        this.config = config;
    }

    public List<String> compileCommand(String language, File workspace) {
        int memoryLimitMb = Math.max(config.getCompilerMemoryMb(), 256);
        String image = imageFor(language);
        List<String> languageCommand = "JAVA".equalsIgnoreCase(language)
                ? List.of("javac", "Main.java")
                : List.of("g++", "Main.cpp", "-O2", "-o", "Main");

        return dockerCommand(image, workspace, false, memoryLimitMb, languageCommand);
    }

    public List<String> runCommand(String language, File workspace, int memoryLimitMb) {
        String image = imageFor(language);
        List<String> languageCommand = "JAVA".equalsIgnoreCase(language)
                ? List.of("java", "-Xmx" + memoryLimitMb + "m", "Main")
                : List.of("/workspace/run.sh", String.valueOf(memoryLimitMb * 1024), "/workspace/Main");

        return dockerCommand(image, workspace, true, memoryLimitMb, languageCommand);
    }

    private List<String> dockerCommand(
            String image,
            File workspace,
            boolean readOnlyWorkspace,
            int memoryLimitMb,
            List<String> languageCommand
    ) {
        List<String> command = new ArrayList<>();
        command.add(config.getDockerBinary());
        command.add("run");
        command.add("--rm");
        command.add("--network");
        command.add("none");
        command.add("--memory");
        command.add(memoryLimitMb + "m");
        command.add("--memory-swap");
        command.add(memoryLimitMb + "m");
        command.add("--pids-limit");
        command.add("128");
        command.add("--cpus");
        command.add(config.getDockerCpuLimit());
        command.add("--cap-drop");
        command.add("ALL");
        command.add("--security-opt");
        command.add("no-new-privileges");
        command.add("--read-only");
        command.add("--tmpfs");
        command.add("/tmp:rw,nosuid,size=128m");
        command.add("--user");
        command.add(config.getDockerUser());
        command.add("-v");
        command.add(config.getDockerWorkspacePath(workspace.toPath()).toAbsolutePath() + ":/workspace" + (readOnlyWorkspace ? ":ro" : ""));
        command.add("-w");
        command.add("/workspace");
        command.add(image);
        command.addAll(languageCommand);
        return command;
    }

    private String imageFor(String language) {
        if ("JAVA".equalsIgnoreCase(language)) {
            return config.getJavaDockerImage();
        }

        if ("CPP".equalsIgnoreCase(language)) {
            return config.getCppDockerImage();
        }

        throw new IllegalArgumentException("Unsupported language: " + language);
    }
}
