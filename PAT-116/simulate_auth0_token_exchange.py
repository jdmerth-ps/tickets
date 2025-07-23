#!/usr/bin/env python3
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

# The authorization code we captured (Gigya session token)
auth_code = "st2.s.AtLtHY4XWw.bSTBdeqr5AvYWCpx_esPtMsxUiMmjlC9gBHOYXir1NLKlr2V_heus4T7kdK0S-k5Rp266twrGZoLT5pYN3zFrBGREP8nLy-Zipsr80L32TM4_X1UsH9xVIm-shamauWI.-O0wu7s7Gv-rH0SX07HY6s4Wxm0FEi6KZJ4W6IC7Yd_tIoIOEToIgWwGHIb4L2c5odMZLeT16U3LBVmCEtpcpA.sc3"

# Cencora token endpoint
token_url = "https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/token"

client_id = os.getenv('CLIENT_ID')
client_secret = os.getenv('CLIENT_SECRET')

print("Simulating what Auth0 should do during token exchange...")
print(f"Token URL: {token_url}")
print(f"Auth Code (Gigya token): {auth_code[:50]}...")

# Try the token exchange
data = {
    "grant_type": "authorization_code",
    "code": auth_code,
    "redirect_uri": "https://parcelshield-dev.us.auth0.com/login/callback",
    "client_id": client_id,
    "client_secret": client_secret,
    "code_verifier": "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"  # Example PKCE verifier
}

headers = {
    "Content-Type": "application/x-www-form-urlencoded"
}

print("\nAttempting token exchange...")
try:
    response = requests.post(token_url, data=data, headers=headers, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        tokens = response.json()
        print("\nSUCCESS! Received tokens:")
        print(json.dumps(tokens, indent=2))
        
        # If we get an access token, try to use it for userinfo
        if 'access_token' in tokens:
            access_token = tokens['access_token']
            print(f"\nAccess token received: {access_token[:50]}...")
            
            # Now try userinfo with this token
            userinfo_url = "https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo"
            headers = {"Authorization": f"Bearer {access_token}"}
            
            print(f"\nCalling userinfo endpoint with Cencora's access token...")
            userinfo_response = requests.get(userinfo_url, headers=headers, timeout=10)
            print(f"UserInfo Status: {userinfo_response.status_code}")
            
            if userinfo_response.status_code == 200:
                print("UserInfo Response:")
                print(json.dumps(userinfo_response.json(), indent=2))
            else:
                print(f"UserInfo Error: {userinfo_response.text}")
    else:
        print(f"Error Response: {response.text}")
        print("\nNote: The authorization code might have expired or already been used")
        
except Exception as e:
    print(f"Error: {e}")

print("\n\nANALYSIS:")
print("- The authorization code (Gigya session token) can only be used once")
print("- It's likely already been consumed by Auth0 during the initial flow")
print("- This explains why we can't manually exchange it again")
print("- The real issue is what happens when Auth0 does this exchange")