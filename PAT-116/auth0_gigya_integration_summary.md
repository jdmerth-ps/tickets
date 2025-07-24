# Auth0 Gigya Integration Summary

## Key Finding

Based on the token capture output, **the st* token is NOT directly accessible in Auth0 Actions**. The Auth0 OIDC connection handles the token exchange internally, and only exposes standard user profile information.

## What We Found in the Token Capture

```javascript
// Available in Auth0 Action:
- user.user_id: "oidc|Cencora|c6df5a7a0e6048b6817186433af0c26e"
- connection.name: "Cencora"
- connection.strategy: "oidc"
- No access_token or id_token from the upstream IDP
- No st* token in any of the event objects
```

## Why the st* Token Isn't Available

1. **Auth0 handles the OIDC flow internally**: When using an OIDC connection, Auth0:
   - Receives the authorization code (st* token)
   - Exchanges it for tokens with Gigya
   - Stores the user profile
   - Does NOT expose the intermediate tokens to Actions

2. **Security by design**: Auth0 doesn't expose upstream IDP tokens in the standard event flow for security reasons.

## Recommended Solutions

### Solution 1: Use Auth0 Management API (Requires Configuration)

```javascript
// In your Auth0 Action
const management = new ManagementClient({
  domain: event.secrets.AUTH0_DOMAIN,
  clientId: event.secrets.AUTH0_CLIENT_ID,
  clientSecret: event.secrets.AUTH0_CLIENT_SECRET,
  scope: 'read:users read:user_idp_tokens'
});

const fullUser = await management.getUser({ id: event.user.user_id });
const cencoraIdentity = fullUser.identities?.find(id => id.connection === 'Cencora');

// cencoraIdentity.access_token might contain the token you need
```

**Requirements**:
- Create a Management API application in Auth0
- Grant it `read:user_idp_tokens` scope
- Store credentials as Action secrets

### Solution 2: Custom API Endpoint

Since the st* token isn't available in Actions, handle the token exchange in your application:

1. **Auth0 Action** stores metadata:
```javascript
api.user.setAppMetadata('needs_gigya_sync', true);
api.idToken.setCustomClaim('cencora_user_id', extractedUserId);
```

2. **Your Application** checks for the flag and calls Gigya:
```javascript
if (user.needs_gigya_sync) {
  // Make API call to exchange tokens
  // Store the result
}
```

### Solution 3: Pre-User Registration Hook

If you need the st* token during user creation, consider using a Pre-User Registration hook instead, which might have access to more authentication context.

## What Actually Works

Based on testing, here's what you CAN do in Auth0 Actions:

1. **Extract Cencora User ID**: 
   ```javascript
   const cencoraUserId = event.user.user_id.split('|')[2];
   ```

2. **Add Custom Claims**:
   ```javascript
   api.idToken.setCustomClaim('cencora_user_id', cencoraUserId);
   api.accessToken.setCustomClaim('cencora_user_id', cencoraUserId);
   ```

3. **Store Metadata**:
   ```javascript
   api.user.setAppMetadata('gigya_integration', {
     cencora_user_id: cencoraUserId,
     last_login: new Date().toISOString()
   });
   ```

## Recommended Approach

Given the constraints:

1. **Use the working solution** (`auth0_action_working_solution.js`) to:
   - Extract available user information
   - Add custom claims to tokens
   - Store metadata for later use

2. **If you need the userinfo data**, implement one of:
   - Management API approach (if you can get `read:user_idp_tokens` permission)
   - Custom API endpoint in your application
   - Direct Gigya API integration using stored credentials

3. **For debugging**, use the token interceptor action to see exactly what data is available in your specific setup.

## Next Steps

1. Deploy the working solution action
2. Test with a real login flow
3. Check if the Management API approach gives you access to IDP tokens
4. If not, implement the API endpoint approach in your application

The key insight is that Auth0's OIDC connection abstracts away the Gigya-specific authentication details, which is good for security but means you need alternative approaches to access Gigya-specific functionality.