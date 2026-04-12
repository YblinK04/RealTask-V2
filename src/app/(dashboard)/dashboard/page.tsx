import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProjectList } from '@/components/dashboard/project-list';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const projects = await prisma.project.findMany({
    where: { 
      ownerId: session.user.id,
    },
    include: {
      tasks: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  const serializedProjects = JSON.parse(JSON.stringify(projects));

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tighter">Рабочий стол</h1>
        <p className="text-muted-foreground text-sm font-medium">
          Ваши актуальные проекты и статистика выполнения
        </p>
      </div>

      <ProjectList initialProjects={serializedProjects} />
    </div>
  );
}