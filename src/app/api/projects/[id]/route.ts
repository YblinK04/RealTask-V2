import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type DeleteContext = {
  params: Promise<{ id: string }>;
};

export const DELETE = auth(async (req, ctx) => {
  const userId = req.auth?.user?.id;
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: projectId } = await ctx.params;

    await prisma.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: { id: projectId, ownerId: userId }
      });

      if (!project) throw new Error("Access denied");

      
      await tx.project.delete({ where: { id: projectId } });

      await tx.notification.create({
        data: {
          userId,
          title: "Проект удален 🗑️",
          message: `Проект "${project.name}" был успешно удален из системы.`,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) { 
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
});
