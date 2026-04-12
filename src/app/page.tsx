'use client'; 

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, CheckCircle2, Users, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <motion.div {...fadeIn} className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">RealTask</span>
        </motion.div>
        <nav className="ml-auto flex gap-4 items-center">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Войти</Link>
          <Button asChild size="sm">
            <Link href="/register">Начать</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
       
        <section className="relative py-20 lg:py-32 px-4 overflow-hidden">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
             <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary rounded-full blur-[120px]" />
             <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6"
            >
              Управляйте проектами <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
               с абсолютной легкостью и точностью
              </span>
            </motion.h1>
            
            <motion.p 
              {...fadeIn}
              transition={{ delay: 0.2 }}
              className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mb-10"
            >
              Визуальный контроль, мгновенный чат и Drag-and-Drop, который чувствуется кончиками пальцев.
            </motion.p>

            <motion.div 
              {...fadeIn}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-4"
            >
              <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                <Link href="/register" className="flex items-center gap-2">
                  Создать доску <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        
        <section className="py-20 bg-muted/30 px-4">
          <div className="container mx-auto">
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {[
                { icon: CheckCircle2, title: "Умный Канбан", text: "Оптимистичные обновления и плавные переходы." },
                { icon: Users, title: "Живой Чат", text: "Обсуждайте задачи прямо в карточках без перезагрузки." },
                { icon: Zap, title: "Edge Performance", text: "Минимальный пинг благодаря базе Neon в 2026." }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  variants={fadeIn}
                  whileHover={{ y: -5 }}
                  className="flex flex-col items-center p-8 bg-background rounded-2xl border shadow-sm hover:border-primary/50 transition-colors"
                >
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="py-10 border-t text-center px-4">
        <p className="text-sm text-muted-foreground">© 2026 RealTask. Сделано для каждого.</p>
      </footer>
    </div>
  );
}