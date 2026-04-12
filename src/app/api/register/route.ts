import { prisma } from "@/lib/prisma";
import { CreatedUserSchema } from "@/lib/schemas";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
  
    const body = await req.json();
    

    const validated = CreatedUserSchema.parse(body);

    
    const exists = await prisma.user.findUnique({ 
      where: { email: validated.email } 
    });
    
    if (exists) {
      return NextResponse.json({ error: "Пользователь уже существует" }, { status: 400 });
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
    
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" }, 
      { status: 500 }
    );
  }
}