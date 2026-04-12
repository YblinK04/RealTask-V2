import { auth } from "@/lib/auth";
import { taskService } from "@/services/task.service";
import { CreateTaskSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const POST = auth(async (req) => {
  const userId = req.auth?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    
    
    const validated = CreateTaskSchema.parse(body);
    
    
    const task = await taskService.create(validated, userId);
    
    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      console.error("❌ ВАЛИДАЦИЯ ЗАДАЧИ ПРОВАЛЕНА:", error.issues);
      return NextResponse.json({ 
        error: "Ошибка валидации данных", 
        details: error.issues
      }, { status: 400 });
    }

    console.error("❌ ОШИБКА API СОЗДАНИЯ ЗАДАЧИ:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
});

export const PATCH = auth(async (req) => {
  const userId = req.auth?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    
    if (body.newStatus) {
      const movedTask = await taskService.move(body, userId);
      return NextResponse.json(movedTask);
    }

   const updatedTask = await taskService.update(body, userId);
    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error("❌ ОШИБКА API ОБНОВЛЕНИЯ ЗАДАЧИ:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const DELETE = auth(async (req, { params }) => {
  const userId = req.auth?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await (params as any);

    await taskService.delete(id, userId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("❌ TASK_DELETE_ERROR:", error);
    
    const message = error instanceof Error ? error.message : "Internal Server Error";
    
    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
});