#!/usr/bin/env python3
import requests
import json

# Read the Auth0 access token
with open('auth0_access_token.txt', 'r') as f:
    auth0_access_token = f.read().strip()

# Cencora UserInfo endpoint
userinfo_url = "https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo"

print("Testing Cencora's userinfo endpoint with Auth0 access token...")
print(f"URL: {userinfo_url}")
print(f"Auth0 Access Token: {auth0_access_token[:50]}...")

# Try different approaches
approaches = [
    {
        "name": "Bearer token in Authorization header",
        "headers": {"Authorization": f"Bearer {auth0_access_token}"}
    },
    {
        "name": "Token as access_token query parameter",
        "params": {"access_token": auth0_access_token}
    },
    {
        "name": "Token with client_id in header",
        "headers": {
            "Authorization": f"Bearer {auth0_access_token}",
            "X-Client-Id": "erg1mMiczzZR4CltGoUCv_h7"
        }
    },
    {
        "name": "Token with API key",
        "headers": {"Authorization": f"Bearer {auth0_access_token}"},
        "params": {"APIKey": "4_Pv18t6XTOc51PxyYytQzHA"}
    }
]

for approach in approaches:
    print(f"\n{'='*60}")
    print(f"Trying: {approach['name']}")
    
    headers = approach.get('headers', {})
    params = approach.get('params', {})
    
    try:
        response = requests.get(userinfo_url, headers=headers, params=params, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("SUCCESS! Response:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

# Also try to decode what type of token Auth0 is expecting
print(f"\n{'='*60}")
print("Token Analysis:")
print("- The Auth0 access token is a JWT signed by Auth0")
print("- It's meant for Auth0's APIs, not Cencora's")
print("- Cencora's userinfo endpoint expects a token issued by Cencora, not Auth0")
print("- This explains why it's rejecting the Auth0 access token")