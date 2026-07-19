import { Difficulty, Prisma, Verdict } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";

const SCORE_BY_DIFFICULTY: Record<Difficulty, number> = {
  EASY: 100,
  MEDIUM: 200,
  HARD: 300
};

async function withSerializableRetry<T>(operation: () => Promise<T>) {
  const maxAttempts = Number(process.env.JUDGE_RESULT_RETRY_ATTEMPTS ?? 3);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034" &&
        attempt < maxAttempts
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new ApiError(500, "Judge result transaction failed");
}

export async function fetchPendingSubmissions(limit: number) {
  const staleThresholdMs = Number(process.env.JUDGE_STALE_THRESHOLD_MS ?? 60000);
  const staleBefore = new Date(Date.now() - staleThresholdMs);

  return prisma.$transaction(async (tx) => {
    const candidates = await tx.submission.findMany({
      where: {
        OR: [
          { status: "PENDING" },
          { status: "RUNNING", updatedAt: { lt: staleBefore } }
        ]
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      select: { id: true }
    });

    const ids = candidates.map((candidate) => candidate.id);

    if (ids.length === 0) {
      return [];
    }

    await tx.submission.updateMany({
      where: { id: { in: ids } },
      data: { status: "RUNNING" }
    });

    const submissions = await tx.submission.findMany({
      where: { id: { in: ids } },
      include: {
        problem: {
          include: {
            testCases: {
              orderBy: { createdAt: "asc" },
              select: { input: true, expected: true }
            }
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return submissions.map((submission) => ({
      id: submission.id,
      problemId: submission.problemId,
      language: submission.language,
      sourceCode: submission.sourceCode,
      timeLimitMs: submission.problem.timeLimitMs,
      memoryLimitMb: submission.problem.memoryLimitMb,
      judgeMode: submission.problem.judgeMode,
      functionName: submission.problem.functionName,
      argumentTypes: submission.problem.argumentTypes,
      returnType: submission.problem.returnType,
      testCases: submission.problem.testCases
    }));
  });
}

export async function saveJudgeResult(input: {
  submissionId: string;
  verdict: Verdict;
  passedTests: number;
  totalTests: number;
  executionTimeMs?: number;
  errorMessage?: string | null;
  failedTestInput?: string | null;
  expectedOutput?: string | null;
  actualOutput?: string | null;
}) {
  return withSerializableRetry(() => prisma.$transaction(async (tx) => {
    const submission = await tx.submission.findUnique({
      where: { id: input.submissionId },
      include: { problem: { select: { difficulty: true } } }
    });

    if (!submission) {
      throw new ApiError(404, "Submission not found");
    }

    const wasAlreadyAccepted = submission.verdict === "AC";
    const acceptedBeforeForProblem = await tx.submission.count({
      where: {
        userId: submission.userId,
        problemId: submission.problemId,
        verdict: "AC",
        id: { not: submission.id }
      }
    });

    const updated = await tx.submission.update({
      where: { id: input.submissionId },
      data: {
        status: "COMPLETED",
        verdict: input.verdict,
        passedTests: input.passedTests,
        totalTests: input.totalTests,
        executionTimeMs: input.executionTimeMs ?? null,
        errorMessage: input.errorMessage ?? null,
        failedTestInput: input.failedTestInput ?? null,
        expectedOutput: input.expectedOutput ?? null,
        actualOutput: input.actualOutput ?? null
      }
    });

    if (input.verdict === "AC" && !wasAlreadyAccepted) {
      const firstSolveForProblem = acceptedBeforeForProblem === 0;
      const scoreDelta = firstSolveForProblem ? SCORE_BY_DIFFICULTY[submission.problem.difficulty] : 0;

      await tx.leaderboardEntry.upsert({
        where: { userId: submission.userId },
        update: {
          totalAccepted: { increment: 1 },
          solvedCount: { increment: firstSolveForProblem ? 1 : 0 },
          score: { increment: scoreDelta }
        },
        create: {
          userId: submission.userId,
          totalAccepted: 1,
          solvedCount: firstSolveForProblem ? 1 : 0,
          score: scoreDelta
        }
      });
    }

    return updated;
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable
  }));
}
