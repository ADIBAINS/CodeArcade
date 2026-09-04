import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";
import { paginate, skipTake } from "../../utils/pagination";
import { slugify } from "../../utils/slugify";

export async function listProblems(page = 1, limit = 20) {
  const [items, total] = await Promise.all([
    prisma.problem.findMany({
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
      },
      ...skipTake(page, limit)
    }),
    prisma.problem.count()
  ]);
  return paginate(items, total, page, limit);
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

  try {
    return await prisma.problem.create({
      data: {
        ...input,
        slug
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError(409, `A problem with slug "${slug}" already exists`);
    }
    throw error;
  }
}

function toNotFound(error: unknown, message: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    throw new ApiError(404, message);
  }
  throw error;
}

export async function updateProblem(id: string, input: Prisma.ProblemUpdateInput) {
  try {
    return await prisma.problem.update({
      where: { id },
      data: input
    });
  } catch (error) {
    toNotFound(error, "Problem not found");
  }
}

export async function deleteProblem(id: string) {
  try {
    await prisma.problem.delete({ where: { id } });
    return { deleted: true };
  } catch (error) {
    toNotFound(error, "Problem not found");
  }
}
