import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const demoProblems = [
  {
    title: "Add Two Numbers",
    slug: "add-two-numbers",
    statement: "Given two integers, print their sum.",
    inputFormat: "Two integers a and b separated by whitespace.",
    outputFormat: "Print one integer: the sum of a and b.",
    constraints: "-10^9 <= a, b <= 10^9",
    difficulty: "EASY" as const,
    testCases: [
      { input: "2 3\n", expected: "5\n", isHidden: false },
      { input: "-4 10\n", expected: "6\n", isHidden: true }
    ]
  },
  {
    title: "Maximum of Array",
    slug: "maximum-of-array",
    statement: "Given an array of integers, print the maximum element.",
    inputFormat: "The first line contains n. The second line contains n integers.",
    outputFormat: "Print the maximum element in the array.",
    constraints: "1 <= n <= 100000, -10^9 <= ai <= 10^9",
    difficulty: "EASY" as const,
    testCases: [
      { input: "5\n1 8 2 4 3\n", expected: "8\n", isHidden: false },
      { input: "3\n-7 -2 -9\n", expected: "-2\n", isHidden: true }
    ]
  },
  {
    title: "Palindrome String",
    slug: "palindrome-string",
    statement: "Given a string, print YES if it is a palindrome, otherwise print NO.",
    inputFormat: "A single lowercase string s.",
    outputFormat: "Print YES if s is a palindrome, otherwise print NO.",
    constraints: "1 <= |s| <= 100000",
    difficulty: "MEDIUM" as const,
    testCases: [
      { input: "madam\n", expected: "YES\n", isHidden: false },
      { input: "code\n", expected: "NO\n", isHidden: true }
    ]
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
      update: {},
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
