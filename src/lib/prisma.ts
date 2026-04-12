import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Настройка для серверной среды (Node.js/Edge)
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

// ВАЖНО: Мы используем обычный DATABASE_URL. 
// Он будет доступен в API-роутах и Server Components, но не попадет в браузер.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Эта ошибка вылетит только в терминале сервера, пользователь её не увидит.
  throw new Error("❌ DATABASE_URL missing. Проверьте .env файл в корне проекта.");
}

// Создаем адаптер напрямую (решение, которое мы нашли ранее)
const adapter = new PrismaNeon({ connectionString });

// Singleton паттерн для Next.js (предотвращает утечку соединений при Hot Reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = 
  globalForPrisma.prisma || 
  new PrismaClient({ 
    adapter: adapter as any 
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;