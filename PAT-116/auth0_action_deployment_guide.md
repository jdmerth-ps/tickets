# Auth0 Action Deployment Guide for Gigya/Cencora Integration

## Overview
This guide explains how to deploy Auth0 Actions to fetch user profile data from Cencora's Gigya-based OIDC implementation.

## Step 1: Create the Action

1. Log in to Auth0 Dashboard
2. Navigate to **Actions** → **Flows** → **Login**
3. Click **Create Action** → **Build Custom**
4. Name it: "Fetch Cencora User Profile"
5. Select trigger: **Post Login**

## Step 2: Add the Action Code

Choose one of the following approaches based on your needs:

### Option A: Simple Profile Enrichment (Recommended to start)
Use `auth0_action_simple.js` - This checks for existing data and attempts basic enrichment.

### Option B: Direct Gigya API Integration
Use `auth0_action_gigya_profile.js` - This makes direct API calls to Gigya (requires API credentials).

### Option C: OIDC Handler
Use `auth0_action_oidc_handler.js` - This attempts multiple approaches to extract profile data.

## Step 3: Configure Secrets

In the Action editor, add these secrets (as needed):

1. **GIGYA_API_KEY**: `4_Pv18t6XTOc51PxyYytQzHA`
2. **GIGYA_SECRET**: Your Gigya secret key (base64 encoded)
3. **CENCORA_USERINFO_URL**: `https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo`

## Step 4: Add Dependencies

If using the Gigya API version, add this dependency:
- `axios`: Latest version

## Step 5: Deploy and Test

1. Click **Deploy**
2. Drag the action into the Login flow
3. Click **Apply**

## Step 6: Monitor and Debug

### Enable Real-time Logs
1. Install Real-time Webtask Logs extension
2. Monitor logs during login attempts

### Check User Profile
After login, check the user profile in Auth0:
- User Management → Users → Select user
- Check both User Metadata and App Metadata tabs

## Troubleshooting

### Issue: No profile data after login
1. Check Action logs for errors
2. Verify the connection name matches exactly
3. Ensure secrets are configured correctly

### Issue: API calls failing
1. Verify API credentials
2. Check network connectivity from Auth0
3. Ensure API endpoints are accessible

### Issue: Partial data only
1. Some fields might be in different locations
2. Check raw_profile data in logs
3. May need to map fields differently

## Testing the Action

1. Create a test user or use existing Cencora test account
2. Log in through the Cencora connection
3. Check logs and user profile
4. Verify email, name, and other fields are populated

## Advanced: Custom Claims

To add profile data to tokens, add this to the action:

```javascript
// Add custom claims to ID token
api.idToken.setCustomClaim('https://yournamespace/email', email);
api.idToken.setCustomClaim('https://yournamespace/name', name);

// Add custom claims to access token
api.accessToken.setCustomClaim('https://yournamespace/email', email);
```

## Notes

- Actions run synchronously during login, so keep them fast
- Use try-catch to prevent login failures
- Log extensively during development
- Remove sensitive logs before production

## Alternative Approach: Rules (Legacy)

If Actions don't work, you can try Auth0 Rules (deprecated but still functional):

```javascript
function fetchCencoraProfile(user, context, callback) {
  if (context.connection !== 'Cencora') {
    return callback(null, user, context);
  }
  
  // Profile enrichment logic here
  
  callback(null, user, context);
}
```