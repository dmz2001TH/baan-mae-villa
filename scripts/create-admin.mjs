#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('❌ Usage: node scripts/create-admin.mjs <email> <password>');
    console.error('   Example: node scripts/create-admin.mjs admin@baanmaevilla.com mySecurePassword123');
    process.exit(1);
  }

  try {
    console.log('🔗 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log(`⚠️  User with email ${email} already exists`);
      console.log('   Role:', existing.role);
      process.exit(0);
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    console.log('👤 Creating admin user...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   ID:', user.id);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
