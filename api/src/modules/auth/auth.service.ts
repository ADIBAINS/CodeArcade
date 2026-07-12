import bcrypt from "bcryptjs";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";
import { signToken } from "../../utils/jwt";

export async function registerUser(input: { name: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });

  const token = signToken({ userId: user.id, role: user.role });
  return { user, token };
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const matches = await bcrypt.compare(input.password, user.passwordHash);

  if (!matches) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken({ userId: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

