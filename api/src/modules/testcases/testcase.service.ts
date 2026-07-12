import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";

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

export async function listTestCases(problemId: string, includeHidden: boolean) {
  const problem = await prisma.problem.findUnique({ where: { id: problemId }, select: { id: true } });

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  return prisma.testCase.findMany({
    where: { problemId, ...(includeHidden ? {} : { isHidden: false }) },
    select: {
      id: true,
      input: true,
      expected: includeHidden,
      isHidden: true,
      createdAt: true
    },
    orderBy: { createdAt: "asc" }
  });
}

