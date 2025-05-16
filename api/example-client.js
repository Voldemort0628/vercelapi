// Example of how to call the Shopify API from your React app

// Function to fetch products from your Vercel API proxy
async function fetchProducts() {
  try {
    const response = await fetch('https://vercelapi-five.vercel.app/api/shopify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No need to include Authorization header for Storefront API
      },
      // Make sure to stringify the body properly
      body: JSON.stringify({
        query: `
          {
            products(first: 10) {
              edges {
                node {
                  id
                  title
                  description
                }
              }
            }
          }
        `
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Example of how to use the function in your React component
/*
import React, { useEffect, useState } from 'react';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const result = await fetchProducts();
        setProducts(result.data.products.edges.map(edge => edge.node));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Products</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <h3>{product.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
*/