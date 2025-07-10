const { PrismaClient } = require('@prisma/client');
const cron = require('node-cron');
const { sendWhatsAppMessage } = require('./twilioHandler');

const prisma = new PrismaClient();

cron.schedule('* * * * *', async () => {
  const leads = await prisma.lead.findMany({
    where: {
      status: 'new',
      createdAt: {
        // lte: new Date(Date.now() - 24 * 60 * 60 * 1000), // older than 1 day
        lte: new Date(Date.now()), // older than 1 day
      },
    },
  });

  for (const lead of leads) {
    await sendWhatsAppMessage(lead.phone, `Hi ${lead.name}, thanks for signing up!`);
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: 'followed_up' },
    });
  }

  console.log(`[Follow-Up] Processed ${leads.length} leads`);
});
