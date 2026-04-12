'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { SidebarClient } from './sidebar-client';
import { Button } from '@/components/ui/button';
import { SidebarProject } from '@/store/useSidebarProjects';

interface MobileSidebarProps {
  projects: SidebarProject[];
  userId: string;
}

export function MobileSidebar({ projects, userId }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden"> 
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 border-none">
          <SheetTitle className="sr-only">Меню навигации</SheetTitle>
          <SidebarClient 
            projects={projects} 
            userId={userId} 
            isMobile={true} 
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}