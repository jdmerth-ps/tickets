#!/usr/bin/env python3
import json
import base64
from datetime import datetime

# Parse the Auth0 tokens from localStorage
auth0_user = json.loads('''{"id_token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJVQWhZTXBtLUwtWE40RXhRc0tKUSJ9.eyJodHRwczovL2F1dGgucGFyY2Vsc2hpZWxkLmNvbS9jbGllbnRfaWQiOm51bGwsImh0dHBzOi8vYXV0aC5wYXJjZWxzaGllbGQuY29tL2NsaWVudF9pZHMiOltdLCJuaWNrbmFtZSI6IiIsIm5hbWUiOiIiLCJwaWN0dXJlIjoiaHR0cHM6Ly9jZG4uYXV0aDAuY29tL2F2YXRhcnMvZGVmYXVsdC5wbmciLCJ1cGRhdGVkX2F0IjoiMjAyNS0wNy0yM1QxOTo0MjozNi4xNzFaIiwiaXNzIjoiaHR0cHM6Ly9wYXJjZWxzaGllbGQtZGV2LnVzLmF1dGgwLmNvbS8iLCJhdWQiOiJjem1IUGJGbEkycjdoc0dQWEVKY1NLZ1NjZU9ybUkyMCIsInN1YiI6Im9pZGN8Q2VuY29yYXxjNmRmNWE3YTBlNjA0OGI2ODE3MTg2NDMzYWYwYzI2ZSIsImlhdCI6MTc1MzI5OTc1NywiZXhwIjoxNzUzMzM1NzU3LCJzaWQiOiJwRjd2UWVqWU54NTNrTFlodkpjOE8xRWpFczJIbXE4WCIsIm5vbmNlIjoiVGxkVlMxOXlhRVJMYzJaQ1REVnRPVGRhUXpaeVRYWjJZaTF0T0ZsSGFFSklaakl4ZGt4clUyd3dNZz09Iiwib3JnX2lkIjoib3JnXzlJRHZPWXBObThwNGRxM0oifQ.mhGFMJx4XkqvF5BpYSI9dsyHiGc_yXsrbsY2vVtPhWARrLgVEV5dj-65h-ztO1KLnmrcEisaHIzO96PxKdudTo4TFo11wq3VpBYVANU67HishlcAxseVp8oOJepG8mlJnxL3vlTMiEZ2aCUTf9odKTGJyCmZPcN5N4Zo9drF6LYVqTYFx77th_qZnIOpuTA5E_QsPp3E0tImHrpV57RHEuo8vWvNm287mqrx-3axMlSBug5yLS0Nu0mOY8Fcx1PnqeA2XVqnRPAGIogOK9PBSr7L0DDeWih62egvlORVXbVXl91poCmoNwti8S8VKPiDMMrkeLthBSqyfVP5C5Q-TA","decodedToken":{"claims":{"nickname":"","name":"","picture":"https://cdn.auth0.com/avatars/default.png","updated_at":"2025-07-23T19:42:36.171Z","sub":"oidc|Cencora|c6df5a7a0e6048b6817186433af0c26e"}}}''')

auth0_access = json.loads('''{"body":{"access_token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJVQWhZTXBtLUwtWE40RXhRc0tKUSJ9.eyJodHRwczovL2F1dGgucGFyY2Vsc2hpZWxkLmNvbS9jbGllbnRfaWQiOm51bGwsImh0dHBzOi8vYXV0aC5wYXJjZWxzaGllbGQuY29tL2NsaWVudF9pZHMiOltdLCJpc3MiOiJodHRwczovL3BhcmNlbHNoaWVsZC1kZXYudXMuYXV0aDAuY29tLyIsInN1YiI6Im9pZGN8Q2VuY29yYXxjNmRmNWE3YTBlNjA0OGI2ODE3MTg2NDMzYWYwYzI2ZSIsImF1ZCI6WyJodHRwczovL2F1dGgucGFyY2Vsc2hpZWxkLmNvbS8iLCJodHRwczovL3BhcmNlbHNoaWVsZC1kZXYudXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTc1MzI5OTc1NywiZXhwIjoxNzUzMzg2MTU3LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIHBzOi8vc3VwcG9ydHZpZXcvYXBpIHBzOi8vY29tbWFuZGNlbnRlci9hcGkiLCJvcmdfaWQiOiJvcmdfOUlEdk9ZcE5tOHA0ZHEzSiIsImF6cCI6ImN6bUhQYkZsSTJyN2hzR1BYRUpjU0tnU2NlT3JtSTIwIn0.CozBsYRzHCQogumOaP2uZ5sY-uZbwoQ6ReEt3iilqJf3ATC34l9owArCmxPb9t7FOS38CTYLRay2_vyRbCLO8eaM5s-axTvR_wB5JVP56FJIbOBdR3U4nJWtLeKzW1w1_A85ClzR8Znwx-RsvdHK_MWuwjmJT07cdKfNHt4gS59VU3pXfRV4V_D_BYbvYbtMUFnzC-hdlG7M_YzhVFnaRrHHtw8mojyTR_RKyGqcTYWRCQQvPswc4rv9O8MjkDtrUCL8AcZ4PN3BJ0DTGIJXqg_noETtCbeNAC0qyUO8nCoCENSWdQYAcar3892vWYLFuonDqtcoumFiAXYsQQmU0g"}}''')

def decode_jwt(token):
    parts = token.split('.')
    # Add padding if necessary
    payload = parts[1]
    payload += '=' * (4 - len(payload) % 4)
    
    decoded = base64.b64decode(payload)
    return json.loads(decoded)

print("=== ANALYSIS OF AUTH0 TOKENS ===\n")

print("1. ID TOKEN CLAIMS:")
id_token_payload = decode_jwt(auth0_user['id_token'])
print(json.dumps(id_token_payload, indent=2))

print("\n2. ACCESS TOKEN CLAIMS:")
access_token_payload = decode_jwt(auth0_access['body']['access_token'])
print(json.dumps(access_token_payload, indent=2))

print("\n3. KEY FINDINGS:")
print(f"- User Subject: {id_token_payload['sub']}")
print(f"- Name: '{id_token_payload.get('name', '')}' (EMPTY!)")
print(f"- Nickname: '{id_token_payload.get('nickname', '')}' (EMPTY!)")
print(f"- Email: {id_token_payload.get('email', 'NOT PRESENT')}")
print(f"- Updated At: {id_token_payload.get('updated_at', 'N/A')}")

print("\n4. PROBLEM CONFIRMED:")
print("- Auth0 successfully authenticated the user")
print("- But the profile fields (name, nickname, email) are empty")
print("- This means Auth0 is NOT getting user profile data from Cencora's userinfo endpoint")

# Now let's try using the Auth0 access token to call Auth0's userinfo endpoint
print("\n5. TESTING AUTH0'S USERINFO ENDPOINT:")
print(f"Access Token: {auth0_access['body']['access_token'][:50]}...")

# Save the access token for testing
with open('auth0_access_token.txt', 'w') as f:
    f.write(auth0_access['body']['access_token'])