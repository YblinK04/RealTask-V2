import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const DELETE = auth(async (req, { params }) => {
  const userId = req.auth?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id: projectId } = await (params as any);

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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});