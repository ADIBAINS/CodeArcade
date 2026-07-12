import { prisma } from "../../db/prisma";

export async function getLeaderboard() {
  return prisma.leaderboardEntry.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: [
      { score: "desc" },
      { solvedCount: "desc" },
      { totalSubmitted: "asc" }
    ]
  });
}

