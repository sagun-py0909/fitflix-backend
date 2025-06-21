// tests/amenities.test.js
const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const amenitiesRoutes = require('../../src/routes/admin/amenities.routes.js');
const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use('/amenities', amenitiesRoutes);

describe('Amenities CRUD', () => {
  let createdId;

  afterAll(async () => {
    // Clean up any amenities we've created
    await prisma.amenities.deleteMany();
    await prisma.$disconnect();
  });

  it('POST /amenities → 201', async () => {
    const res = await request(app)
      .post('/amenities')
      .send({ name: 'Pool-' + Date.now(), icon_url: null });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('amenity_id');
    createdId = res.body.amenity_id;
  });

  it('GET /amenities/:id → 200', async () => {
    const res = await request(app).get(`/amenities/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.amenity_id).toBe(createdId);
  });

  it('PUT /amenities/:id → 200', async () => {
    const newName = 'Swimming Pool-' + Date.now();
    const res = await request(app)
      .put(`/amenities/${createdId}`)
      .send({ name: newName, icon_url: null });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(newName);
  });

  it('DELETE /amenities/:id → 200', async () => {
    const res = await request(app).delete(`/amenities/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Amenity deleted.');
  });
});
