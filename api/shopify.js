import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests with proper content type
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Your Shopify store domain and Storefront API token
    // These should be set as environment variables in your Vercel project
    const shopifyDomain = process.env.SHOPIFY_DOMAIN;
    const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    if (!shopifyDomain || !storefrontAccessToken) {
      return res.status(500).json({ error: 'Missing Shopify credentials' });
    }

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
    return res.status(500).json({ error: 'Error connecting to Shopify API' });
  }
}