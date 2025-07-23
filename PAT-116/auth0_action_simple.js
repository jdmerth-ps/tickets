/**
 * Auth0 Action: Fetch Gigya Profile (Simple Version)
 * Type: Post Login
 * 
 * This action attempts to enrich user profile data after Cencora login
 */

exports.onExecutePostLogin = async (event, api) => {
  // Only run for Cencora connection
  if (event.connection.name !== 'Cencora') {
    return;
  }

  // Skip if we already have profile data
  if (event.user.email && event.user.name) {
    return;
  }

  console.log('Attempting to enrich user profile for:', event.user.sub);

  try {
    // Check if we have any tokens from the authentication
    const { access_token, id_token } = event.authentication || {};
    
    // Check if there's a session token in the context
    const sessionToken = event.session?.gigya_session_token;
    
    // Option 1: Check if profile data is in the raw user profile
    if (event.user.raw_profile) {
      console.log('Raw profile available:', JSON.stringify(event.user.raw_profile));
      
      // Map fields from raw profile
      if (event.user.raw_profile.email && !event.user.email) {
        api.user.setUserMetadata('email', event.user.raw_profile.email);
      }
      
      if (event.user.raw_profile.name && !event.user.name) {
        api.user.setUserMetadata('name', event.user.raw_profile.name);
      }
    }

    // Option 2: Parse the user ID to get Gigya UID
    const gigyaUid = event.user.sub.split('|')[2];
    
    // Store the UID for potential future use
    api.user.setAppMetadata('gigya_uid', gigyaUid);
    
    // If email is still missing, construct it from username if available
    if (!event.user.email && event.user.username) {
      // Only do this if username looks like an email
      if (event.user.username.includes('@')) {
        api.user.setUserMetadata('email', event.user.username);
      }
    }

    // Log what data we have available
    console.log('User data available:', {
      sub: event.user.sub,
      email: event.user.email,
      name: event.user.name,
      nickname: event.user.nickname,
      username: event.user.username,
      has_raw_profile: !!event.user.raw_profile
    });

  } catch (error) {
    console.error('Error in profile enrichment:', error);
    // Don't block login
  }
};

/**
 * Alternative approach: Use Management API in a separate action
 * This would run as a Post User Registration action
 */
exports.onExecutePostUserRegistration = async (event, api) => {
  if (event.connection.name !== 'Cencora') {
    return;
  }

  // For new users, we might want to make an API call to get their profile
  console.log('New Cencora user registered:', event.user.user_id);
  
  // You could trigger an async job here to fetch profile data
  // api.access.deny() can be used if profile is required
};