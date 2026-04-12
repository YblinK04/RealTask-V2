import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  const userId = req.auth?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) return NextResponse.json({ projects: [], tasks: [] });

  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId, name: { contains: query, mode: 'insensitive' } },
      take: 5
    }),
    prisma.task.findMany({
      where: { 
        project: { ownerId: userId }, 
        title: { contains: query, mode: 'insensitive' } 
      },
      include: { project: true },
      take: 5
    })
  ]);

  return NextResponse.json({ projects, tasks });
});