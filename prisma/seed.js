const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  // Seed Gym Types
  const gymTypesCount = 10;
  const gymTypes = [];
  for (let i = 0; i < gymTypesCount; i++) {
    const gymType = await prisma.gymTypes.create({
      data: {
        name: faker.company.companyName(),
      },
    });
    gymTypes.push(gymType);
  }
  console.log(`Seeded ${gymTypesCount} gym types.`);

  // Seed Branches
  const branchesCount = 50;
  const branches = [];
  for (let i = 0; i < branchesCount; i++) {
    const gymType = faker.helpers.arrayElement(gymTypes);
    const branch = await prisma.branches.create({
      data: {
        name: faker.company.companyName() + ' Branch',
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        contact_number: faker.phone.number(),
        opening_hours: `${faker.number.int({ min: 6, max: 10 })}:00 - ${faker.number.int({ min: 17, max: 23 })}:00`,
        latitude: parseFloat(faker.location.latitude()),
        longitude: parseFloat(faker.location.longitude()),
        google_maps_url: faker.internet.url(),
        gym_type_id: gymType.gym_type_id,
        is_deleted: false,
      },
    });
    branches.push(branch);
  }
  console.log(`Seeded ${branchesCount} branches.`);

  // Seed Memberships
  const membershipsCount = 20;
  const memberships = [];
  for (let i = 0; i < membershipsCount; i++) {
    const branch = faker.helpers.arrayElement(branches);
    const membership = await prisma.memberships.create({
      data: {
        name: faker.commerce.department(),
        description: faker.lorem.sentence(),
        duration_days: faker.number.int({ min: 30, max: 365 }),
        price_rupees: faker.number.int({ min: 500, max: 5000 }),
        branch_id: branch.branch_id,
      },
    });
    memberships.push(membership);
  }
  console.log(`Seeded ${membershipsCount} memberships.`);

  // Seed Users
  const usersCount = 200;
  const users = [];
  for (let i = 0; i < usersCount; i++) {
    const user = await prisma.users.create({
      data: {
        email: faker.internet.email(),
        password_hash: faker.internet.password(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        phone: faker.phone.number(),
        role: faker.helpers.arrayElement(['member', 'trainer', 'staff']),
        is_deleted: false,
      },
    });
    users.push(user);
  }
  console.log(`Seeded ${usersCount} users.`);

  // Seed User Profiles
  for (const user of users) {
    if (faker.datatype.boolean()) {
      await prisma.userProfiles.create({
        data: {
          user_id: user.user_id,
          date_of_birth: faker.date.past({ years: 30, refDate: new Date(2003, 0, 1) }),
          gender: faker.helpers.arrayElement(['male', 'female', 'other']),
          height_cm: parseFloat(faker.number.float({ min: 150, max: 200, precision: 0.1 }).toFixed(1)),
          weight_kg: parseFloat(faker.number.float({ min: 50, max: 100, precision: 0.1 }).toFixed(1)),
          food_preferences: faker.helpers.arrayElements(['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'None'], faker.number.int({ min: 1, max: 3 })),
          lifestyle: {
            exercise_frequency: faker.number.int({ min: 1, max: 7 }),
            sleep_hours: faker.number.int({ min: 5, max: 9 }),
            stress_level: faker.helpers.arrayElement(['Low', 'Moderate', 'High']),
          },
        },
      });
    }
  }
  console.log(`Seeded user profiles.`);

  // Seed Payments
  const paymentsCount = 300;
  for (let i = 0; i < paymentsCount; i++) {
    const user = faker.helpers.arrayElement(users);
    await prisma.payments.create({
      data: {
        user_id: user.user_id,
        amount_cents: faker.number.int({ min: 5000, max: 20000 }),
        currency: 'INR',
        payment_method: faker.helpers.arrayElement(['Credit Card', 'Debit Card', 'UPI', 'Net Banking']),
        reference_code: faker.string.alphanumeric(10).toUpperCase(),
        status: faker.helpers.arrayElement(['success', 'pending', 'failed', 'refunded']),
      },
    });
  }
  console.log(`Seeded ${paymentsCount} payments.`);

  // Seed User Memberships
  const userMembershipsCount = 100;
  for (let i = 0; i < userMembershipsCount; i++) {
    const user = faker.helpers.arrayElement(users);
    const membership = faker.helpers.arrayElement(memberships);
    const startDate = faker.date.past({ years: 1 });
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + membership.duration_days);

    await prisma.userMemberships.create({
      data: {
        user_id: user.user_id,
        membership_id: membership.membership_id,
        start_date: startDate,
        end_date: endDate,
        status: faker.helpers.arrayElement(['active', 'started', 'not_started', 'ended', 'expired', 'cancelled']),
      },
    });
  }
  console.log(`Seeded ${userMembershipsCount} user memberships.`);

  // Seed Progress Entries
  const progressEntriesCount = 300;
  for (let i = 0; i < progressEntriesCount; i++) {
    const user = faker.helpers.arrayElement(users);
    await prisma.progressEntries.create({
      data: {
        user_id: user.user_id,
        date_recorded: faker.date.recent({ days: 30 }),
        weight_kg: faker.number.float({ min: 50, max: 100, precision: 0.1 }),
        body_fat_pct: faker.number.float({ min: 10, max: 30, precision: 0.1 }),
        notes: faker.lorem.sentence(),
      },
    });
  }
  console.log(`Seeded ${progressEntriesCount} progress entries.`);

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
