// Direct test with explicit query
const fetch = require('node-fetch');

// Replace with your actual Vercel deployment URL
const API_URL = 'https://vercelapi-five.vercel.app/api/shopify';

async function testShopifyAPI() {
  console.log('Testing Shopify API with explicit collection query...');
  console.log(`URL: ${API_URL}`);
  
  try {
    // Make a POST request to the API with explicit collection query
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GetLinksCollection {
            collection(handle: "links") {
              id
              title
              handle
              products(first: 10) {
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
        `
      })
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      return;
    }
    
    // Parse the response
    const data = await response.json();
    
    // Pretty print the full response
    console.log('\n=== FULL RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error testing the API:', error.message);
  }
}

// Run the test
testShopifyAPI();