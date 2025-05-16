// Import fetch
import fetch from 'node-fetch';

// Middleware to handle CORS
const allowCors = fn => async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Forward to the actual handler
  return await fn(req, res);
};

// The actual API handler
const handler = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // IMPORTANT: For testing only - replace these with your actual values
    // In production, ALWAYS use environment variables
    const shopifyDomain = "growth-link.myshopify.com";  // REPLACE WITH YOUR ACTUAL DOMAIN
    const storefrontAccessToken = "YOUR_ACTUAL_TOKEN";  // REPLACE WITH YOUR ACTUAL TOKEN
    
    // Forward the GraphQL query to Shopify's Storefront API
    const response = await fetch(
      `https://${shopifyDomain}/api/2023-10/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
        },
        body: JSON.stringify(req.body),
      }
    );

    // Get the response data
    const data = await response.json();

    // Return the data to the client
    return res.status(200).json(data);
  } catch (error) {
    console.error('Shopify API Proxy Error:', error);
    return res.status(500).json({ 
      error: 'Error connecting to Shopify API', 
      details: error.message 
    });
  }
};

// Export the wrapped handler
export default allowCors(handler);