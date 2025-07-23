#!/usr/bin/env python3

import json
import requests
import sys

USERINFO_ENDPOINT = "https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo"

def test_userinfo(access_token):
    print("=== Testing UserInfo Endpoint ===\n")
    print(f"Endpoint: {USERINFO_ENDPOINT}")
    print(f"Token: {access_token[:50]}...\n")
    
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    response = requests.get(USERINFO_ENDPOINT, headers=headers)
    
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}\n")
    
    if response.status_code == 200:
        userinfo = response.json()
        print("✅ UserInfo Response:")
        print(json.dumps(userinfo, indent=2))
        
        # Save to file
        with open('userinfo_manual.json', 'w') as f:
            json.dump(userinfo, f, indent=2)
        print("\nSaved to userinfo_manual.json")
    else:
        print("❌ Error Response:")
        print(response.text)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Token passed as argument
        token = sys.argv[1]
    else:
        # Prompt for token
        print("Paste the access token from Postman:")
        token = input().strip()
    
    test_userinfo(token)