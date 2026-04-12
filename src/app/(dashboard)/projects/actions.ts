'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ProjectStatus } from '@prisma/client';



export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
    const session = await auth();

    if (!session?.user?.id) return {error: 'Unauthorized'}

    try {
        await prisma.project.update({
            where: {id: projectId, ownerId: session.user.id},
            data: { status },
        });

        revalidatePath('/', 'layout');

        return { success: true};
    } catch (error) {
        return { error: 'Ошибка при обновлении статуса'}
    }
}