-- Add MLE (Memory Limit Exceeded) to the Verdict enum.
-- NOTE: Postgres forbids ALTER TYPE ... ADD VALUE inside a transaction block,
-- so `migrate deploy` cannot run this file. It was applied directly with psql
-- and marked resolved via `migrate resolve --applied`. Fresh environments
-- should apply this statement with psql before marking it resolved.
ALTER TYPE "Verdict" ADD VALUE 'MLE';
