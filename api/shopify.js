// Import fetch - using require for better compatibility with Vercel serverless environment
const fetch = require('node-fetch');

// For debugging - enable this to see logs in Vercel Function Logs
const DEBUG = true;

function debug(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

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
  // Log the request details
  debug('Received request:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Your Shopify store domain and Storefront API token
    // You can also hardcode these values for testing (but never in production long-term)
    const shopifyDomain = process.env.SHOPIFY_DOMAIN || 'your-store.myshopify.com'; // Replace with your actual domain
    const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || 'your-token-here'; // Replace with your actual token

    // Log for debugging (will appear in Vercel Function Logs)
    console.log('Environment debug:', {
      hasShopifyDomain: !!process.env.SHOPIFY_DOMAIN,
      hasStorefrontToken: !!process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      envVarNames: Object.keys(process.env).filter(key => key.includes('SHOPIFY'))
    });

    if (!shopifyDomain || !storefrontAccessToken) {
      return res.status(500).json({ error: 'Missing Shopify credentials', envDebug: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
      }});
    }

    // Modify the incoming query to filter for the links-collection
    let requestBody = req.body;
    
    // If no specific collection is requested, override to get links-collection
    if (requestBody && requestBody.query && !requestBody.query.includes('collection(handle:')) {
      // Collection handle for "links"
      const collectionHandle = 'links';
      
      // Build a query that specifically targets the links collection
      // Using proper Shopify Storefront API query format
      const modifiedQuery = `
        query GetCollectionProducts {
          collection(handle: "${collectionHandle}") {
            id
            title
            handle
            products(first: 50) {
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
        }
      `;
      
      // Replace the query with our modified version
      requestBody = { query: modifiedQuery };
    }
    
    // Log what we're sending to Shopify
    debug('Sending to Shopify:', {
      url: `https://${shopifyDomain}/api/2024-07/graphql.json`,
      body: requestBody
    });
    
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

    // Log Shopify's response status
    debug('Shopify response status:', response.status);
    
    // Get the response data
    const data = await response.json();
    
    // Log the response from Shopify
    debug('Shopify response data:', data);

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