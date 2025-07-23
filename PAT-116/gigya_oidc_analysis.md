# Gigya/SAP CDC OIDC Integration Analysis

## Problem Summary
Auth0 is not retrieving user profile information from Cencora's Gigya-based OIDC implementation.

## Root Cause
Gigya's OIDC implementation has non-standard behavior:
1. Returns a Gigya session token (`st2.s...`) instead of a standard OAuth authorization code
2. This session token may not properly exchange for an access token that works with the userinfo endpoint
3. Auth0 may not be configured to handle Gigya's specific token format

## Recommended Solutions

### Option 1: Custom Auth0 Action (Recommended)
Create an Auth0 Action that runs after login to fetch user data directly from Gigya:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  // Only run for Cencora connection
  if (event.connection.name !== 'Cencora') return;
  
  // The user is authenticated but missing profile data
  // Use Gigya's accounts.getAccountInfo API with the session token
  
  // Extract the Gigya UID from the sub claim
  const uid = event.user.sub.split('|')[2];
  
  // Call Gigya API to get user info
  // Update user profile with the retrieved data
  api.user.setUserMetadata('name', retrievedName);
  api.user.setUserMetadata('email', retrievedEmail);
};
```

### Option 2: Configure Auth0 Connection Settings
Modify the OIDC connection configuration:
1. Enable "Sync user profile attributes at each login"
2. Add custom token exchange parameters
3. Use a custom user mapping script that handles empty responses

### Option 3: Work with Cencora
Request that Cencora:
1. Returns standard OAuth authorization codes instead of Gigya session tokens
2. Ensures their token endpoint returns access tokens that work with the userinfo endpoint
3. Includes user claims directly in the ID token during token exchange

### Option 4: Use Gigya's REST API
Instead of relying on OIDC userinfo endpoint:
1. Use the Gigya session token to call `accounts.getAccountInfo`
2. Retrieve user profile data using Gigya's native API
3. Map this data in Auth0

## Technical Details

### Gigya Session Token Format
- Starts with `st2.s.`
- Contains encrypted session information
- Can be used with Gigya REST APIs but not standard OAuth endpoints

### Expected OIDC Flow
1. User authenticates with Gigya
2. Gigya returns authorization code
3. Auth0 exchanges code for tokens at `/token` endpoint
4. Auth0 uses access token to call `/userinfo` endpoint
5. User profile data is retrieved and stored

### Actual Flow (What's Happening)
1. User authenticates with Gigya
2. Gigya returns session token (not standard auth code)
3. Auth0 attempts token exchange (may succeed but get limited token)
4. Userinfo call fails or returns empty data
5. User profile remains empty in Auth0

## Next Steps
1. Implement Auth0 Action to fetch data using Gigya APIs
2. Test with Gigya's REST API directly
3. Document the working solution for future reference