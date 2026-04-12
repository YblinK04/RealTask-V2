'use client';

import { useSession, signOut } from 'next-auth/react';
import { SearchCommand } from './search-command';
import { NotificationsPopover } from './notifications-popover';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User, LifeBuoy } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card/50 backdrop-blur-md px-4 md:px-6 sticky top-0 z-40 w-full gap-4">
      <div className="flex-1 flex items-center min-w-0">
        <div className="w-full max-w-md">
          <SearchCommand />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <NotificationsPopover />
        <ModeToggle />

        <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-border/50 shadow-sm">
              <Avatar className="h-9 w-9">
                <AvatarImage src={session?.user?.image || ''} />
                <AvatarFallback className="text-[10px] bg-primary/5 text-primary">
                  {session?.user?.name?.[0] || <User className="h-3 w-3" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold truncate">{session?.user?.name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{session?.user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center cursor-pointer">
                <Settings className="mr-2 h-4 w-4" /> Настройки
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" /> Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}