import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";
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

export async function getUserRequests(userId: string) {
  return prisma.problemRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      difficulty: true,
      status: true,
      adminNotes: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

export async function getRequestById(id: string) {
  const request = await prisma.problemRequest.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true } }
    }
  });

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  return request;
}

export async function getAllRequests(status?: string) {
  const where = status ? { status: status as any } : {};

  return prisma.problemRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true } }
    }
  });
}

export async function updateRequest(id: string, data: Prisma.ProblemRequestUpdateInput) {
  try {
    return await prisma.problemRequest.update({
      where: { id },
      data
    });
  } catch {
    throw new ApiError(404, "Request not found");
  }
}

export async function approveRequest(id: string, adminId: string) {
  const request = await prisma.problemRequest.findUnique({ where: { id } });

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (request.status !== "PENDING" && request.status !== "IN_REVIEW") {
    throw new ApiError(400, `Cannot approve a request with status: ${request.status}`);
  }

  const slug = slugify(request.title);

  const existingSlug = await prisma.problem.findUnique({ where: { slug } });
  if (existingSlug) {
    throw new ApiError(409, `A problem with slug "${slug}" already exists`);
  }

  const [problem] = await prisma.$transaction([
    prisma.problem.create({
      data: {
        title: request.title,
        slug,
        statement: request.statement,
        inputFormat: request.inputFormat,
        outputFormat: request.outputFormat,
        constraints: request.constraints,
        difficulty: request.difficulty
      }
    }),
    prisma.problemRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedById: adminId,
        adminNotes: `Approved and created as problem "${request.title}"`
      }
    })
  ]);

  return { problem, request };
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
