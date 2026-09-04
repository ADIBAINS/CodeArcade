export const javaTemplate = `class Solution {
    public int solve(int a, int b) {
        return a + b;
    }
}`;

export const cppTemplate = `class Solution {
public:
    int solve(int a, int b) {
        return a + b;
    }
};`;

export const javaStdinTemplate = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Read input and print the answer here.
    }
}`;

export const cppStdinTemplate = `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Read input and print the answer here.
    return 0;
}`;

function cppType(type: string): string {
  const trimmed = type.trim();
  if (trimmed.endsWith("[]")) {
    return `vector<${cppType(trimmed.slice(0, -2))}>`;
  }
  return trimmed
    .replace(/^String$/, "string")
    .replace(/^boolean$/, "bool")
    .replace(/^long$/, "long long")
    .replace(/^double$/, "double");
}

function paramName(type: string, index: number, taken: Set<string>): string {
  const base =
    type.endsWith("[]") ? "nums"
    : type === "String" ? "s"
    : type === "char" ? "c"
    : type === "boolean" ? "flag"
    : type === "double" ? "x"
    : index === 0 ? "n"
    : "m";
  if (!taken.has(base)) {
    taken.add(base);
    return base;
  }
  let candidate = `${base}${index}`;
  while (taken.has(candidate)) candidate += "_";
  taken.add(candidate);
  return candidate;
}

export function buildTemplate(
  language: "JAVA" | "CPP",
  problem: { judgeMode: string; functionName: string; argumentTypes: string; returnType: string } | null
): string {
  if (!problem) return language === "JAVA" ? javaTemplate : cppTemplate;
  if (problem.judgeMode !== "FUNCTION") return language === "JAVA" ? javaStdinTemplate : cppStdinTemplate;
  const taken = new Set<string>();
  const args = problem.argumentTypes
    .split(",")
    .map((type, index) => {
      const normalized = language === "CPP" ? cppType(type) : type.trim();
      return `${normalized} ${paramName(type.trim(), index, taken)}`;
    })
    .join(", ");
  const returnType = language === "CPP" ? cppType(problem.returnType) : problem.returnType;
  return language === "JAVA"
    ? `class Solution {\n    public ${returnType} ${problem.functionName}(${args}) {\n        // Return the answer for this test case\n        throw new UnsupportedOperationException();\n    }\n}`
    : `class Solution {\npublic:\n    ${returnType} ${problem.functionName}(${args}) {\n        // Return the answer for this test case\n    }\n};`;
}
