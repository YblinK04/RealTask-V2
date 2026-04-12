import { auth } from '@/lib/auth';
import { taskService } from '@/services/task.service';
import { NextResponse } from 'next/server';

export const DELETE = auth(async (req, { params }) => {
  const userId = req.auth?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await (params as any); 
    await taskService.delete(id, userId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('DELETE_TASK_ERROR:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
});

export const PATCH = auth(async (req, { params }) => {
  const userId = req.auth?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await (params as any);
    const body = await req.json();
    
    const updatedTask = await taskService.update({ ...body, id }, userId);
    return NextResponse.json(updatedTask);
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
});