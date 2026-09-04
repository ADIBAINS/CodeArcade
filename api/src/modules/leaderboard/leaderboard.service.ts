import { prisma } from "../../db/prisma";
import { paginate, skipTake } from "../../utils/pagination";

export async function getLeaderboard(page = 1, limit = 20) {
  const [entries, total] = await Promise.all([
    prisma.leaderboardEntry.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { score: "desc" },
        { solvedCount: "desc" },
        { totalSubmitted: "asc" }
      ],
      ...skipTake(page, limit)
    }),
    prisma.leaderboardEntry.count()
  ]);
  return paginate(entries, total, page, limit);
}

