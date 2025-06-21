// tests/services.test.js
const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const servicesRoutes = require('../../src/routes/admin/services.routes');
const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use('/services', servicesRoutes);

describe('Services CRUD', () => {
  let createdId;
  let gymId;

  beforeAll(async () => {
    // Seed a gym so foreign key constraint passes
    const gym = await prisma.gyms.create({
      data: {
        // minimal required fields on gyms model
        gym_types: {
          create: { name: 'test-type' }
        },
        created_at: new Date()
      },
      include: { gym_types: true }
    });
    gymId = gym.gym_id;
  });

  afterAll(async () => {
    // Clean up services and gyms
    await prisma.services.deleteMany();
    await prisma.gyms.deleteMany();
    await prisma.gym_types.deleteMany();
    await prisma.$disconnect();
  });

  it('POST /services → 201', async () => {
    const res = await request(app)
      .post('/services')
      .send({ gym_id: gymId, name: 'Sauna-' + Date.now(), price_rupees: 1500 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('service_id');
    createdId = res.body.service_id;
  });

  it('GET /services/:id → 200', async () => {
    const res = await request(app).get(`/services/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.service_id).toBe(createdId);
  });

  it('PUT /services/:id → 200', async () => {
    const newName = 'Infrared Sauna-' + Date.now();
    const res = await request(app)
      .put(`/services/${createdId}`)
      .send({ name: newName, description: 'heated', price_rupees: 1800 });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(newName);
  });

  it('DELETE /services/:id → 200', async () => {
    const res = await request(app).delete(`/services/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Service deleted.');
  });
});
