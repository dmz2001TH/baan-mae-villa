#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// ผมใส่ URL ของ Supabase ที่ดึงมาจากโปรเจกต์ของคุณให้เลยครับ
// ตัวแปรนี้จะใช้เชื่อมต่อกับฐานข้อมูลโดยตรง
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.bqpwwlfquropbmsvratz:BaanMaeVilla2026@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('❌ Usage: node scripts/create-admin.mjs <email> <password>');
    console.error('   Example: node scripts/create-admin.mjs test@baanmae.com 123456');
    process.exit(1);
  }

  try {
    console.log('🔗 Connecting to Supabase database...');
    await prisma.$connect();
    console.log('✅ Connected to database');

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log(`⚠️  User with email ${email} already exists`);
      process.exit(0);
    }

    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('👤 Creating admin user...');
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('   You can now login at https://baan-mae-villa.vercel.app/admin');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();