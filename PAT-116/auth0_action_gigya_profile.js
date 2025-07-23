/**
 * Auth0 Action: Fetch Gigya User Profile
 * Type: Post Login
 * 
 * This action runs after a user logs in through the Cencora OIDC connection
 * and fetches their profile data from Gigya's REST API.
 */

const axios = require('axios');
const crypto = require('crypto');

exports.onExecutePostLogin = async (event, api) => {
  // Only run for Cencora connection
  if (event.connection.name !== 'Cencora') {
    return;
  }

  // Check if we already have profile data
  if (event.user.name && event.user.email) {
    console.log('User already has profile data, skipping Gigya fetch');
    return;
  }

  console.log('Fetching user profile from Gigya for user:', event.user.sub);

  try {
    // Configuration - these should be stored in Auth0 Action secrets
    const GIGYA_API_KEY = event.secrets.GIGYA_API_KEY || '4_Pv18t6XTOc51PxyYytQzHA';
    const GIGYA_SECRET = event.secrets.GIGYA_SECRET;
    const GIGYA_DATACENTER = 'tst.aaas.cencora.com'; // or 'us1', 'eu1', etc.

    // Extract the Gigya UID from the Auth0 user ID
    // Format: oidc|Cencora|{gigya_uid}
    const userIdParts = event.user.sub.split('|');
    const gigyaUid = userIdParts[2];

    if (!gigyaUid) {
      console.error('Could not extract Gigya UID from user sub:', event.user.sub);
      return;
    }

    // Method 1: Try using accounts.getAccountInfo with UID
    const accountInfo = await getAccountInfoByUID(
      GIGYA_DATACENTER,
      GIGYA_API_KEY,
      GIGYA_SECRET,
      gigyaUid
    );

    if (accountInfo && accountInfo.profile) {
      // Update user profile with Gigya data
      const profile = accountInfo.profile;
      
      // Set user metadata
      if (profile.email) {
        api.user.setUserMetadata('email', profile.email);
      }
      
      if (profile.firstName || profile.lastName) {
        const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
        if (fullName) {
          api.user.setUserMetadata('name', fullName);
          api.user.setUserMetadata('given_name', profile.firstName || '');
          api.user.setUserMetadata('family_name', profile.lastName || '');
        }
      }

      if (profile.username) {
        api.user.setUserMetadata('username', profile.username);
      }

      // Set app metadata for additional fields
      if (accountInfo.data) {
        api.user.setAppMetadata('gigya_data', accountInfo.data);
      }

      console.log('Successfully updated user profile from Gigya');
    }

  } catch (error) {
    console.error('Error fetching Gigya profile:', error.message);
    // Don't block login on error, just log it
    api.access.deny(`Failed to fetch user profile: ${error.message}`);
  }
};

/**
 * Get account info from Gigya using UID and signed request
 */
async function getAccountInfoByUID(datacenter, apiKey, secret, uid) {
  // Generate timestamp and nonce
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');

  // Create the base string for signing
  const baseString = `${timestamp}_${nonce}`;
  
  // Create HMAC-SHA1 signature
  const signature = crypto
    .createHmac('sha1', Buffer.from(secret, 'base64'))
    .update(baseString)
    .digest('base64');

  // Build URL
  const url = `https://${datacenter}/accounts.getAccountInfo`;
  
  // Make request
  const response = await axios.get(url, {
    params: {
      UID: uid,
      apiKey: apiKey,
      timestamp: timestamp,
      nonce: nonce,
      sig: signature,
      format: 'json',
      include: 'profile,data,emails,loginIDs'
    },
    timeout: 5000
  });

  if (response.data.errorCode === 0) {
    return response.data;
  } else {
    throw new Error(`Gigya API error: ${response.data.errorMessage || response.data.errorCode}`);
  }
}

/**
 * Alternative: Get account info using OAuth token if available
 */
async function getAccountInfoByToken(datacenter, apiKey, accessToken) {
  const url = `https://${datacenter}/accounts.getAccountInfo`;
  
  const response = await axios.get(url, {
    params: {
      oauth_token: accessToken,
      apiKey: apiKey,
      format: 'json'
    },
    timeout: 5000
  });

  if (response.data.errorCode === 0) {
    return response.data;
  } else {
    throw new Error(`Gigya API error: ${response.data.errorMessage || response.data.errorCode}`);
  }
}