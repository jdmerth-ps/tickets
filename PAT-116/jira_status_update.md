# JIRA Status Update: Triose SSO / Cencora OIDC Integration Investigation

## Issue Summary
Auth0 OIDC connection with Cencora IDP successfully authenticates users but fails to retrieve user profile information (name, email, username). Users can log in but have empty profile fields.

## Investigation Completed

### 1. Authentication Flow Analysis
- **Result**: Successfully captured complete OIDC authentication flow using browser monitoring
- **Finding**: Authentication works correctly - users can log in and receive valid Auth0 tokens
- **Issue Identified**: User profile fields (name, email, nickname) are empty in Auth0 tokens

### 2. Root Cause Identification
- **Core Problem**: Cencora's OIDC implementation uses Gigya/SAP Customer Data Cloud (CDC)
- **Non-Standard Behavior**: Instead of returning a standard OAuth authorization code, Cencora returns a Gigya session token (`st2.s.AtLtHY4XWw...`)
- **Token Exchange Issue**: Auth0 successfully exchanges this session token for OAuth tokens, but the resulting access token doesn't work with Cencora's userinfo endpoint
- **Evidence**: Captured network traffic shows the non-standard token format being returned

### 3. Technical Testing Performed
- ✅ Captured authorization code from live authentication flow
- ✅ Tested multiple approaches to call Cencora's userinfo endpoint
- ✅ Analyzed Auth0 ID and access tokens (confirmed empty profile fields)
- ✅ Verified Auth0's userinfo endpoint returns empty data
- ✅ Confirmed the issue is in the token exchange/userinfo flow, not authentication

### 4. Gigya Documentation Research
- **Finding**: Gigya's OIDC implementation has unique characteristics
- **Token Format**: Uses session tokens instead of standard OAuth codes
- **API Requirements**: Userinfo endpoint requires tokens issued by Gigya, not Auth0
- **Integration Pattern**: Standard OIDC flow may not work without special handling

## Root Cause Summary
The issue occurs because:
1. Cencora's IDP (powered by Gigya) returns a session token instead of a standard OAuth authorization code
2. While Auth0 can exchange this token, the resulting access token cannot successfully call Cencora's userinfo endpoint
3. This results in Auth0 having no user profile data to populate name, email, and other fields

## Proposed Solutions (Provisional)

### Option 1: Custom Auth0 Action
**Status**: Provisional solution developed for testing
- Created Auth0 Action that runs after login to attempt profile data retrieval
- Uses Gigya's native REST API with proper authentication
- Multiple implementation approaches provided (simple → full API integration)
- **Files Created**: `auth0_action_*.js` and deployment guide
- **Note**: This is a workaround pending confirmation from Cencora on proper integration approach

### Option 2: Work with Triose/Cencora (Revised Approach)
- **Status**: Preparing request for Triose team
- Request a callback URL where Auth0 can send the Gigya session token for profile retrieval
- Ask for a sample authentication flow showing how to properly handle Gigya tokens
- Work within their existing Gigya implementation rather than requesting changes
- Focus on practical integration path that works with their current setup

### Option 3: Connection Configuration Changes
- Modify Auth0 OIDC connection to handle Gigya-specific responses
- Enable "Sync user profile attributes at each login"
- Custom user mapping to handle empty userinfo responses

## Files Created During Investigation
- `test_session_token.py` - Testing userinfo with captured tokens
- `analyze_auth0_tokens.py` - Token analysis and decoding
- `auth0_action_*.js` - Three different Auth0 Action implementations
- `auth0_action_deployment_guide.md` - Complete deployment instructions
- `gigya_oidc_analysis.md` - Technical analysis and recommendations

## Next Steps
1. **Request from Triose**: Ask for callback URL and sample auth flow for Gigya token handling
2. **Testing**: Test Auth0 Action solution with any guidance received
3. **Implementation**: Deploy solution that works with Gigya's session token approach
4. **Documentation**: Update integration documentation with working approach

## What We Need from Triose
1. **Callback URL**: An endpoint where Auth0 can send the Gigya session token to retrieve user profile data
2. **Sample Flow**: Example of how other integrations handle Gigya session tokens for profile retrieval
3. **API Access**: Confirmation of which Gigya APIs we can use with the session token
4. **Test Support**: Assistance testing the integration with their test environment

## Impact Assessment
- **User Experience**: Currently degraded (no name/email display)
- **Security**: No impact - authentication still works correctly
- **Functionality**: Profile-dependent features may not work properly
- **Resolution Time**: 1-2 days with Auth0 Action approach

## Technical Assessment
- **Root Cause**: High confidence (confirmed through live flow capture)
- **Solution Status**: Provisional - awaiting Cencora confirmation on proper approach
- **Implementation Risk**: Medium - need to ensure solution aligns with Cencora's intended integration pattern

## Time Investment
- **Investigation Duration**: ~3.5 hours
- **Activities Completed**:
  - Initial problem analysis and Auth0 configuration review (30 min)
  - Teams conversation and coordination (30 min)
  - Multiple OAuth flow testing attempts (client credentials, auth code, ROPC, device flow) (45 min)
  - Live browser monitoring to capture actual authentication flow (30 min)
  - Token analysis and userinfo endpoint testing (30 min)
  - Gigya/SAP CDC documentation research (30 min)
  - Development of three provisional Auth0 Action solutions (45 min)
  - Documentation and deployment guide creation (30 min)

---
**Investigation Status**: Root cause identified, provisional solutions developed. Awaiting Cencora team response for proper integration approach.