# Triose SSO / Cencora OIDC Integration Debugging

## Problem Summary
Auth0 OIDC connection with Cencora IDP is not retrieving user profile information (name, email, username) even though authentication is successful.

## Environment Details
- Auth0 Tenant: parcelshield-dev.us.auth0.com
- Connection: Cencora (con_aIEYJY0KxYsiO9E5)
- Organization: triose (org_9IDvOYpNm8p4dq3J)
- Test User: test_001@aaastest.com
- User ID: oidc|Cencora|c6df5a7a0e6048b6817186433af0c26e

## OIDC Configuration
- Issuer: https://tst.aaas.cencora.com/
- Authorization: https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/authorize
- Token: https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/token
- UserInfo: https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo
- JWKS: https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/.well-known/jwks

## Supported Claims & Scopes
- Claims: sub, name, family_name, given_name, preferred_username, email, uid, samlData
- Scopes: openid, profile, email, uid (and custom scopes)
- Grant Types: authorization_code, implicit, refresh_token, client_credentials

## Current Auth0 Configuration
1. **Connection Type**: Back Channel - Client Secret
2. **Scopes**: openid profile email uid
3. **User Mapping**:
```json
{
  "attributes": {
    "name": "${context.userinfo.name}",
    "email": "${context.userinfo.email || context.tokenset.email}",
    "username": "${context.userinfo.preferred_username}",
    "given_name": "${context.userinfo.given_name}",
    "family_name": "${context.userinfo.family_name}",
    "sub_from_userinfo": "${context.userinfo.sub}",
    "sub_from_idtoken": "${context.tokenset.sub}"
  },
  "mapping_mode": "use_map"
}
```

## Issues Identified
1. User profile fields (name, email, username) are empty after successful login
2. Auth0 appears to not be calling or processing the userinfo endpoint response
3. No error logs in Auth0 indicating why profile data isn't being captured

## Testing Attempts
1. **Client Credentials Flow**: Returns access token but not valid for userinfo endpoint (machine-to-machine only)
2. **Authorization Code Flow**: Blocked by redirect URI configuration issues
3. **Resource Owner Password Flow**: Not supported by the IDP (unsupported_grant_type)
4. **Device Authorization Flow**: Not configured on IDP (missing device flow proxy page)
5. **Direct UserInfo Testing**: Need valid user access token from actual user authentication

## Token Analysis
- Received token starting with "st2.s." is a Gigya/SAP CDC session token, not an OAuth access token
- This explains the 401 Unauthorized error when calling userinfo endpoint
- Need actual OAuth access token from the OIDC flow

## Next Steps
1. **Option 1**: Use browser developer tools to capture the actual OAuth token exchange during Auth0 login
2. **Option 2**: Create a debug Auth0 Action/Rule to log the tokens received from Cencora
3. **Option 3**: Use Auth0 Real-time Webtask Logs extension to see token exchange details
4. **Option 4**: Set up HTTP proxy (Charles/Fiddler) to intercept the token exchange

## Key Finding
The IDP (Cencora) uses Gigya/SAP Customer Data Cloud, which may have specific requirements or non-standard claim formats that need special handling in Auth0.

## Reference Documentation Analysis
After reviewing the provided documentation:
1. **AaaS Fundamentals guide** - Documents standard OIDC flow with userinfo endpoint that should return claims
2. **Configuration emails** - Provide basic setup details but no mention of Gigya-specific requirements
3. **Critical gap** - Documentation describes standard OIDC but actual implementation uses Gigya session tokens

## Confirmed Root Cause
- Cencora's actual implementation returns Gigya session tokens (`st2.s...`) instead of OAuth authorization codes
- These session tokens cannot be used with the documented userinfo endpoint
- This is an undocumented deviation from their stated OIDC implementation
- The Auth0 Action workaround is necessary to bridge this gap

## Files Created
- `get_token.sh` - Client credentials flow attempt
- `auth_code_flow.sh` - Authorization code flow URL generator
- `exchange_code.sh` - Code exchange script
- `oauth_flow.py` - Full OAuth flow automation
- `ropc_flow.py` - Resource Owner Password Credentials flow
- `device_flow.py` - Device authorization flow
- `test_userinfo.py` - Direct userinfo endpoint testing
- `analyze_token.py` - Token structure analyzer

## Client Credentials
- Client ID: erg1mMiczzZR4CltGoUCv_h7
- Stored in .env file with client secret