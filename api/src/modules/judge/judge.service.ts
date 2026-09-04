import { Difficulty, Prisma, Verdict } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";

const SCORE_BY_DIFFICULTY: Record<Difficulty, number> = {
  EASY: 100,
  MEDIUM: 200,
  HARD: 300
};

async function withSerializableRetry<T>(operation: () => Promise<T>) {
  const raw = Number(process.env.JUDGE_RESULT_RETRY_ATTEMPTS ?? 3);
  const maxAttempts = Number.isSafeInteger(raw) ? Math.min(Math.max(raw, 1), 10) : 3;

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
  const safeLimit = Number.isSafeInteger(limit) ? Math.min(Math.max(limit, 1), 50) : 5;
  const staleThresholdMs = Number(process.env.JUDGE_STALE_THRESHOLD_MS ?? 60000);
  const safeStaleMs = Number.isSafeInteger(staleThresholdMs) ? Math.min(Math.max(staleThresholdMs, 5000), 3600000) : 60000;
  const staleBefore = new Date(Date.now() - safeStaleMs);

  return prisma.$transaction(async (tx) => {
    const candidates = await tx.submission.findMany({
      where: {
        OR: [
          { status: "PENDING" },
          { status: "RUNNING", updatedAt: { lt: staleBefore } }
        ]
      },
      orderBy: { createdAt: "asc" },
      take: safeLimit,
      select: { id: true }
    });

    const ids = candidates.map((candidate) => candidate.id);

    if (ids.length === 0) {
      return [];
    }

    // Conditional claim: only rows still PENDING/stale-RUNNING are flipped.
    // Concurrent claimants race here; only the winner's ids proceed.
    const claimed = await tx.submission.updateMany({
      where: {
        id: { in: ids },
        OR: [
          { status: "PENDING" },
          { status: "RUNNING", updatedAt: { lt: staleBefore } }
        ]
      },
      data: { status: "RUNNING" }
    });

    if (claimed.count === 0) {
      return [];
    }

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

    // Only terminal transitions from an active state are accepted. Replays of
    // an already-completed verdict are acknowledged idempotently without
    // touching the leaderboard twice.
    if (submission.status === "COMPLETED") {
      if (submission.verdict === input.verdict) {
        return submission;
      }
      // Allow AC<->non-AC corrections below, but never resurrect PENDING.
    } else if (submission.status !== "PENDING" && submission.status !== "RUNNING") {
      throw new ApiError(409, `Submission is already ${submission.status}`);
    }

    const wasAlreadyAccepted = submission.verdict === "AC";
    const willBeAccepted = input.verdict === "AC";
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

    if (willBeAccepted && !wasAlreadyAccepted) {
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
    } else if (!willBeAccepted && wasAlreadyAccepted) {
      // Downgrade correction (e.g. re-judge AC -> WA): roll back the earlier
      // increment so totals/scores do not stay inflated.
      const otherAccepted = await tx.submission.count({
        where: {
          userId: submission.userId,
          problemId: submission.problemId,
          verdict: "AC",
          id: { not: submission.id }
        }
      });
      const hadScore = otherAccepted === 0;
      const scoreDelta = hadScore ? SCORE_BY_DIFFICULTY[submission.problem.difficulty] : 0;
      await tx.leaderboardEntry.updateMany({
        where: { userId: submission.userId },
        data: {
          totalAccepted: { decrement: 1 },
          solvedCount: { decrement: hadScore ? 1 : 0 },
          score: { decrement: scoreDelta }
        }
      });
    }

    return updated;
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable
  }));
}
