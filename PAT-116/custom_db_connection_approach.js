/**
 * Custom Database Connection Script for Gigya/Cencora
 * 
 * This approach gives you full control over the authentication flow
 * and access to the st* tokens
 */

// Login script for custom database connection
function login(email, password, callback) {
  const axios = require('axios');
  
  // Step 1: Authenticate with Gigya
  axios.post('https://tst.aaas.cencora.com/accounts.login', {
    loginID: email,
    password: password,
    APIKey: '4_Pv18t6XTOc51PxyYytQzHA'
  })
  .then(response => {
    if (response.data.errorCode === 0) {
      // We have the session token!
      const sessionToken = response.data.sessionInfo.sessionToken; // This is the st* token
      const uid = response.data.UID;
      
      // Step 2: Get full user info
      return axios.get('https://tst.aaas.cencora.com/accounts.getAccountInfo', {
        params: {
          login_token: sessionToken,
          APIKey: '4_Pv18t6XTOc51PxyYytQzHA'
        }
      });
    } else {
      throw new Error(response.data.errorMessage);
    }
  })
  .then(userResponse => {
    const profile = userResponse.data.profile;
    
    // Return user profile to Auth0
    callback(null, {
      user_id: userResponse.data.UID,
      email: profile.email,
      email_verified: true,
      name: `${profile.firstName} ${profile.lastName}`,
      given_name: profile.firstName,
      family_name: profile.lastName,
      // Store the session token in app_metadata
      app_metadata: {
        gigya_session_token: userResponse.data.sessionInfo.sessionToken,
        gigya_uid: userResponse.data.UID
      }
    });
  })
  .catch(error => {
    callback(new Error('Authentication failed'));
  });
}

// Get user script
function getByEmail(email, callback) {
  // Optional: Implement user lookup by email
  callback(null, null); // User not found, will trigger login
}