import { auth } from "@/lib/auth";
import { taskService } from "@/services/task.service";
import { CreateTaskSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

type DeleteContext = {
  params: Promise<{ id: string }>;
};

export const POST = auth(async (req) => {
  const userId = req.auth?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    
    const validated = CreateTaskSchema.parse(body);
    
    const task = await taskService.create(validated, userId);
    
    return NextResponse.json(task, { status: 201 });
  } catch (error: unknown) { 
    if (error instanceof ZodError) {
      console.error("❌ ВАЛИДАЦИЯ ЗАДАЧИ ПРОВАЛЕНА:", error.issues);
      return NextResponse.json({ 
        error: "Ошибка валидации данных", 
        details: error.issues
      }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("❌ ОШИБКА API СОЗДАНИЯ ЗАДАЧИ:", error);
    return NextResponse.json({ error: message }, { status: 500 });
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
  } catch (error: unknown) { 
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("❌ ОШИБКА API ОБНОВЛЕНИЯ ЗАДАЧИ:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const DELETE = auth(async (req, ctx) => { 
  const userId = req.auth?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await (ctx as DeleteContext).params;

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
