import { prisma } from "@/lib/prisma";
import { CreatedUserSchema } from "@/lib/schemas";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    const validated = CreatedUserSchema.parse(body);

    const exists = await prisma.user.findUnique({ 
      where: { email: validated.email } 
    });
    
    if (exists) {
      return NextResponse.json({ error: "Пользователь с такой почтой уже зарегистрирован" }, { status: 400 });
    }

    const hashedPassword = await hash(validated.password, 12);
    
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        password: hashedPassword,
        role: "USER", 
      },
    });

    return NextResponse.json({ success: true, id: user.id }, { status: 201 });
  } catch (error: unknown) {
    console.error("❌ РЕГИСТРАЦИЯ УПАЛА:", error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: "Ошибка валидации данных", 
          details: error.flatten().fieldErrors 
        }, 
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера при регистрации" }, 
      { status: 500 }
    );
  }
}
