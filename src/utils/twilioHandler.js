// utils/twilioHandler.js

const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;

const client = new twilio(accountSid, authToken);

/**
 * Send a WhatsApp message to a given phone number
 * @param {string} to - The recipient's phone number (e.g., +919xxxxxxxxx)
 * @param {string} body - The message to send
 * @returns {Promise<object>} - Twilio message object or error
 */
const sendWhatsAppMessage = async (to, body) => {
  try {
    const message = await client.messages.create({
      body,
      from: whatsappFrom,
      to: `whatsapp:${to}`,
    });

    console.log(`✅ WhatsApp message sent to ${to}: SID = ${message.sid}`);
    return message;
  } catch (error) {
    console.error(`❌ Failed to send WhatsApp to ${to}:`, error.message);
    return { error };
  }
};

/**
 * (Optional) Send SMS if needed later
 */
const sendSMS = async (to, body) => {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_SMS_NUMBER, // Add this in .env if using SMS
      to,
    });

    console.log(`✅ SMS sent to ${to}: SID = ${message.sid}`);
    return message;
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${to}:`, error.message);
    return { error };
  }
};

module.exports = {
  sendWhatsAppMessage,
  sendSMS, // optional
};
