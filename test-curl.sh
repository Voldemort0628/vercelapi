#!/bin/bash

# Test script to query the Shopify API via curl

API_URL="https://vercelapi-five.vercel.app/api/shopify"

echo "Testing Shopify API at $API_URL"
echo "Sending a request to get all products..."

# Make a POST request to the API with a GraphQL query to get all products
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "query GetAllProducts { products(first: 50) { edges { node { id title handle description images(first: 1) { edges { node { url } } } variants(first: 1) { edges { node { id price { amount currencyCode } } } } } } } }"}' \
  "$API_URL"

echo -e "\n\nRequest complete."