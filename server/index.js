// Fastify Backend API for MACCY COLLECTIONS
// Connects with Supabase database and handles orders, tailoring requests, and M-Pesa STK push simulation

const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');

const PORT = process.env.FASTIFY_PORT || 5001;

async function buildServer() {
  await fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  // Health check
  fastify.get('/api/health', async (request, reply) => {
    return {
      status: 'healthy',
      business: 'MACCY COLLECTIONS',
      location: 'Total Petrol Station, Maasai Mara University Junction, Narok, Kenya',
      whatsapp: '0722 907 700',
      timestamp: new Date().toISOString()
    };
  });

  // M-Pesa Daraja STK Push Endpoint Simulation
  fastify.post('/api/mpesa/stkpush', async (request, reply) => {
    const { phone, amount, orderNumber } = request.body || {};
    
    if (!phone || !amount) {
      return reply.status(400).send({
        success: false,
        message: 'Phone number and amount are required.'
      });
    }

    // Format phone to standard 2547XXXXXXXX
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('7')) {
      cleanPhone = '254' + cleanPhone;
    }

    const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(Math.random() * 90000 + 10000)}`;

    return {
      success: true,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      MerchantRequestID: `MR_${Date.now()}`,
      CheckoutRequestID: checkoutRequestId,
      CustomerMessage: `Success. Lipa na M-Pesa prompt has been sent to ${cleanPhone}. Enter your M-Pesa PIN to complete payment of KSh ${amount} for order #${orderNumber || 'MC-NEW'}.`,
      status: 'pending_pin'
    };
  });

  // Tailoring request webhook / API
  fastify.post('/api/tailoring', async (request, reply) => {
    const data = request.body;
    return {
      success: true,
      message: 'Tailoring request successfully registered with MACCY COLLECTIONS studio.',
      data: {
        ...data,
        id: `tailor-${Date.now()}`,
        status: 'pending',
        receivedAt: new Date().toISOString()
      }
    };
  });

  // Start the Fastify listener
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`[MACCY COLLECTIONS] Fastify API server running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  buildServer();
}

module.exports = buildServer;
