ALTER TABLE "Problem"
ADD COLUMN "judgeMode" TEXT NOT NULL DEFAULT 'STDIN',
ADD COLUMN "functionName" TEXT NOT NULL DEFAULT 'solve',
ADD COLUMN "argumentTypes" TEXT NOT NULL DEFAULT '',
ADD COLUMN "returnType" TEXT NOT NULL DEFAULT 'int';

-- Convert the bundled demo cases to function arguments for existing databases.
UPDATE "Problem" SET "judgeMode" = 'FUNCTION', "functionName" = 'solve', "argumentTypes" = 'int,int', "returnType" = 'int' WHERE "slug" = 'add-two-numbers';
UPDATE "TestCase" SET "input" = '[2,3]', "expected" = '5' WHERE "problemId" = (SELECT "id" FROM "Problem" WHERE "slug" = 'add-two-numbers') AND "input" = '2 3\n';
UPDATE "TestCase" SET "input" = '[-4,10]', "expected" = '6' WHERE "problemId" = (SELECT "id" FROM "Problem" WHERE "slug" = 'add-two-numbers') AND "input" = '-4 10\n';

UPDATE "Problem" SET "judgeMode" = 'FUNCTION', "functionName" = 'solve', "argumentTypes" = 'int[]', "returnType" = 'int' WHERE "slug" = 'maximum-of-array';
UPDATE "TestCase" SET "input" = '[[1,8,2,4,3]]', "expected" = '8' WHERE "problemId" = (SELECT "id" FROM "Problem" WHERE "slug" = 'maximum-of-array') AND "input" LIKE '5%';
UPDATE "TestCase" SET "input" = '[[-7,-2,-9]]', "expected" = '-2' WHERE "problemId" = (SELECT "id" FROM "Problem" WHERE "slug" = 'maximum-of-array') AND "input" LIKE '3%';

UPDATE "Problem" SET "judgeMode" = 'FUNCTION', "functionName" = 'solve', "argumentTypes" = 'String', "returnType" = 'String' WHERE "slug" = 'palindrome-string';
UPDATE "TestCase" SET "input" = '["madam"]', "expected" = 'YES' WHERE "problemId" = (SELECT "id" FROM "Problem" WHERE "slug" = 'palindrome-string') AND "input" = 'madam\n';
UPDATE "TestCase" SET "input" = '["code"]', "expected" = 'NO' WHERE "problemId" = (SELECT "id" FROM "Problem" WHERE "slug" = 'palindrome-string') AND "input" = 'code\n';
