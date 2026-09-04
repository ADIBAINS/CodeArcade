import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";
import { paginate, skipTake } from "../../utils/pagination";

export async function createSubmission(
  userId: string,
  input: { problemId: string; language: "JAVA" | "CPP"; sourceCode: string }
) {
  const problem = await prisma.problem.findUnique({ where: { id: input.problemId }, select: { id: true } });

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  return prisma.$transaction(async (tx) => {
    const submission = await tx.submission.create({
      data: {
        userId,
        problemId: input.problemId,
        language: input.language,
        sourceCode: input.sourceCode,
        status: "PENDING"
      },
      include: {
        problem: {
          select: { id: true, title: true, slug: true, difficulty: true }
        }
      }
    });

    await tx.leaderboardEntry.upsert({
      where: { userId },
      update: { totalSubmitted: { increment: 1 } },
      create: { userId, totalSubmitted: 1 }
    });

    return submission;
  });
}

export async function getSubmission(id: string, requester: { id: string; role: "USER" | "ADMIN" }) {
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      problem: { select: { id: true, title: true, slug: true, difficulty: true } },
      user: { select: { id: true, name: true } }
    }
  });

  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  if (requester.role !== "ADMIN" && submission.userId !== requester.id) {
    throw new ApiError(403, "You cannot view this submission");
  }

  return submission;
}

const submissionListSelect = {
  id: true,
  language: true,
  status: true,
  verdict: true,
  passedTests: true,
  totalTests: true,
  executionTimeMs: true,
  createdAt: true,
  updatedAt: true,
  problemId: true,
  userId: true,
} as const;

export async function listMySubmissions(userId: string, page = 1, limit = 20) {
  const where = { userId };
  const [items, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      select: {
        ...submissionListSelect,
        problem: { select: { id: true, title: true, slug: true, difficulty: true } }
      },
      orderBy: { createdAt: "desc" },
      ...skipTake(page, limit)
    }),
    prisma.submission.count({ where })
  ]);
  return paginate(items, total, page, limit);
}

export async function listProblemSubmissions(
  problemId: string,
  requester: { id: string; role: "USER" | "ADMIN" },
  page = 1,
  limit = 20
) {
  const where = {
    problemId,
    ...(requester.role === "ADMIN" ? {} : { userId: requester.id })
  };
  const [items, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      select: {
        ...submissionListSelect,
        problem: { select: { id: true, title: true, slug: true } },
        user: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" },
      ...skipTake(page, limit)
    }),
    prisma.submission.count({ where })
  ]);
  return paginate(items, total, page, limit);
}

