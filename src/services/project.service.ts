import { prisma } from '@/lib/prisma';
import { Project } from '@prisma/client';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  
} from '@/lib/schemas';

export class ProjectService {
    async create(data: CreateProjectInput, userId: string): Promise<Project> {
        const validateData = CreateProjectSchema.parse(data);

        const project = await prisma.project.create({
            data: {
                ...validateData,
                ownerId: userId,
            },
        });
        return project
    }

   

    async update(projectId: string, data: UpdateProjectInput, userId:string): Promise<Project> {
        const validateData = UpdateProjectSchema.parse(data);

        
        await this.validateOwnership(projectId, userId);

        const project = await prisma.project.update({
            where: {id: projectId},
            data: validateData,
        })
        return project
    }

   

    async delete(projectId: string, userId: string): Promise<Project> {
        await this.validateOwnership(projectId, userId);

       const deleteProject = await prisma.$transaction(async (tx) => {
           
            await tx.comment.deleteMany({
                where: {
                    task: {
                        projectId,
                    },
                },
            });
         
            await tx.task.deleteMany({
                where: { projectId},
            });

         
            return await tx.project.delete({
                where: {id: projectId},
            });
        });

        return deleteProject
    }

 
  async getWithTasks(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { isPublic: true },
        ],
      },
      include: {
        tasks: {
          orderBy: [
            { status: 'asc' },
            { order: 'asc' },
          ],
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    return project;
  }

  async getUserProjects(userId: string) {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    console.warn("⚠️ Предупреждение: Предотвращен падение findMany. userId пуст.");
    return []; 
  }

  return await prisma.project.findMany({
    where: {
      ownerId: userId 
    },
    orderBy: { updatedAt: 'desc' },
  });
}


  private async validateOwnership(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!project) {
      throw new Error('Project not found or you are not the owner');
    }

    return project;
  }
}

export const projectService = new ProjectService();