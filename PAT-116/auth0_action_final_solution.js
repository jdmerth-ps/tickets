/**
 * Auth0 Action: Final Working Solution for Cencora/Gigya Integration
 * 
 * This action attempts to retrieve IDP tokens and enrich the user profile.
 * Based on testing, the st* token is not directly available in the event object.
 * 
 * Trigger: Post Login
 * Runtime: Node 18
 * 
 * Required Secrets:
 * - AUTH0_DOMAIN: Your Auth0 domain (e.g., parcelshield-dev.us.auth0.com)
 * - AUTH0_CLIENT_ID: Management API client ID
 * - AUTH0_CLIENT_SECRET: Management API client secret
 * - GIGYA_USERINFO_URL: https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo
 */

exports.onExecutePostLogin = async (event, api) => {
  console.log('=== Cencora/Gigya Integration Action ===');
  
  // Check if this is the Cencora OIDC connection
  if (event.connection?.name !== 'Cencora' || event.connection?.strategy !== 'oidc') {
    console.log('Not a Cencora connection, skipping');
    return;
  }
  
  const GIGYA_USERINFO_URL = event.secrets.GIGYA_USERINFO_URL || 
    'https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo';
  
  try {
    // Log current state
    console.log('User ID:', event.user.user_id);
    console.log('Connection:', event.connection.name);
    
    // Extract the upstream user ID
    const upstreamUserId = event.user.user_id.split('|')[2];
    console.log('Upstream User ID:', upstreamUserId);
    
    // Check if IDP tokens are available in identities
    let idpAccessToken = null;
    
    if (event.user.identities && event.user.identities.length > 0) {
      const cencoraIdentity = event.user.identities.find(id => 
        id.connection === 'Cencora' || id.provider === 'oidc'
      );
      
      if (cencoraIdentity) {
        console.log('Found Cencora identity');
        console.log('Has access_token:', !!cencoraIdentity.access_token);
        console.log('Has accessToken:', !!cencoraIdentity.accessToken);
        console.log('Has refresh_token:', !!cencoraIdentity.refresh_token);
        console.log('Has id_token:', !!cencoraIdentity.id_token);
        
        // Try different property names
        idpAccessToken = cencoraIdentity.access_token || 
                        cencoraIdentity.accessToken || 
                        cencoraIdentity.idp_access_token;
        
        if (idpAccessToken) {
          console.log('Token type:', idpAccessToken.substring(0, 10));
          console.log('Is ST token:', idpAccessToken.startsWith('st'));
        }
      }
    }
    
    // Store basic metadata
    api.user.setAppMetadata('cencora_integration', {
      upstream_user_id: upstreamUserId,
      last_login: new Date().toISOString(),
      has_idp_token: !!idpAccessToken,
      token_type: idpAccessToken ? idpAccessToken.substring(0, 5) : 'none'
    });
    
    // Add custom claims
    api.idToken.setCustomClaim('cencora_user_id', upstreamUserId);
    api.accessToken.setCustomClaim('cencora_user_id', upstreamUserId);
    
    // If we have Management API credentials, try to get full user profile
    if (event.secrets.AUTH0_DOMAIN && 
        event.secrets.AUTH0_CLIENT_ID && 
        event.secrets.AUTH0_CLIENT_SECRET) {
      
      console.log('Attempting Management API approach...');
      
      try {
        // First, get a Management API token
        const tokenResponse = await fetch(`https://${event.secrets.AUTH0_DOMAIN}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: event.secrets.AUTH0_CLIENT_ID,
            client_secret: event.secrets.AUTH0_CLIENT_SECRET,
            audience: `https://${event.secrets.AUTH0_DOMAIN}/api/v2/`
          })
        });
        
        if (!tokenResponse.ok) {
          throw new Error(`Failed to get Management API token: ${tokenResponse.status}`);
        }
        
        const { access_token } = await tokenResponse.json();
        
        // Now get the full user profile
        const userResponse = await fetch(
          `https://${event.secrets.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(event.user.user_id)}`,
          {
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Accept': 'application/json'
            }
          }
        );
        
        if (userResponse.ok) {
          const fullUser = await userResponse.json();
          console.log('Got full user profile');
          
          // Check for IDP tokens in the full profile
          const fullIdentity = fullUser.identities?.find(id => id.connection === 'Cencora');
          if (fullIdentity?.access_token) {
            console.log('Found access token in full profile!');
            idpAccessToken = fullIdentity.access_token;
            
            // Try to call userinfo endpoint
            if (idpAccessToken) {
              console.log('Attempting to call Gigya userinfo...');
              const userinfoResponse = await fetch(GIGYA_USERINFO_URL, {
                headers: {
                  'Authorization': `Bearer ${idpAccessToken}`,
                  'Accept': 'application/json'
                }
              });
              
              if (userinfoResponse.ok) {
                const userInfo = await userinfoResponse.json();
                console.log('Successfully got userinfo!');
                
                // Enrich the profile
                api.user.setUserMetadata('gigya_profile', {
                  uid: userInfo.uid || userInfo.sub,
                  email: userInfo.email,
                  name: userInfo.name,
                  given_name: userInfo.given_name,
                  family_name: userInfo.family_name
                });
                
                // Add more claims
                if (userInfo.uid) {
                  api.idToken.setCustomClaim('gigya_uid', userInfo.uid);
                  api.accessToken.setCustomClaim('gigya_uid', userInfo.uid);
                }
              } else {
                console.log('Userinfo call failed:', userinfoResponse.status);
              }
            }
          }
        }
      } catch (mgmtError) {
        console.error('Management API error:', mgmtError.message);
      }
    } else {
      console.log('Management API credentials not configured');
      console.log('Add these secrets to your action:');
      console.log('- AUTH0_DOMAIN');
      console.log('- AUTH0_CLIENT_ID');
      console.log('- AUTH0_CLIENT_SECRET');
    }
    
    console.log('=== Action completed successfully ===');
    
  } catch (error) {
    console.error('Action error:', error);
    api.user.setAppMetadata('cencora_integration_error', {
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

/**
 * Configuration Instructions:
 * 
 * 1. Create a Machine-to-Machine Application in Auth0:
 *    - Go to Applications > Create Application
 *    - Choose "Machine to Machine"
 *    - Authorize for Management API
 *    - Grant scopes: read:users, read:user_idp_tokens
 * 
 * 2. Add these secrets to your Action:
 *    - AUTH0_DOMAIN: Your tenant domain (e.g., parcelshield-dev.us.auth0.com)
 *    - AUTH0_CLIENT_ID: The M2M application's client ID
 *    - AUTH0_CLIENT_SECRET: The M2M application's client secret
 *    - GIGYA_USERINFO_URL: The Gigya userinfo endpoint URL
 * 
 * 3. Ensure your Cencora connection has "Store tokens" enabled:
 *    - Go to Authentication > Enterprise > Cencora
 *    - Advanced Settings > OAuth2
 *    - Enable "Store tokens"
 */