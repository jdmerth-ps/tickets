/**
 * Auth0 Action: Handle Gigya OIDC Response
 * Type: Post Login
 * 
 * This action processes the OIDC authentication response from Gigya/Cencora
 * and attempts to extract user profile information.
 */

const axios = require('axios');

exports.onExecutePostLogin = async (event, api) => {
  // Only process Cencora OIDC connections
  if (event.connection.strategy !== 'oidc' || event.connection.name !== 'Cencora') {
    return;
  }

  console.log('Processing Cencora/Gigya OIDC login for user:', event.user.sub);

  try {
    // Check what data we received from the OIDC flow
    const profileData = {
      email: event.user.email,
      name: event.user.name,
      given_name: event.user.given_name,
      family_name: event.user.family_name,
      nickname: event.user.nickname,
      picture: event.user.picture,
      username: event.user.username
    };

    console.log('Current profile data:', profileData);

    // If we're missing critical data, try alternative approaches
    if (!profileData.email || !profileData.name) {
      
      // Approach 1: Check if data is in different fields
      const alternativeFields = {
        email: event.user.preferred_username || event.user.upn || event.user.email_verified,
        name: event.user.display_name || event.user.full_name
      };

      // Approach 2: Extract from claims if available
      if (event.authentication?.idToken) {
        try {
          // The ID token claims might have the data
          const idTokenPayload = JSON.parse(
            Buffer.from(event.authentication.idToken.split('.')[1], 'base64').toString()
          );
          
          console.log('ID Token claims:', idTokenPayload);
          
          // Map any available claims
          if (idTokenPayload.email && !profileData.email) {
            api.user.setUserMetadata('email', idTokenPayload.email);
          }
          
          if (idTokenPayload.name && !profileData.name) {
            api.user.setUserMetadata('name', idTokenPayload.name);
          }
        } catch (e) {
          console.error('Failed to parse ID token:', e);
        }
      }

      // Approach 3: Call the userinfo endpoint directly
      if (event.secrets.CENCORA_USERINFO_URL && event.authentication?.accessToken) {
        try {
          const userInfoResponse = await axios.get(event.secrets.CENCORA_USERINFO_URL, {
            headers: {
              'Authorization': `Bearer ${event.authentication.accessToken}`
            },
            timeout: 3000
          });

          if (userInfoResponse.data) {
            console.log('UserInfo response:', userInfoResponse.data);
            
            // Map the response fields
            if (userInfoResponse.data.email) {
              api.user.setUserMetadata('email', userInfoResponse.data.email);
            }
            
            if (userInfoResponse.data.name) {
              api.user.setUserMetadata('name', userInfoResponse.data.name);
            }
            
            if (userInfoResponse.data.given_name) {
              api.user.setUserMetadata('given_name', userInfoResponse.data.given_name);
            }
            
            if (userInfoResponse.data.family_name) {
              api.user.setUserMetadata('family_name', userInfoResponse.data.family_name);
            }
          }
        } catch (error) {
          console.error('UserInfo endpoint call failed:', error.message);
        }
      }

      // Approach 4: Use the Gigya UID to make a direct API call
      const gigyaUid = event.user.sub.split('|')[2];
      if (gigyaUid && event.secrets.GIGYA_API_KEY) {
        // This would require implementing the Gigya API call
        console.log('Could fetch from Gigya API using UID:', gigyaUid);
      }
    }

    // Set a flag to indicate we've processed this user
    api.user.setAppMetadata('profile_enrichment_attempted', true);
    api.user.setAppMetadata('profile_enrichment_date', new Date().toISOString());

  } catch (error) {
    console.error('Error in OIDC profile handler:', error);
    // Log the error but don't block login
    api.user.setAppMetadata('profile_enrichment_error', error.message);
  }
};

/**
 * Helper function to safely extract email from various sources
 */
function extractEmail(user) {
  // Check various possible email fields
  const emailSources = [
    user.email,
    user.preferred_username,
    user.upn,
    user.mail,
    user.emailAddress,
    user.loginId
  ];

  for (const source of emailSources) {
    if (source && source.includes('@')) {
      return source;
    }
  }

  return null;
}