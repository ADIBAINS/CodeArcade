package com.codearcade.judge.service;

import com.codearcade.judge.model.Submission;
import com.codearcade.judge.model.TestCase;
import com.codearcade.judge.util.JsonUtil;

import java.util.ArrayList;
import java.util.List;

/**
 * Builds the platform-owned driver used by LeetCode-style (FUNCTION) problems.
 *
 * <p>One harness source covers every testcase: the case index arrives as the first program
 * argument, so each submission is compiled ONCE and executed once per case. Both languages
 * share a canonical result format:
 * <ul>
 *   <li>{@code boolean} prints {@code true} / {@code false} (never {@code 1}/{@code 0})</li>
 *   <li>integral {@code double}s print without a decimal point ({@code 2}, not {@code 2.0})</li>
 *   <li>arrays print as {@code [a, b, c]} with the same element rules on both sides</li>
 *   <li>{@code int}, {@code long}, {@code char} and {@code String} print plainly</li>
 * </ul>
 */
public final class FunctionAdapter {
    private FunctionAdapter() {}

    /** Full Java source: user code plus an indexed-dispatch {@code Main}. */
    public static String javaHarness(Submission submission, List<TestCase> cases) {
        String[] types = validatedTypes(submission);
        String returnType = returnType(submission);
        StringBuilder dispatch = new StringBuilder();
        for (int i = 0; i < cases.size(); i++) {
            List<?> values = arguments(cases.get(i).getInput(), types, i);
            if (values.size() != types.length) {
                throw new IllegalArgumentException("Case " + i + ": expected " + types.length + " arguments, got " + values.size());
            }
            List<String> expressions = new ArrayList<>();
            for (int j = 0; j < types.length; j++) {
                expressions.add(javaLiteral(values.get(j), types[j]));
            }
            dispatch.append("            case ").append(i).append(": result = new Solution().")
                    .append(submission.getFunctionName()).append("(").append(String.join(", ", expressions)).append("); break;\n");
        }

        return submission.getSourceCode()
                + "\npublic class Main {\n"
                + javaHelpers(returnType)
                + "    public static void main(String[] args) {\n"
                + "        if (args.length < 1) throw new IllegalArgumentException(\"Missing test case index\");\n"
                + "        int caseIndex = Integer.parseInt(args[0]);\n"
                + "        " + returnType + " result;\n"
                + "        switch (caseIndex) {\n"
                + dispatch
                + "            default: throw new IllegalArgumentException(\"Unknown test case: \" + caseIndex);\n"
                + "        }\n"
                + "        " + javaPrint("result", returnType) + "\n"
                + "    }\n"
                + "}\n";
    }

    /** Full C++ source: user code plus an indexed-dispatch {@code main}. */
    public static String cppHarness(Submission submission, List<TestCase> cases) {
        String[] types = validatedTypes(submission);
        String returnType = cppType(returnType(submission));
        StringBuilder dispatch = new StringBuilder();
        for (int i = 0; i < cases.size(); i++) {
            List<?> values = arguments(cases.get(i).getInput(), types, i);
            if (values.size() != types.length) {
                throw new IllegalArgumentException("Case " + i + ": expected " + types.length + " arguments, got " + values.size());
            }
            List<String> expressions = new ArrayList<>();
            for (int j = 0; j < types.length; j++) {
                expressions.add(cppLiteral(values.get(j), types[j]));
            }
            dispatch.append("        case ").append(i).append(": { Solution solution; result = solution.")
                    .append(submission.getFunctionName()).append("(").append(String.join(", ", expressions)).append("); break; }\n");
        }

        return "#include <bits/stdc++.h>\nusing namespace std;\n"
                + submission.getSourceCode()
                + "\n"
                + cppHelpers(returnType)
                + "int main(int argc, char** argv) {\n"
                + "    if (argc < 2) return 2;\n"
                + "    int caseIndex = atoi(argv[1]);\n"
                + "    " + returnType + " result;\n"
                + "    switch (caseIndex) {\n"
                + dispatch
                + "        default: return 2;\n"
                + "    }\n"
                + "    " + cppPrint("result", returnType) + "\n"
                + "    return 0;\n"
                + "}\n";
    }

    private static String javaPrint(String value, String returnType) {
        if ("boolean".equals(returnType)) {
            return "System.out.println(" + value + " ? \"true\" : \"false\");";
        }
        if ("double".equals(returnType)) {
            return "System.out.println(d2s(" + value + "));";
        }
        if (returnType.endsWith("[]")) {
            return "System.out.println(a2s(" + value + "));";
        }
        return "System.out.println(String.valueOf(" + value + "));";
    }

