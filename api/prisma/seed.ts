import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const demoProblems = [
  {
    title: "Add Two Numbers",
    slug: "add-two-numbers",
    statement: "Given two integers, print their sum.",
    inputFormat: "The function receives two integers a and b.",
    outputFormat: "Return the sum of a and b.",
    constraints: "-10^9 <= a, b <= 10^9",
    difficulty: "EASY" as const,
    testCases: [
      { input: "[2,3]", expected: "5", isHidden: false },
      { input: "[-4,10]", expected: "6", isHidden: true }
    ],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int,int", returnType: "int"
  },
  {
    title: "Maximum of Array",
    slug: "maximum-of-array",
    statement: "Given an array of integers, print the maximum element.",
    inputFormat: "The function receives an integer array nums.",
    outputFormat: "Return the maximum element in nums.",
    constraints: "1 <= n <= 100000, -10^9 <= ai <= 10^9",
    difficulty: "EASY" as const,
    testCases: [
      { input: "[[1,8,2,4,3]]", expected: "8", isHidden: false },
      { input: "[[-7,-2,-9]]", expected: "-2", isHidden: true }
    ],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Palindrome String",
    slug: "palindrome-string",
    statement: "Given a string, print YES if it is a palindrome, otherwise print NO.",
    inputFormat: "The function receives a lowercase string s.",
    outputFormat: "Return YES if s is a palindrome, otherwise return NO.",
    constraints: "1 <= |s| <= 100000",
    difficulty: "MEDIUM" as const,
    testCases: [
      { input: "[\"madam\"]", expected: "YES", isHidden: false },
      { input: "[\"code\"]", expected: "NO", isHidden: true }
    ],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String", returnType: "String"
  },
  {
    title: "Difference of Two Numbers", slug: "difference-of-two-numbers",
    statement: "Given two integers a and b, return a - b.",
    inputFormat: "The function receives two integers a and b.", outputFormat: "Return a - b.",
    constraints: "-10^9 <= a, b <= 10^9", difficulty: "EASY" as const,
    testCases: [{ input: "[10,4]", expected: "6", isHidden: false }, { input: "[-3,8]", expected: "-11", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int,int", returnType: "int"
  },
  {
    title: "Multiply Two Numbers", slug: "multiply-two-numbers",
    statement: "Given two integers, return their product.",
    inputFormat: "The function receives two integers a and b.", outputFormat: "Return a * b.",
    constraints: "-10^4 <= a, b <= 10^4", difficulty: "EASY" as const,
    testCases: [{ input: "[6,7]", expected: "42", isHidden: false }, { input: "[-5,9]", expected: "-45", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int,int", returnType: "int"
  },
  {
    title: "Even or Odd", slug: "even-or-odd",
    statement: "Determine whether an integer is even or odd.",
    inputFormat: "The function receives an integer n.", outputFormat: "Return the string EVEN or ODD.",
    constraints: "-10^9 <= n <= 10^9", difficulty: "EASY" as const,
    testCases: [{ input: "[14]", expected: "EVEN", isHidden: false }, { input: "[-9]", expected: "ODD", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "String"
  },
  {
    title: "Reverse a String", slug: "reverse-a-string",
    statement: "Return the characters of a string in reverse order.",
    inputFormat: "The function receives a lowercase string s.", outputFormat: "Return the reversed string.",
    constraints: "1 <= |s| <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[\"hello\"]", expected: "olleh", isHidden: false }, { input: "[\"arcade\"]", expected: "edacra", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String", returnType: "String"
  },
  {
    title: "Count Vowels", slug: "count-vowels",
    statement: "Count the vowels a, e, i, o, and u in a string.",
    inputFormat: "The function receives a lowercase string s.", outputFormat: "Return the number of vowels.",
    constraints: "1 <= |s| <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[\"leetcode\"]", expected: "4", isHidden: false }, { input: "[\"rhythm\"]", expected: "0", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String", returnType: "int"
  },
  {
    title: "Sum of Array", slug: "sum-of-array",
    statement: "Return the sum of all elements in an integer array.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return the array sum.",
    constraints: "1 <= nums.length <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[[1,2,3,4,5]]", expected: "15", isHidden: false }, { input: "[[-5,2,-7]]", expected: "-10", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Count Positive Numbers", slug: "count-positive-numbers",
    statement: "Count how many elements in an array are strictly positive.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return the positive-element count.",
    constraints: "1 <= nums.length <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[[-2,0,4,7,-1]]", expected: "2", isHidden: false }, { input: "[[1,2,3]]", expected: "3", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Second Largest Element", slug: "second-largest-element",
    statement: "Return the second largest distinct value in an array.",
    inputFormat: "The function receives an array with at least two distinct integers.", outputFormat: "Return the second largest value.",
    constraints: "2 <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[3,8,1,8,5]]", expected: "5", isHidden: false }, { input: "[[-10,-3,-7]]", expected: "-7", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Factorial", slug: "factorial",
    statement: "Return n factorial, n!.",
    inputFormat: "The function receives a non-negative integer n.", outputFormat: "Return n!.",
    constraints: "0 <= n <= 20", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[5]", expected: "120", isHidden: false }, { input: "[0]", expected: "1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "long"
  },
  {
    title: "Linear Search", slug: "linear-search",
    statement: "Return the first index at which target occurs, or -1 if it is absent.",
    inputFormat: "The function receives an integer array nums and an integer target.", outputFormat: "Return the first matching index or -1.",
    constraints: "1 <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[4,9,2,9],9]", expected: "1", isHidden: false }, { input: "[[1,3,5],2]", expected: "-1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[],int", returnType: "int"
  },
  {
    title: "Binary Search", slug: "binary-search",
    statement: "Find target in a sorted array and return its index, or -1.",
    inputFormat: "The function receives a sorted integer array nums and target.", outputFormat: "Return the target index or -1.",
    constraints: "1 <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[-5,-2,0,4,9],4]", expected: "3", isHidden: false }, { input: "[[1,3,5,7],6]", expected: "-1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[],int", returnType: "int"
  },
  {
    title: "GCD of Two Numbers", slug: "gcd-of-two-numbers",
    statement: "Return the greatest common divisor of two positive integers.",
    inputFormat: "The function receives positive integers a and b.", outputFormat: "Return gcd(a, b).",
    constraints: "1 <= a, b <= 10^9", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[48,18]", expected: "6", isHidden: false }, { input: "[101,10]", expected: "1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int,int", returnType: "int"
  },
  {
    title: "Valid Anagram", slug: "valid-anagram",
    statement: "Determine whether two lowercase strings contain the same characters with the same frequencies.",
    inputFormat: "The function receives strings s and t.", outputFormat: "Return YES if they are anagrams, otherwise return NO.",
    constraints: "1 <= |s|, |t| <= 100000", difficulty: "HARD" as const,
    testCases: [{ input: "[\"listen\",\"silent\"]", expected: "YES", isHidden: false }, { input: "[\"hello\",\"world\"]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,String", returnType: "String"
  }
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@codearcade.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (process.env.NODE_ENV === "production" && adminPassword === "admin123") {
    throw new Error("ADMIN_PASSWORD must be set to a strong value before seeding production");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", passwordHash },
    create: {
      name: "CodeArcade Admin",
      email: adminEmail,
      passwordHash,
      role: "ADMIN"
    }
  });

  for (const problem of demoProblems) {
    await prisma.problem.upsert({
      where: { slug: problem.slug },
    update: {
      judgeMode: problem.judgeMode,
      functionName: problem.functionName,
      argumentTypes: problem.argumentTypes,
      returnType: problem.returnType
    },
      create: {
        title: problem.title,
        slug: problem.slug,
        statement: problem.statement,
        inputFormat: problem.inputFormat,
        outputFormat: problem.outputFormat,
        constraints: problem.constraints,
        difficulty: problem.difficulty,
        testCases: {
          create: problem.testCases
        }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
