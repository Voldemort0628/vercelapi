#!/bin/bash

# Test script to query the Shopify API via curl

API_URL="https://vercelapi-five.vercel.app/api/shopify"

echo "Testing Shopify API at $API_URL"
echo "Sending a request to get all collections..."

# Make a POST request to the API with a simple GraphQL query
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "query GetAllCollections { collections(first: 10) { edges { node { id title handle productsCount description } } } }"}' \
  "$API_URL"

echo -e "\n\nRequest complete."