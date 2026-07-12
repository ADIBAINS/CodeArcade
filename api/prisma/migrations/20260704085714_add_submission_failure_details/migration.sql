-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "actualOutput" TEXT,
ADD COLUMN     "expectedOutput" TEXT,
ADD COLUMN     "failedTestInput" TEXT;
