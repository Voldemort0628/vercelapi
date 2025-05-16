// Test script that tries alternative collection names
const fetch = require('node-fetch');

// Replace with your actual Vercel deployment URL
const API_URL = 'https://vercelapi-five.vercel.app/api/shopify';

// List of potential collection handles to try
const collectionHandles = [
  'links',          // Original name we tried
  'link',           // Singular version
  'all',            // Common default collection
  'frontpage',      // Common default collection
  'featured',       // Common collection name
  'main-collection', // Another common name
  'products',       // Generic name
  'homepage',       // Common for featured products
  'shop-all',       // Common for all products
  'best-sellers'    // Another common collection name
];

async function testCollectionHandles() {
  console.log('Testing multiple collection handles...');
  
  for (const handle of collectionHandles) {
    console.log(`\nTrying collection handle: "${handle}"`);
    
    try {
      // Make a POST request to get the specific collection
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetCollection {
              collection(handle: "${handle}") {
                id
                title
                handle
                productsCount
              }
            }
          `
        })
      });
      
      // Check if the request was successful
      if (!response.ok) {
        console.error(`API error (${response.status})`);
        continue;
      }
      
      // Parse the response
      const data = await response.json();
      
      if (data.data && data.data.collection) {
        console.log(`✅ SUCCESS! Found collection: "${handle}"`);
        console.log(JSON.stringify(data.data.collection, null, 2));
        
        // If we found a valid collection, now try to get its products
        console.log(`\nFetching products for collection: "${handle}"`);
        
        const productsResponse = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetCollectionProducts {
                collection(handle: "${handle}") {
                  products(first: 3) {
                    edges {
                      node {
                        id
                        title
                      }
                    }
                  }
                }
              }
            `
          })
        });
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          
          if (productsData.data && 
              productsData.data.collection && 
              productsData.data.collection.products && 
              productsData.data.collection.products.edges) {
            
            const products = productsData.data.collection.products.edges;
            console.log(`Found ${products.length} products in this collection.`);
            
            if (products.length > 0) {
              console.log("Sample products:");
              products.forEach((edge, index) => {
                console.log(`  ${index + 1}. ${edge.node.title} (${edge.node.id})`);
              });
            }
          }
        }
        
      } else {
        console.log(`❌ Collection "${handle}" not found or empty.`);
      }
    } catch (error) {
      console.error(`Error testing collection "${handle}":`, error.message);
    }
  }
}

// Run the test
testCollectionHandles();