# Request for Triose: Gigya Session Token Integration Support

## Current Situation
We've successfully integrated Auth0 with Cencora's OIDC endpoint for authentication. Users can log in successfully, but we're unable to retrieve their profile information (name, email) due to how Gigya handles tokens.

## Technical Finding
Cencora's implementation (powered by Gigya/SAP CDC) returns session tokens in the format `st2.s...` instead of standard OAuth authorization codes. While Auth0 can process these tokens for authentication, we cannot retrieve user profile data through the standard OIDC userinfo endpoint.

## What We Need from Triose/Cencora

### 1. Callback URL for Profile Retrieval
We need an endpoint where Auth0 can send the Gigya session token to retrieve user profile data. This could be:
- A dedicated API endpoint that accepts session tokens
- An existing Gigya API we can call with proper authentication
- A proxy endpoint that handles the token exchange

### 2. Sample Authentication Flow
Please provide an example of how other systems successfully integrate with your Gigya implementation, specifically:
- How they handle the session token after authentication
- How they retrieve user profile information (name, email, etc.)
- Any special headers or parameters required

### 3. API Documentation
- Which Gigya APIs are available for our use with the session token?
- Are there specific endpoints for retrieving user attributes?
- What authentication method should we use (session token in header, as parameter, etc.)?

### 4. Test Environment Support
- Confirmation that test accounts (like test_001@aaastest.com) will work with the proposed solution
- Any test-specific endpoints or configurations we should use

## Our Proposed Solution
We've developed an Auth0 Action that can make API calls after user authentication. With the right endpoint and authentication details from you, we can:
1. Capture the Gigya session token after login
2. Call your API to retrieve user profile data
3. Update the user's Auth0 profile with this information

## No Changes Required on Your End
We're not asking you to modify your OIDC implementation. We just need the technical details to work with your existing Gigya setup.

## Contact
Please provide this information to help us complete the SSO integration. We're ready to test as soon as we receive these details.