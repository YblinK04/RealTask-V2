'use client';

import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginInput } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<LoginInput>({
        resolver: zodResolver(LoginSchema),
        defaultValues: { email: '', password: '' }
    });

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                toast.error('Неверный логин или пароль');
                setIsLoading(false); 
                return;
            }

            toast.success('Успешный вход');
            router.push('/dashboard');
            router.refresh();
        } catch (error) {
            toast.error('Произошла ошибка при входе');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center px-4 bg-muted/20">
            <Card className="w-full max-w-md shadow-lg border-none ring-1 ring-border">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold font-sans">С возвращением</CardTitle>
                    <CardDescription>Введите данные для входа в RealTask</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Input 
                                {...form.register('email')} 
                                type="email" 
                                placeholder="name@example.com" 
                                disabled={isLoading}
                                className="bg-background"
                            />
                            {form.formState.errors.email && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">
                                    {form.formState.errors.email.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Input 
                                {...form.register('password')} 
                                type="password" 
                                placeholder="••••••••" 
                                disabled={isLoading}
                                className="bg-background"
                            />
                            {form.formState.errors.password && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">
                                    {form.formState.errors.password.message}
                                </p>
                            )}
                        </div>
                        <Button type="submit" className="w-full font-bold uppercase text-xs tracking-widest" disabled={isLoading}>
                            {isLoading ? 'Вход...' : 'Войти'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-center gap-2 border-t pt-4">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Нет аккаунта?</span>
                    <Link href="/register" className="text-xs font-black text-primary hover:underline uppercase tracking-tight">
                        Зарегистрироваться
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}