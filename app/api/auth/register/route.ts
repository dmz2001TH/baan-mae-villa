import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const MIN_PASSWORD_LENGTH = 6;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email) {
      return NextResponse.json(
        { error: "กรุณากรอกอีเมล" },
        { status: 400 }
      );
    }

    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร` },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "อีเมลนี้ถูกใช้งานแล้ว" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
