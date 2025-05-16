// Simple test script to check what data comes back from the Shopify API
const fetch = require('node-fetch');

// Replace with your actual Vercel deployment URL
const API_URL = 'https://vercelapi-five.vercel.app/api/debug';

async function testShopifyAPI() {
  console.log('Testing Shopify API endpoint...');
  console.log(`URL: ${API_URL}`);
  
  try {
    // Make a POST request to the API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: "{}" }) // Need to provide a query object, even if empty
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
    
    // Check if we got the expected data structure
    if (data.data && data.data.collection) {
      console.log('\n=== COLLECTION INFO ===');
      console.log(`Collection Title: ${data.data.collection.title}`);
      
      const products = data.data.collection.products.edges.map(edge => edge.node);
      console.log(`\nNumber of Products: ${products.length}`);
      
      if (products.length > 0) {
        // Show detailed info for the first product
        const firstProduct = products[0];
        console.log('\n=== FIRST PRODUCT DETAILS ===');
        console.log(`ID: ${firstProduct.id}`);
        console.log(`Title: ${firstProduct.title}`);
        console.log(`Handle: ${firstProduct.handle}`);
        console.log(`Description: ${firstProduct.description.substring(0, 100)}...`);
        
        // Check for images
        const hasImages = firstProduct.images && 
                         firstProduct.images.edges && 
                         firstProduct.images.edges.length > 0;
        
        if (hasImages) {
          const firstImage = firstProduct.images.edges[0].node;
          console.log(`First Image URL: ${firstImage.url}`);
        } else {
          console.log('No images found for this product.');
        }
        
        // Check for variants
        const hasVariants = firstProduct.variants && 
                           firstProduct.variants.edges && 
                           firstProduct.variants.edges.length > 0;
        
        if (hasVariants) {
          const firstVariant = firstProduct.variants.edges[0].node;
          console.log(`First Variant ID: ${firstVariant.id}`);
          
          if (firstVariant.price) {
            console.log(`Price: ${firstVariant.price.amount} ${firstVariant.price.currencyCode}`);
          }
        } else {
          console.log('No variants found for this product.');
        }
      }
      
      // List all product titles
      console.log('\n=== ALL PRODUCTS ===');
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title}`);
      });
    } else {
      console.error('Unexpected response structure:', data);
    }
    
  } catch (error) {
    console.error('Error testing the API:', error.message);
  }
}

// Run the test
testShopifyAPI();