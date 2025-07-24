# PAT-116: Triose SSO Integration - Final Summary and Options

## Executive Summary
We investigated how to access Gigya (st*) tokens during the Auth0 authentication flow for the Triose/Cencora integration. After extensive research and testing, we discovered that **Enterprise OIDC connections in Auth0 do not expose upstream IDP tokens to Auth0 Actions**.

## Key Findings

### 1. Authentication Flow Analysis
- Triose uses Auth0 → Gigya (Cencora AAAS) → Auth0 flow
- Gigya returns session tokens starting with `st2.s.` instead of standard OAuth tokens
- These st* tokens are needed to call the Gigya userinfo endpoint
- Auth0 processes these tokens internally but doesn't expose them

### 2. Auth0 Limitations Discovered
- **No "Store tokens" option** for Enterprise OIDC connections (only available for Social connections)
- **No `options` object** in the connection configuration via Management API
- **No access to IDP tokens** in Auth0 Actions event object
- **Management API with `read:user_idp_tokens`** scope doesn't return IDP tokens for OIDC connections

### 3. What We CAN Access
- User ID: `oidc|Cencora|c6df5a7a0e6048b6817186433af0c26e`
- Connection name and strategy
- Basic user profile (if returned during initial auth)
- Custom claims we add ourselves

### 4. What We CANNOT Access
- The st* authorization code
- IDP access tokens
- IDP refresh tokens
- Raw OAuth response from Gigya

## Available Options

### Option 1: Contact Auth0 Support (Recommended)
**Pros:**
- Official solution from Auth0
- Might have enterprise-specific features
- Could enable hidden settings

**Cons:**
- Requires support ticket
- May take time

**Action:** Open ticket asking for IDP token access for Enterprise OIDC connections


### Option 2: Backend Token Exchange Service
**Pros:**
- Works with existing Auth0 setup
- Separates concerns
- Can be implemented incrementally

**Cons:**
- Requires additional infrastructure
- Still can't get the st* token directly
- Adds complexity

**Implementation:** Use the `backend_token_exchange_service.js` template

### Option 3: Accept Current Limitations
**Pros:**
- No additional work needed
- Uses Auth0 as designed
- Most secure (no token exposure)

**Cons:**
- Cannot enrich profile with Gigya data
- Limited to basic OIDC claims
- Doesn't meet original requirements

### Option 4: Proxy/Middleware Approach
**Pros:**
- Can intercept the OAuth flow
- Full access to all tokens
- Transparent to the application

**Cons:**
- Complex to implement
- Security considerations
- Maintenance overhead

**Implementation:** Build OAuth proxy that captures tokens before Auth0

## Recommendation

Given the constraints, here's the recommended approach:

1. **Immediate:** Contact Triose/Cencora to see what other options are available
2. **Short-term:** Contact Auth0 support for official guidance on Enterprise OIDC token access
3. **Medium-term:** If Auth0 can't help, implement Option 3 (Backend Service) for critical profile data

## Conclusion

The core issue is that Auth0's Enterprise OIDC connections abstract away the IDP tokens for security, making it impossible to access the Gigya st* tokens needed for the userinfo endpoint through standard means. This requires either Auth0 support intervention or implementing one of the alternative approaches.