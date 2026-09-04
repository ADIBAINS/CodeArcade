import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";
import { paginate, skipTake } from "../../utils/pagination";
import { slugify } from "../../utils/slugify";

export async function createRequest(userId: string, input: Prisma.ProblemRequestCreateInput) {
  const { user: _user, ...data } = input as any;
  return prisma.problemRequest.create({
    data: {
      title: data.title,
      statement: data.statement,
      inputFormat: data.inputFormat,
      outputFormat: data.outputFormat,
      constraints: data.constraints,
      difficulty: data.difficulty,
      userId
    }
  });
}

export async function getUserRequests(userId: string, page = 1, limit = 20) {
  const where = { userId };
  const [items, total] = await Promise.all([
    prisma.problemRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        difficulty: true,
        status: true,
        adminNotes: true,
        createdAt: true,
        updatedAt: true
      },
      ...skipTake(page, limit)
    }),
    prisma.problemRequest.count({ where })
  ]);
  return paginate(items, total, page, limit);
}

export async function getRequestById(id: string) {
  const request = await prisma.problemRequest.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } }
    }
  });

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  return request;
}

export async function getAllRequests(status?: string, page = 1, limit = 20) {
  const where = status ? { status: status as any } : {};

  const [items, total] = await Promise.all([
    prisma.problemRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
        reviewedBy: { select: { id: true, name: true } }
      },
      ...skipTake(page, limit)
    }),
    prisma.problemRequest.count({ where })
  ]);
  return paginate(items, total, page, limit);
}

export async function updateRequest(id: string, data: Prisma.ProblemRequestUpdateInput) {
  try {
    return await prisma.problemRequest.update({
      where: { id },
      data
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new ApiError(404, "Request not found");
    }
    throw error;
  }
}

export async function approveRequest(id: string, adminId: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const request = await tx.problemRequest.findUnique({ where: { id } });

      if (!request) {
        throw new ApiError(404, "Request not found");
      }

      if (request.status !== "PENDING" && request.status !== "IN_REVIEW") {
        throw new ApiError(400, `Cannot approve a request with status: ${request.status}`);
      }

      const slug = slugify(request.title);

      const problem = await tx.problem.create({
        data: {
          title: request.title,
          slug,
          statement: request.statement,
          inputFormat: request.inputFormat,
          outputFormat: request.outputFormat,
          constraints: request.constraints,
          difficulty: request.difficulty
        }
      });

      const updatedRequest = await tx.problemRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedById: adminId,
          // Preserve any existing reviewer notes instead of overwriting them.
          adminNotes: request.adminNotes
            ? `${request.adminNotes}\nApproved and created as problem "${request.title}"`
            : `Approved and created as problem "${request.title}"`
        }
      });

      return { problem, request: updatedRequest };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError(409, "A problem with an equivalent slug already exists");
    }
    throw error;
  }
}

export async function rejectRequest(id: string, adminId: string, adminNotes: string) {
  const request = await prisma.problemRequest.findUnique({ where: { id } });

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (request.status === "APPROVED" || request.status === "REJECTED") {
    throw new ApiError(400, `Cannot reject a request with status: ${request.status}`);
  }

  return prisma.problemRequest.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewedById: adminId,
      adminNotes
    }
  });
}

export async function setInReview(id: string, adminId: string) {
  const request = await prisma.problemRequest.findUnique({ where: { id } });

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (request.status !== "PENDING") {
    throw new ApiError(400, `Cannot set a request with status: ${request.status} to IN_REVIEW`);
  }

  return prisma.problemRequest.update({
    where: { id },
    data: {
      status: "IN_REVIEW",
      reviewedById: adminId
    }
  });
}
