const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, source } = req.body;
    const lead = await prisma.lead.create({
      data: { name, email, phone, source }
    });
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lead', details: error });
  }
};

exports.getLeads = async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};
