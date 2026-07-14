-- CreateEnum
CREATE TYPE "ProblemRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'IN_REVIEW');

-- CreateTable
CREATE TABLE "ProblemRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "inputFormat" TEXT NOT NULL,
    "outputFormat" TEXT NOT NULL,
    "constraints" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "status" "ProblemRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProblemRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProblemRequest_userId_idx" ON "ProblemRequest"("userId");

-- CreateIndex
CREATE INDEX "ProblemRequest_status_idx" ON "ProblemRequest"("status");

-- AddForeignKey
ALTER TABLE "ProblemRequest" ADD CONSTRAINT "ProblemRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemRequest" ADD CONSTRAINT "ProblemRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
