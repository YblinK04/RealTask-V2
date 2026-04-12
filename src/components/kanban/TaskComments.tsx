'use client';

import React, { useState } from 'react'; 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Send, Loader2, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string | null;
    image: string | null;
  } | null;
}

export function TaskComments({ taskId }: { taskId: string }) {
  const [messageText, setMessageText] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ['comments', taskId],
    queryFn: () => api.get(`/api/tasks/${taskId}/comments`),
  });

 
  const { mutate: sendComment, isPending } = useMutation({
    mutationFn: (content: string) => api.post(`/api/tasks/${taskId}/comments`, { content }),
    onSuccess: () => {
      setMessageText(''); 
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || isPending) return;
    sendComment(messageText);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <ScrollArea className="flex-1 pr-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin opacity-20" />
          </div>
        ) : !comments || comments.length === 0 ? (
          <div className="text-center py-10 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/40">
            Сообщений пока нет
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-1">
                <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                  <AvatarImage src={comment.author?.image || ''} />
                  <AvatarFallback className="bg-primary/5 text-primary text-[10px]">
                    {comment.author?.name?.[0] || <User className="h-3 w-3" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-tight">
                      {comment.author?.name || 'Аноним'}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground/60">
                      {format(new Date(comment.createdAt), 'HH:mm', { locale: ru })}
                    </span>
                  </div>
                  <div className="text-sm bg-muted/30 p-2.5 rounded-2xl rounded-tl-none border border-border/50 text-foreground/90">
                    {comment.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t items-center">
        <Input
          placeholder="Напишите сообщение..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          disabled={isPending}
          className="bg-muted/40 border-none h-9 text-sm focus-visible:ring-1 ring-primary/20"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isPending || !messageText.trim()}
          className="h-9 w-9 shrink-0 shadow-lg shadow-primary/20"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}