// Import fetch - using require for better compatibility with Vercel serverless environment
const fetch = require('node-fetch');

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
  // For troubleshooting only - log the request body
  console.log('Request body:', req.body);

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // IMPORTANT: For testing only - replace these with your actual values
    // In production, ALWAYS use environment variables
    const shopifyDomain = "growth-link.myshopify.com";  // Replace with actual domain
    const storefrontAccessToken = "your-token-here";  // Replace with actual token
    
    // Log for debugging
    console.log('Environment:', {
      domain: shopifyDomain,
      tokenPresent: !!storefrontAccessToken,
      body: req.body
    });

    // If no body is provided, use a default query to test the connection
    let requestBody = req.body;
    
    if (!requestBody || !requestBody.query) {
      // Default test query to get all products
      // Using proper Shopify Storefront API query format with operation name
      requestBody = {
        query: `
          query GetAllProducts {
            products(first: 100) {
              edges {
                node {
                  id
                  title
                  description
                  handle
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                  variants(first: 1) {
                    edges {
                      node {
                        id
                        price {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `
      };
    }
    
    // Make the request to Shopify
    console.log('Making request to Shopify API...');
    
    // Forward the GraphQL query to Shopify's Storefront API - using latest 2024-07 version
    const response = await fetch(
      `https://${shopifyDomain}/api/2024-07/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
        },
        body: JSON.stringify(requestBody),
      }
    );

    // Get the response status and headers for debugging
    console.log('Shopify API response status:', response.status);
    
    // Get the response data
    const data = await response.json();
    console.log('Shopify API response data:', data);

    // Return the data to the client
    return res.status(200).json(data);
  } catch (error) {
    console.error('Shopify API Proxy Error:', error);
    return res.status(500).json({ 
      error: 'Error connecting to Shopify API', 
      message: error.message,
      stack: error.stack
    });
  }
};

// Export the wrapped handler using CommonJS syntax for better compatibility
module.exports = allowCors(handler);