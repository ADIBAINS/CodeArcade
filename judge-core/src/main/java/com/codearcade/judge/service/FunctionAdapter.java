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
        String[] types = types(submission);
        List<?> values = arguments(testCase.getInput(), types);
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
        String[] types = types(submission);
        List<?> values = arguments(testCase.getInput(), types);
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

    private static List<?> arguments(String input, String[] types) {
        try {
            Object parsed = JsonUtil.parse(input);
            if (parsed instanceof List<?> list && list.size() == types.length) {
                return list;
            }
        } catch (RuntimeException ignored) {
            // Some older function-mode problems still store testcase input in
            // STDIN form, so fall back to token parsing below.
        }

        return stdinArguments(input, types);
    }

    private static List<?> stdinArguments(String input, String[] types) {
        String trimmed = input == null ? "" : input.trim();
        String[] tokens = trimmed.isEmpty() ? new String[0] : trimmed.split("\\s+");
        List<Object> values = new ArrayList<>();
        int index = 0;

        for (String type : types) {
            if (type.endsWith("[]")) {
                String elementType = type.substring(0, type.length() - 2);
                int remaining = tokens.length - index;
                int count = remaining;
                if (remaining > 1 && isInteger(tokens[index])) {
                    int declaredCount = Integer.parseInt(tokens[index]);
                    if (declaredCount >= 0 && declaredCount <= remaining - 1) {
                        count = declaredCount;
                        index++;
                    }
                }

                List<Object> items = new ArrayList<>();
                for (int i = 0; i < count; i++) {
                    items.add(tokenValue(tokens[index++], elementType));
                }
                values.add(items);
                continue;
            }

            if (index >= tokens.length) {
                throw new IllegalArgumentException("Not enough input tokens for function arguments");
            }
            values.add(tokenValue(tokens[index++], type));
        }

        if (index != tokens.length) {
            throw new IllegalArgumentException("Unexpected extra input tokens for function arguments");
        }

        return values;
    }

    private static Object tokenValue(String token, String type) {
        return switch (type.trim()) {
            case "String" -> token;
            case "char" -> token.isEmpty() ? "" : token.substring(0, 1);
            case "boolean", "bool" -> Boolean.parseBoolean(token);
            case "float", "double" -> Double.parseDouble(token);
            default -> Long.parseLong(token);
        };
    }

    private static boolean isInteger(String token) {
        if (token == null || token.isEmpty()) return false;
        int start = token.charAt(0) == '-' ? 1 : 0;
        if (start == token.length()) return false;
        for (int i = start; i < token.length(); i++) {
            if (!Character.isDigit(token.charAt(i))) return false;
        }
        return true;
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
        if ("char".equals(type)) return "'" + escapeJavaChar(String.valueOf(value)) + "'";
        return JsonUtil.stringify(value);
    }

    private static String cppLiteral(Object value, String type) {
        type = cppType(type);
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

    private static String cppType(String type) {
        type = type.trim();
        if (type.endsWith("[]")) {
            return "vector<" + cppType(type.substring(0, type.length() - 2)) + ">";
        }
        return switch (type) {
            case "String" -> "string";
            case "boolean" -> "bool";
            case "long" -> "long long";
            default -> type;
        };
    }

    private static List<?> list(Object value) {
        if (!(value instanceof List<?> list)) throw new IllegalArgumentException("Expected an array argument");
        return list;
    }

    private static String escapeJavaChar(String value) {
        String single = value.isEmpty() ? "" : value.substring(0, 1);
        return switch (single) {
            case "'" -> "\\'";
            case "\\" -> "\\\\";
            case "\n" -> "\\n";
            case "\r" -> "\\r";
            case "\t" -> "\\t";
            default -> single;
        };
    }
}
