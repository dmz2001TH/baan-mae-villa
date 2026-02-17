const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt'); // <--- เพิ่มบรรทัดนี้ครับ
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  await prisma.user.upsert({
    where: { email: 'admin@baanmae.com' },
    update: {},
    create: {
      email: 'admin@baanmae.com',
      name: 'Admin Baan Mae',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ สร้างแอดมินบน Supabase เรียบร้อย!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());