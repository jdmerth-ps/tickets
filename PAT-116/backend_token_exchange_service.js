/**
 * Backend Service for Token Exchange
 * 
 * Since we can't access the st* token in Auth0 Actions,
 * this backend service handles the token exchange after login
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { auth } = require('express-oauth2-jwt-bearer');

const app = express();

// Auth0 middleware
const checkJwt = auth({
  audience: 'https://api.parcelshield.com/',
  issuerBaseURL: 'https://parcelshield-dev.us.auth0.com/'
});

// Gigya configuration
const GIGYA_CONFIG = {
  apiKey: '4_Pv18t6XTOc51PxyYytQzHA',
  baseUrl: 'https://tst.aaas.cencora.com'
};

/**
 * Endpoint to exchange Auth0 token for Gigya user info
 * The frontend calls this after successful Auth0 login
 */
app.post('/api/gigya/enrich-profile', checkJwt, async (req, res) => {
  try {
    const auth0UserId = req.auth.sub;
    const cencoraUserId = auth0UserId.split('|')[2];
    
    console.log('Enriching profile for:', cencoraUserId);
    
    // Option 1: If you have stored Gigya credentials
    // Make a direct API call to get user info
    
    // Option 2: Use OAuth flow
    // Since we can't get the st* token from Auth0,
    // we need to implement a workaround
    
    // Workaround: Store a mapping of Auth0 user IDs to Gigya sessions
    // This would require capturing the session during initial registration
    
    // For now, return what we have
    res.json({
      auth0_user_id: auth0UserId,
      cencora_user_id: cencoraUserId,
      message: 'Profile enrichment requires additional configuration'
    });
    
  } catch (error) {
    console.error('Error enriching profile:', error);
    res.status(500).json({ error: 'Failed to enrich profile' });
  }
});

/**
 * Webhook endpoint for Auth0 post-login
 * Configure this in Auth0 Hooks or Actions to send login events
 */
app.post('/api/webhooks/auth0-login', async (req, res) => {
  const { user, connection, session } = req.body;
  
  if (connection.name === 'Cencora') {
    console.log('Cencora login detected for user:', user.user_id);
    
    // Store any available session data
    // Implement your token exchange logic here
  }
  
  res.status(200).send('OK');
});

/**
 * Alternative: Proxy the Gigya userinfo endpoint
 * This allows your frontend to get Gigya data using Auth0 token
 */
app.get('/api/gigya/userinfo', checkJwt, async (req, res) => {
  try {
    const cencoraUserId = req.auth.sub.split('|')[2];
    
    // You would need to implement a way to get the Gigya session
    // This is the core challenge - getting the st* token
    
    res.json({
      sub: cencoraUserId,
      message: 'Gigya session required for full profile'
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

app.listen(3000, () => {
  console.log('Token exchange service running on port 3000');
});