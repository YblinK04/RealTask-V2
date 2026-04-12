import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = auth(async (req, { params }) => {
  const session = req.auth;
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id: taskId } = await (params as any);

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        author: {
          select: { name: true, image: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("GET_COMMENTS_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});


export const POST = auth(async (req, { params }) => {
  const userId = req.auth?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id: taskId } = await (params as any);
    const { content } = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: { content, taskId, authorId: userId },
        include: { author: { select: { name: true } } }
      });

      await tx.notification.create({
        data: {
          userId,
          title: "Новый комментарий 💬",
          message: `${comment.author?.name || 'Кто-то'} написал: ${content.substring(0, 30)}...`,
          link: `/tasks/${taskId}`, 
        },
      });

      return comment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});