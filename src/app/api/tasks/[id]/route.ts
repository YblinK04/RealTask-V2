import { auth } from '@/lib/auth';
import { taskService } from '@/services/task.service';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const PATCH = auth(async (req, context) => {
  const userId = req.auth?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await (context as RouteParams).params;
    const body = (await req.json()) as Record<string, unknown>;

    if ('newStatus' in body || 'newOrder' in body) {
      const updatedTask = await taskService.move(
        {
          ...body,
          taskId: body.taskId || id, 
        },
        userId
      );
      return NextResponse.json(updatedTask);
    }

    const updatedTask = await taskService.update(
      {
        ...body,
        id, 
      },
      userId
    );
    return NextResponse.json(updatedTask);

  } catch (error: unknown) {
    console.error('PATCH_TASK_ERROR:', error);

    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
});

export const DELETE = auth(async (req, context) => {
  const userId = req.auth?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await (context as RouteParams).params;
    
    const deletedTask = await taskService.delete(id, userId);
    
    return NextResponse.json(deletedTask);
  } catch (error: unknown) {
    console.error('DELETE_TASK_ERROR:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
});
