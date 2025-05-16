// Example React component for using the Shopify API proxy
// Import this into your React project

import React, { useState, useEffect } from 'react';

// Your Vercel API endpoint URL
const API_URL = 'https://vercelapi-five.vercel.app/api/shopify';

function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch products from the Shopify API
    async function fetchProducts() {
      try {
        setLoading(true);
        
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // We don't need to send a specific query as the API will return all products by default
          body: JSON.stringify({})
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Check if we have valid product data
        if (data && data.data && data.data.products && data.data.products.edges) {
          // Transform the data into a simpler format
          const productList = data.data.products.edges.map(edge => {
            const product = edge.node;
            
            // Get the first image URL if available
            const imageUrl = product.images && 
                            product.images.edges && 
                            product.images.edges.length > 0 
                            ? product.images.edges[0].node.url 
                            : null;
            
            // Get the price if available
            const price = product.variants && 
                         product.variants.edges && 
                         product.variants.edges.length > 0 &&
                         product.variants.edges[0].node.price
                         ? product.variants.edges[0].node.price
                         : null;
            
            return {
              id: product.id,
              title: product.title,
              description: product.description,
              handle: product.handle,
              imageUrl,
              price: price ? `${price.amount} ${price.currencyCode}` : 'N/A'
            };
          });
          
          setProducts(productList);
        } else {
          throw new Error('Invalid data structure received from API');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.message);
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>All Products</h2>
      <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {products.map(product => (
          <div key={product.id} className="product-card" style={{ border: '1px solid #eee', padding: '15px', borderRadius: '5px' }}>
            {product.imageUrl && (
              <img 
                src={product.imageUrl} 
                alt={product.title} 
                style={{ width: '100%', height: 'auto', marginBottom: '10px' }}
              />
            )}
            <h3>{product.title}</h3>
            <p style={{ color: '#666' }}>{product.price}</p>
            <p style={{ fontSize: '14px' }}>{product.description ? `${product.description.substring(0, 100)}...` : ''}</p>
            <a 
              href={`https://your-shopify-store.myshopify.com/products/${product.handle}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'inline-block', padding: '8px 16px', background: '#5c6ac4', color: 'white', textDecoration: 'none', borderRadius: '4px' }}
            >
              View Product
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductGrid;