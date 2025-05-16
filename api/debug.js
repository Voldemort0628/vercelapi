// Debug endpoint to check environment configuration
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return await fn(req, res);
};

const handler = async (req, res) => {
  try {
    // Return environment info (sanitized for security)
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      shopifyConfigured: {
        hasDomain: !!process.env.SHOPIFY_DOMAIN,
        hasToken: !!process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
      },
      requestInfo: {
        method: req.method,
        headers: {
          origin: req.headers.origin,
          referer: req.headers.referer,
          contentType: req.headers['content-type']
        }
      }
    };
    
    return res.status(200).json(envInfo);
  } catch (error) {
    return res.status(500).json({ error: 'Debug API error' });
  }
};

export default allowCors(handler);