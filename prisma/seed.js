const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const password = 'Staff@123'; // Change or make configurable
  const password_hash = await bcrypt.hash(password, 10);

  const staffData = [
    {
      email: 'staff1@fitflix.com',
      first_name: 'Ravi',
      last_name: 'Sharma',
      phone: '9876543210',
    },
    {
      email: 'staff2@fitflix.com',
      first_name: 'Priya',
      last_name: 'Mehta',
      phone: '9123456789',
    },
    {
      email: 'staff3@fitflix.com',
      first_name: 'Aman',
      last_name: 'Verma',
      phone: '9988776655',
    },
  ];

  for (const staff of staffData) {
    const existingUser = await prisma.users.findUnique({
      where: { email: staff.email },
    });

    if (!existingUser) {
      await prisma.users.create({
        data: {
          email: staff.email,
          password_hash,
          first_name: staff.first_name,
          last_name: staff.last_name,
          phone: staff.phone,
          role: 'staff',
        },
      });
      console.log(`✅ Created staff: ${staff.email}`);
    } else {
      console.log(`ℹ️ Skipped (already exists): ${staff.email}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding staff:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
