# Authentication Flow Analysis - Triose SSO

## Overview
The authentication flow uses a multi-step OAuth/OIDC process with Gigya (SAP CDC) as the identity provider and Auth0 as an intermediary.

## Key Findings

### 1. Auth Code Starting with "st*"
Found multiple instances of auth codes starting with "st":

1. **Initial auth code from Gigya login**:
   - Code: `st2.s.AtLt1Nb1BA.NQM79MaZHCurLkIFttPUjihi1wr0zf_or9aKcB7Ulcko_4JsQqRQGP6QprtF54cJqxRI1XII6hKmfw7IMvn0K7wK-4rPn0v_37naA8T9j8oGGmcewTrvy4Or2U1ly3iI.ivdZI6uT8O4sYvrTPUMsAe51461bYXjbQlW-Re1PEn-1xL2UxoUTRkpjcMwAawYRaV_964WkLFFdRcHB3q0CsA.sc3`
   - Used in: `/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/authorize/continue`

2. **Auth code returned to Auth0 callback**:
   - Code: `st2.s.AtLtADy6Jg.rWVzN5DnKs1azOzT2C_CcWuybXEV801yUwbH0SKXxkz3iett2HHbg35zc0AGCMPfcegez_BwjWX6NglFshodLlj9ctP9TpMHKMeBo_yqdkAfy6aQyMB95wJNgvZq0m7E.Ibj-af0FBYv7jGya7wCsCERw-UtXCLJkfoAZC7fx_cboxqTl3f8F2am_FZ_8dmpdYtv6pZ05UttOClYN2XwkIQ.sc3`
   - URL: `https://parcelshield-dev.us.auth0.com/login/callback?code=[ST_CODE]&state=ZHNS2csqyR1BzLVmpnGiGxPboYBTDuw8`

### 2. Authentication Flow Steps

1. **Initial Request**: 
   - `http://triose.dev.parcelshield.net` → redirects to HTTPS

2. **Auth0 Authorization**: 
   - `https://parcelshield-dev.us.auth0.com/authorize` with client_id, scopes, etc.

3. **Redirect to Gigya (Cencora AAAS)**:
   - `https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/authorize`
   - Then to login page: `https://tst.aaas.cencora.com/pages/login`

4. **Gigya Login Process**:
   - User enters credentials (test_001@aaastest.com)
   - Creates identifier token
   - Performs login via `accounts.login` endpoint

5. **Authorization Continue with st* code**:
   - `https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/authorize/continue`
   - Includes the st* login_token

6. **Callback to Auth0**:
   - Returns to Auth0 with the st* code
   - Auth0 processes and issues its own authorization

7. **Final Redirect**:
   - Back to `https://triose.dev.parcelshield.net/?code=[AUTH0_CODE]`
   - App exchanges code for tokens via `/oauth/token` endpoint

### 3. How to Use st* Code with UserInfo Endpoint

The st* code appears to be a Gigya session token. To use it with the userinfo endpoint:

1. **Direct Usage (Not Recommended)**:
   The st* code is NOT directly used as a bearer token for the userinfo endpoint.

2. **Proper Flow**:
   - The st* code is exchanged through the OAuth flow
   - Auth0 handles the token exchange
   - The final access token from Auth0's `/oauth/token` response should be used

3. **UserInfo Endpoint**:
   - URL: `https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo`
   - Header: `Authorization: Bearer [ACCESS_TOKEN]`
   - The ACCESS_TOKEN comes from the OAuth token exchange, not the st* code directly

## Important Notes

- The st* codes are Gigya-specific session/login tokens
- They have a complex structure with multiple parts separated by dots
- Direct use of st* codes as bearer tokens will likely fail
- The proper flow requires completing the full OAuth exchange to get a valid access token