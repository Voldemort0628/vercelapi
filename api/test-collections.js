// Test to fetch all collections
const fetch = require('node-fetch');

// Replace with your actual Vercel deployment URL
const API_URL = 'https://vercelapi-five.vercel.app/api/shopify';

async function testCollections() {
  console.log('Testing Shopify API to fetch all collections...');
  console.log(`URL: ${API_URL}`);
  
  try {
    // Make a POST request to get all collections
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GetAllCollections {
            collections(first: 10) {
              edges {
                node {
                  id
                  title
                  handle
                  productsCount
                  description
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
    
    // If collections are found, test the first one
    if (data.data && data.data.collections && data.data.collections.edges.length > 0) {
      const firstCollection = data.data.collections.edges[0].node;
      console.log(`\nFound collection: ${firstCollection.title} (handle: ${firstCollection.handle})`);
      
      // Now test with this collection handle
      console.log(`\nTesting specific collection: ${firstCollection.handle}`);
      
      const collectionResponse = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetSpecificCollection {
              collection(handle: "${firstCollection.handle}") {
                id
                title
                handle
                description
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
                    }
                  }
                }
              }
            }
          `
        })
      });
      
      if (!collectionResponse.ok) {
        const errorText = await collectionResponse.text();
        console.error(`API error (${collectionResponse.status}): ${errorText}`);
        return;
      }
      
      const collectionData = await collectionResponse.json();
      console.log('\n=== COLLECTION RESPONSE ===');
      console.log(JSON.stringify(collectionData, null, 2));
    }
    
  } catch (error) {
    console.error('Error testing the API:', error.message);
  }
}

// Run the test
testCollections();