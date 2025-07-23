#!/usr/bin/env python3

import os
import json
import base64
import requests
import getpass
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

CLIENT_ID = os.getenv('CENCORA_CLIENT_ID')
CLIENT_SECRET = os.getenv('CENCORA_SECRET')

# OIDC endpoints
TOKEN_ENDPOINT = "https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/token"
USERINFO_ENDPOINT = "https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo"

def main():
    print("=== Cencora OIDC Resource Owner Password Flow ===\n")
    
    # Get credentials
    username = input("Enter username (e.g., test_001@aaastest.com): ")
    password = getpass.getpass("Enter password: ")
    
    print("\nRequesting tokens using password grant...")
    
    # Request tokens using password grant
    token_data = {
        'grant_type': 'password',
        'username': username,
        'password': password,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'scope': 'openid profile email uid'
    }
    
    token_response = requests.post(TOKEN_ENDPOINT, data=token_data)
    
    print(f"Token endpoint status: {token_response.status_code}")
    
    if token_response.status_code == 200:
        tokens = token_response.json()
        print("✅ Tokens received successfully!")
        
        # Save tokens
        with open('tokens_ropc.json', 'w') as f:
            json.dump(tokens, f, indent=2)
        
        # Extract tokens
        access_token = tokens.get('access_token')
        id_token = tokens.get('id_token')
        
        # Decode ID token if present
        if id_token:
            print("\n=== ID Token Claims ===")
            try:
                # Split and decode
                parts = id_token.split('.')
                payload = parts[1]
                # Add padding
                payload += '=' * (4 - len(payload) % 4)
                decoded = base64.urlsafe_b64decode(payload)
                id_claims = json.loads(decoded)
                print(json.dumps(id_claims, indent=2))
            except Exception as e:
                print(f"Error decoding ID token: {e}")
        
        # Call userinfo endpoint
        if access_token:
            print("\n=== Calling UserInfo Endpoint ===")
            userinfo_headers = {
                'Authorization': f'Bearer {access_token}'
            }
            
            userinfo_response = requests.get(USERINFO_ENDPOINT, headers=userinfo_headers)
            
            print(f"UserInfo endpoint status: {userinfo_response.status_code}")
            
            if userinfo_response.status_code == 200:
                userinfo = userinfo_response.json()
                print("\n✅ UserInfo Response:")
                print(json.dumps(userinfo, indent=2))
                
                # Save userinfo
                with open('userinfo_ropc.json', 'w') as f:
                    json.dump(userinfo, f, indent=2)
                print("\nUserInfo saved to userinfo_ropc.json")
            else:
                print(f"\n❌ UserInfo Error:")
                print(userinfo_response.text)
    else:
        print(f"\n❌ Token request failed:")
        print(f"Response: {token_response.text}")
        
        # Try to parse error
        try:
            error_data = token_response.json()
            print(f"Error: {error_data.get('error', 'Unknown')}")
            print(f"Description: {error_data.get('error_description', 'No description')}")
        except:
            pass

if __name__ == "__main__":
    main()