    private static String javaHelpers(String returnType) {
        StringBuilder helpers = new StringBuilder();
        if (needsDoubleHelper(returnType)) {
            helpers.append("    private static String d2s(double v) {\n")
                    .append("        if (Double.isFinite(v) && v == Math.rint(v) && Math.abs(v) < 9007199254740992.0) return String.valueOf((long) v);\n")
                    .append("        return String.valueOf(v);\n")
                    .append("    }\n");
        }
        if (returnType.endsWith("[]")) {
            String element = returnType.substring(0, returnType.length() - 2);
            helpers.append("    private static String a2s(").append(element).append("[] a) {\n")
                    .append("        StringBuilder sb = new StringBuilder(\"[\");\n")
                    .append("        for (int i = 0; i < a.length; i++) {\n")
                    .append("            if (i > 0) sb.append(\", \");\n")
                    .append("            sb.append(").append(javaElement(element)).append(");\n")
                    .append("        }\n")
                    .append("        return sb.append(\"]\").toString();\n")
                    .append("    }\n");
        }
        return helpers.toString();
    }

    private static String javaElement(String element) {
        return switch (element) {
            case "boolean" -> "a[i] ? \"true\" : \"false\"";
            case "double" -> "d2s(a[i])";
            default -> "String.valueOf(a[i])";
        };
    }

    private static String cppPrint(String value, String returnType) {
        if ("bool".equals(returnType)) {
            return "cout << (" + value + " ? \"true\" : \"false\") << '\\n';";
        }
        if ("double".equals(returnType)) {
            return "cout << d2s(" + value + ") << '\\n';";
        }
        if (returnType.startsWith("vector<")) {
            return "cout << a2s(" + value + ") << '\\n';";
        }
        return "cout << " + value + " << '\\n';";
    }

    private static String cppHelpers(String returnType) {
        StringBuilder helpers = new StringBuilder();
        if (needsDoubleHelper(returnType)) {
            helpers.append("static std::string d2s(double v) {\n")
                    .append("    if (std::isfinite(v) && v == std::floor(v) && std::fabs(v) < 9007199254740992.0) { std::ostringstream o; o << (long long) v; return o.str(); }\n")
                    .append("    std::ostringstream o; o << std::setprecision(17) << v; return o.str();\n")
                    .append("}\n");
        }
        if (returnType.startsWith("vector<") && returnType.endsWith(">")) {
            String element = returnType.substring(7, returnType.length() - 1);
            helpers.append("static std::string a2s(const ").append(returnType).append("& a) {\n")
                    .append("    std::ostringstream o; o << \"[\";\n")
                    .append("    for (size_t i = 0; i < a.size(); i++) { if (i) o << \", \"; o << ").append(cppElement(element)).append("; }\n")
                    .append("    o << \"]\"; return o.str();\n")
                    .append("}\n");
        }
        return helpers.toString();
    }

    private static String cppElement(String element) {
        return switch (element) {
            case "bool" -> "(a[i] ? \"true\" : \"false\")";
            case "double" -> "d2s(a[i])";
            default -> "a[i]";
        };
    }

    private static boolean needsDoubleHelper(String returnType) {
        return "double".equals(returnType) || "double[]".equals(returnType) || "vector<double>".equals(returnType);
    }

    private static String returnType(Submission submission) {
        String value = submission.getReturnType() == null ? "" : submission.getReturnType().trim();
        return value.isEmpty() ? "int" : value;
    }

    private static String[] validatedTypes(Submission submission) {
        String[] typeList = types(submission);
        for (String type : typeList) {
            if (type.contains("][") || (type.endsWith("]") && !type.endsWith("[]"))) {
                throw new IllegalArgumentException("Nested arrays are not supported: " + type);
            }
        }
        return typeList;
    }

    private static List<?> arguments(String input, String[] types, int caseIndex) {
        try {
            Object parsed = JsonUtil.parse(input);
            if (parsed instanceof List<?> list && list.size() == types.length) {
                return list;
            }
        } catch (RuntimeException ignored) {
            // Some older function-mode problems still store testcase input in
            // STDIN form, so fall back to token parsing below.
        }

        try {
            return stdinArguments(input, types);
        } catch (IllegalArgumentException error) {
            throw new IllegalArgumentException("Case " + caseIndex + ": " + error.getMessage(), error);
        }
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
