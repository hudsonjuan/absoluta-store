const mercadopago = require('mercadopago');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // Get the access token from environment variable
        const accessToken = process.env.MP_ACCESS_TOKEN;
        
        if (!accessToken) {
            throw new Error('Mercado Pago access token not configured');
        }

        // Configure Mercado Pago with the access token
        mercadopago.configure({
            access_token: accessToken
        });

        // Parse the request body
        const { items, total } = JSON.parse(event.body);

        // Create preference
        const preference = {
            items: items.map(item => ({
                id: item.id,
                title: item.title,
                quantity: item.quantity,
                currency_id: 'BRL',
                unit_price: item.unit_price,
                description: item.description,
                picture_url: item.picture_url || 'https://via.placeholder.com/150',
                category_id: item.category_id || 'beauty'
            })),
            auto_return: 'all',
            back_urls: {
                success: `${process.env.URL}/success`,
                pending: `${process.env.URL}/pending`,
                failure: `${process.env.URL}/error`
            },
            external_reference: `absoluta-${Date.now()}`,
            notification_url: process.env.URL ? 
                `${process.env.URL}/.netlify/functions/webhook` : 
                'https://webhook.site/your-webhook-url',
            statement_descriptor: 'ABSOLUTASTORE',
            binary_mode: true
        };

        const response = await mercadopago.preferences.create(preference);

        return {
            statusCode: 200,
            body: JSON.stringify({
                url: response.body.init_point || response.body.sandbox_init_point,
                preferenceId: response.body.id
            })
        };
    } catch (error) {
        console.error('Error creating preference:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Error creating payment preference',
                details: error.message
            })
        };
    }
};
