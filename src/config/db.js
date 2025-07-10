// src/config/db.js
const { PrismaClient } = require('@prisma/client');

let prisma;

// This ensures that in development, we don't create a new PrismaClient instance
// with every hot reload, which can lead to too many database connections.
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = prisma;