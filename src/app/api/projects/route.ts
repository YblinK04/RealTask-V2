import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateProjectSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
  const userId = req.auth?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    include: { tasks: true }, 
    orderBy: { updatedAt: 'desc' }
  });

  return NextResponse.json(projects);
});

export const POST = auth(async (req) => {
  const userId = req.auth?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = CreateProjectSchema.parse(body);

    const project = await prisma.$transaction(async (tx) => {
     
      const newProject = await tx.project.create({
        data: {
          ...validated,
          ownerId: userId,
        },
      });

      
      await tx.notification.create({
        data: {
          userId,
          title: "Проект создан 🚀",
          message: `Вы успешно создали проект "${newProject.name}"`,
          link: `/projects/${newProject.id}`,
        },
      });

      return newProject;
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
});