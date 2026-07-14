import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";
import { slugify } from "../../utils/slugify";

export async function listProblems() {
  return prisma.problem.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      difficulty: true,
      timeLimitMs: true,
      memoryLimitMb: true,
      createdAt: true,
      _count: { select: { submissions: true } }
    }
  });
}

export async function countProblems() {
  return prisma.problem.count();
}

export async function getProblemBySlug(slug: string, includeHidden: boolean) {
  const problem = await prisma.problem.findUnique({
    where: { slug },
    include: {
      testCases: {
        where: includeHidden ? undefined : { isHidden: false },
        select: { id: true, input: true, expected: includeHidden, isHidden: true, createdAt: true }
      }
    }
  });

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  return problem;
}

export async function createProblem(input: Prisma.ProblemCreateInput) {
  const slug = input.slug || slugify(input.title);

  return prisma.problem.create({
    data: {
      ...input,
      slug
    }
  });
}

export async function updateProblem(id: string, input: Prisma.ProblemUpdateInput) {
  try {
    return await prisma.problem.update({
      where: { id },
      data: input
    });
  } catch {
    throw new ApiError(404, "Problem not found");
  }
}

export async function deleteProblem(id: string) {
  try {
    await prisma.problem.delete({ where: { id } });
    return { deleted: true };
  } catch {
    throw new ApiError(404, "Problem not found");
  }
}
