-- Backend hardening: JudgeMode enum, hot-path indexes, SetNull delete rule
DO $$ BEGIN
  CREATE TYPE "JudgeMode" AS ENUM ('STDIN', 'FUNCTION');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Backfill guard: any unexpected judgeMode values fall back to STDIN
UPDATE "Problem" SET "judgeMode" = 'STDIN' WHERE "judgeMode" NOT IN ('STDIN', 'FUNCTION');

ALTER TABLE "Problem" ALTER COLUMN "judgeMode" DROP DEFAULT;
ALTER TABLE "Problem" ALTER COLUMN "judgeMode" TYPE "JudgeMode" USING "judgeMode"::"JudgeMode";
ALTER TABLE "Problem" ALTER COLUMN "judgeMode" SET DEFAULT 'STDIN'::"JudgeMode";

CREATE INDEX IF NOT EXISTS "Problem_difficulty_createdAt_idx" ON "Problem"("difficulty", "createdAt");
CREATE INDEX IF NOT EXISTS "TestCase_problemId_idx" ON "TestCase"("problemId");
CREATE INDEX IF NOT EXISTS "Submission_problemId_idx" ON "Submission"("problemId");
CREATE INDEX IF NOT EXISTS "Submission_userId_createdAt_idx" ON "Submission"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Submission_verdict_idx" ON "Submission"("verdict");
CREATE INDEX IF NOT EXISTS "LeaderboardEntry_score_solvedCount_idx" ON "LeaderboardEntry"("score", "solvedCount");
CREATE INDEX IF NOT EXISTS "ProblemRequest_reviewedById_idx" ON "ProblemRequest"("reviewedById");
