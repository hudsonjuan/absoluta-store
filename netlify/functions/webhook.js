const mercadopago = require('mercadopago');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // Configure Mercado Pago with the access token
        mercadopago.configure({
            access_token: process.env.MP_ACCESS_TOKEN
        });

        // Get the payment ID from the query parameters
        const paymentId = event.queryStringParameters?.id || 
                         event.queryStringParameters?.['data.id'];

        if (!paymentId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing payment ID' })
            };
        }

        // Get payment details
        const payment = await mercadopago.payment.get(paymentId);

        // Process the payment status
        const paymentStatus = payment.response.status;
        
        // Here you would typically update your database with the payment status
        console.log('Payment status:', paymentStatus);
        console.log('Payment details:', JSON.stringify(payment.response, null, 2));

        // Return a success response to Mercado Pago
        return {
            statusCode: 200,
            body: JSON.stringify({ received: true })
        };
    } catch (error) {
        console.error('Webhook error:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Error processing webhook',
                details: error.message
            })
        };
    }
};
