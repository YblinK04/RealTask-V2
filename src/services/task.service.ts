import { prisma } from '@/lib/prisma';
import { Task, Project } from '@prisma/client';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  MoveTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type MoveTaskInput,
} from '@/lib/schemas';

export class TaskService {
  
  async create(data: CreateTaskInput, userId: string): Promise<Task> {
    const validateData = CreateTaskSchema.parse(data);
    await this.validateProjectAccess(validateData.projectId, userId);

    let order = validateData.order;
    if (order === undefined || order === null) {
      const lastTask = await prisma.task.findFirst({
        where: {
          projectId: validateData.projectId,
          status: validateData.status || 'TODO',
        },
        orderBy: { order: 'desc' },
      });
      order = lastTask ? lastTask.order + 1 : 0;
    }

    return await prisma.task.create({
      data: {
        title: validateData.title,
        description: validateData.description || null,
        status: validateData.status || 'TODO',
        priority: validateData.priority || 'MEDIUM',
        order, 
        projectId: validateData.projectId,
        dueDate: validateData.dueDate || null,
      },
    });
  }

  async update(data: UpdateTaskInput, userId: string): Promise<Task> {
    const validateData = UpdateTaskSchema.parse(data);
    const { id, ...updateData } = validateData;

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) throw new Error('Task not found');
    await this.validateProjectAccess(existingTask.projectId, userId);

    return await prisma.task.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(), 
      },
    });
  }
 
  async move(data: unknown, userId: string): Promise<Task> {
    const validatedData = MoveTaskSchema.parse(data);

    return await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id: validatedData.taskId },
      });

      if (!task) throw new Error('Task not found');
      await this.validateProjectAccess(validatedData.projectId || task.projectId, userId);

      const oldStatus = task.status;
      const newStatus = validatedData.newStatus;
      const oldOrder = task.order;
      const newOrder = validatedData.newOrder;
      
      if (oldStatus !== newStatus) {
        await tx.task.updateMany({
          where: {
            status: oldStatus,
            projectId: task.projectId,
            order: { gt: oldOrder },
          },
          data: { order: { decrement: 1 } },
        });

        await tx.task.updateMany({
          where: {
            status: newStatus,
            projectId: validatedData.projectId || task.projectId,
            order: { gte: newOrder },
          },
          data: { order: { increment: 1 } },
        });
      } else if (oldOrder !== newOrder) {
        if (newOrder > oldOrder) {
          await tx.task.updateMany({
            where: {
              status: oldStatus,
              projectId: task.projectId,
              order: { gt: oldOrder, lte: newOrder },
            },
            data: { order: { decrement: 1 } },
          });
        } else {
          await tx.task.updateMany({
            where: {
              status: oldStatus,
              projectId: task.projectId,
              order: { gte: newOrder, lt: oldOrder },
            },
            data: { order: { increment: 1 } },
          });
        }
      }

      return await tx.task.update({
        where: { id: validatedData.taskId },
        data: {
          status: newStatus,
          order: newOrder,
          projectId: validatedData.projectId || task.projectId,
        },
      });
    });
  }

  async delete(taskId: string, userId: string): Promise<Task> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) throw new Error('Task not found');
    await this.validateProjectAccess(task.projectId, userId);

    return await prisma.$transaction(async (tx) => {
      await tx.comment.deleteMany({
        where: { taskId },
      });

      await tx.task.updateMany({
        where: {
          projectId: task.projectId,
          status: task.status,
          order: { gt: task.order },
        },
        data: { order: { decrement: 1 } },
      });

      return await tx.task.delete({
        where: { id: taskId },
      });
    });
  }

  async getProjectTasks(projectId: string, userId: string): Promise<Task[]> {
    await this.validateProjectAccess(projectId, userId);

    return await prisma.task.findMany({
      where: { projectId },
      orderBy: [{ status: 'asc' }, { order: 'asc' }],
      include: {
        assignee: {
          select: { id: true, name: true, image: true },
        },
      },
    });
  }

  private async validateProjectAccess(projectId: string, userId: string): Promise<Project> {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { isPublic: true }],
      },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }
    return project;
  }
}

export const taskService = new TaskService();
