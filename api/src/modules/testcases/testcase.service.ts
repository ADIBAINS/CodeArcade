import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";
import { paginate } from "../../utils/pagination";

export async function createTestCase(problemId: string, input: { input: string; expected: string; isHidden: boolean }) {
  const problem = await prisma.problem.findUnique({ where: { id: problemId }, select: { id: true } });

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  return prisma.testCase.create({
    data: {
      problemId,
      input: input.input,
      expected: input.expected,
      isHidden: input.isHidden
    }
  });
}

export async function listTestCases(problemId: string, includeHidden: boolean, page = 1, limit = 100) {
  const problem = await prisma.problem.findUnique({ where: { id: problemId }, select: { id: true } });

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  const where = { problemId, ...(includeHidden ? {} : { isHidden: false }) };
  const [items, total] = await Promise.all([
    prisma.testCase.findMany({
      where,
      select: {
        id: true,
        input: true,
        expected: includeHidden,
        isHidden: true,
        createdAt: true
      },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.testCase.count({ where })
  ]);
  return paginate(items, total, page, limit);
}

