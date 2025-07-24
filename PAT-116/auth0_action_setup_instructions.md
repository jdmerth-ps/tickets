# Auth0 Action Setup Instructions for Cencora/Gigya Integration

## Prerequisites Checklist

### 1. Enable Token Storage on Connection
1. Go to Auth0 Dashboard > Authentication > Enterprise
2. Find and click on your "Cencora" connection
3. Scroll to "Advanced Settings" at the bottom
4. Expand the "OAuth2" section
5. **Enable "Store tokens"** - This is critical!
6. Save the connection

### 2. Create Management API Application
1. Go to Auth0 Dashboard > Applications
2. Click "Create Application"
3. Name: "Management API for Actions" (or similar)
4. Type: Select "Machine to Machine"
5. Authorize for: "Auth0 Management API"
6. Select these scopes:
   - `read:users`
   - `read:user_idp_tokens`
7. Click "Authorize"
8. Save the Client ID and Client Secret

### 3. Deploy the Action
1. Go to Auth0 Dashboard > Actions > Flows > Login
2. Click "Custom" tab > "Create Action"
3. Name: "Cencora Gigya Integration"
4. Copy the code from `auth0_action_final_solution.js`
5. Click "Save Draft"

### 4. Configure Action Secrets
1. While in the Action editor, click "Secrets" (key icon)
2. Add these secrets:

| Key | Value |
|-----|-------|
| AUTH0_DOMAIN | `parcelshield-dev.us.auth0.com` |
| AUTH0_CLIENT_ID | [Client ID from step 2] |
| AUTH0_CLIENT_SECRET | [Client Secret from step 2] |
| GIGYA_USERINFO_URL | `https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo` |

3. Click "Deploy"

### 5. Add Action to Login Flow
1. Go back to the Login Flow
2. Drag your "Cencora Gigya Integration" action to the flow
3. Place it after login
4. Click "Apply"

## Testing the Setup

### 1. Test Login
1. Clear cookies/cache
2. Go to your application
3. Login with Cencora/AAAS credentials
4. Check Auth0 Logs

### 2. Verify in Logs
Look for these log entries:
- "=== Cencora/Gigya Integration Action ==="
- "Found Cencora identity"
- "Got full user profile"
- "Successfully got userinfo!" (if tokens are available)

### 3. Check User Profile
1. Go to User Management > Users
2. Find the test user
3. Check the "app_metadata" for `cencora_integration`
4. Check the "user_metadata" for `gigya_profile`

## Troubleshooting

### "Must provide a domain" Error
- You haven't added the AUTH0_DOMAIN secret
- Add it in Action > Secrets

### "Failed to get Management API token"
- Check AUTH0_CLIENT_ID and AUTH0_CLIENT_SECRET
- Verify the M2M app has correct scopes
- Make sure the M2M app is authorized for Management API

### "Has access_token: false"
- The connection isn't storing tokens
- Go back to step 1 and enable "Store tokens"
- User needs to log in again after enabling

### "Userinfo call failed: 401"
- The token might be expired
- The token format might not be compatible
- Check if it's an st* token (Gigya session) vs OAuth token

## Expected Results

When working correctly, you should see:
1. Custom claims in ID token: `cencora_user_id`, `gigya_uid`
2. User metadata populated with Gigya profile data
3. App metadata showing successful integration

## Alternative Approach

If the st* tokens still aren't accessible:
1. Implement a backend API endpoint
2. Use the Auth0 token to authenticate
3. Make direct Gigya API calls with stored credentials
4. Return enriched profile to your application

## Notes

- The st* tokens are Gigya session tokens, not standard OAuth tokens
- Auth0 might process these internally without exposing them
- The Management API approach requires proper permissions
- Token storage must be enabled BEFORE the user logs in