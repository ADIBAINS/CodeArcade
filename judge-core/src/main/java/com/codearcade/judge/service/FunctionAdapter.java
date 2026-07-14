package com.codearcade.judge.service;

import com.codearcade.judge.model.Submission;
import com.codearcade.judge.model.TestCase;
import com.codearcade.judge.util.JsonUtil;

import java.util.ArrayList;
import java.util.List;

/** Builds the small platform-owned driver used by LeetCode-style problems. */
public final class FunctionAdapter {
    private FunctionAdapter() {}

    public static String javaSource(Submission submission, TestCase testCase) {
        List<?> values = arguments(testCase.getInput());
        String[] types = types(submission);
        if (values.size() != types.length) {
            throw new IllegalArgumentException("Expected " + types.length + " arguments, got " + values.size());
        }

        List<String> expressions = new ArrayList<>();
        for (int i = 0; i < types.length; i++) {
            expressions.add(javaLiteral(values.get(i), types[i]));
        }

        return submission.getSourceCode()
                + "\npublic class Main { public static void main(String[] args) { "
                + submission.getReturnType() + " result = new Solution()." + submission.getFunctionName()
                + "(" + String.join(", ", expressions) + "); "
                + "System.out.println(String.valueOf(result)); } }\n";
    }

    public static String cppSource(Submission submission, TestCase testCase) {
        List<?> values = arguments(testCase.getInput());
        String[] types = types(submission);
        if (values.size() != types.length) {
            throw new IllegalArgumentException("Expected " + types.length + " arguments, got " + values.size());
        }

        List<String> expressions = new ArrayList<>();
        for (int i = 0; i < types.length; i++) {
            expressions.add(cppLiteral(values.get(i), types[i]));
        }

        return "#include <bits/stdc++.h>\nusing namespace std;\n"
                + submission.getSourceCode()
                + "\nint main() { Solution solution; auto result = solution." + submission.getFunctionName()
                + "(" + String.join(", ", expressions) + "); cout << result << '\\n'; return 0; }\n";
    }

    private static List<?> arguments(String input) {
        Object parsed = JsonUtil.parse(input);
        if (!(parsed instanceof List<?> list)) {
            throw new IllegalArgumentException("Function test input must be a JSON array of arguments");
        }
        return list;
    }

    private static String[] types(Submission submission) {
        String value = submission.getArgumentTypes() == null ? "" : submission.getArgumentTypes().trim();
        return value.isEmpty() ? new String[0] : value.split("\\s*,\\s*");
    }

    private static String javaLiteral(Object value, String type) {
        if (type.endsWith("[]")) {
            String elementType = type.substring(0, type.length() - 2);
            List<?> items = list(value);
            List<String> literals = new ArrayList<>();
            for (Object item : items) literals.add(javaLiteral(item, elementType));
            return "new " + elementType + "[]{" + String.join(", ", literals) + "}";
        }
        if ("String".equals(type)) return JsonUtil.stringify(String.valueOf(value));
        if ("char".equals(type)) return "'" + String.valueOf(value).replace("'", "\\'") + "'";
        return JsonUtil.stringify(value);
    }

    private static String cppLiteral(Object value, String type) {
        type = type.replace("[]", "");
        if (type.equals("int") && value instanceof List<?>) type = "vector<int>";
        if (type.startsWith("vector<") && type.endsWith(">")) {
            String elementType = type.substring(7, type.length() - 1);
            List<?> items = list(value);
            List<String> literals = new ArrayList<>();
            for (Object item : items) literals.add(cppLiteral(item, elementType));
            return "vector<" + elementType + ">{" + String.join(", ", literals) + "}";
        }
        if ("string".equals(type)) return JsonUtil.stringify(String.valueOf(value));
        if ("bool".equals(type)) return Boolean.TRUE.equals(value) ? "true" : "false";
        return JsonUtil.stringify(value);
    }

    private static List<?> list(Object value) {
        if (!(value instanceof List<?> list)) throw new IllegalArgumentException("Expected an array argument");
        return list;
    }
}
