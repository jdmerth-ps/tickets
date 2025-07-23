#!/usr/bin/env python3

import os
import json
import time
import base64
import requests
import webbrowser
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

CLIENT_ID = os.getenv('CENCORA_CLIENT_ID')
CLIENT_SECRET = os.getenv('CENCORA_SECRET')

# OIDC endpoints
DEVICE_ENDPOINT = "https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/device_authorization"
TOKEN_ENDPOINT = "https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/token"
USERINFO_ENDPOINT = "https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo"

def main():
    print("=== Cencora OIDC Device Authorization Flow ===\n")
    
    # Step 1: Request device code
    print("Requesting device code...")
    device_data = {
        'client_id': CLIENT_ID,
        'scope': 'openid profile email uid'
    }
    
    device_response = requests.post(DEVICE_ENDPOINT, data=device_data)
    
    if device_response.status_code != 200:
        print(f"❌ Device authorization failed: {device_response.status_code}")
        print(device_response.text)
        return
    
    device_info = device_response.json()
    print("✅ Device code received!")
    
    # Extract device flow info
    device_code = device_info.get('device_code')
    user_code = device_info.get('user_code')
    verification_uri = device_info.get('verification_uri')
    verification_uri_complete = device_info.get('verification_uri_complete')
    expires_in = device_info.get('expires_in', 600)
    interval = device_info.get('interval', 5)
    
    print(f"\n=== User Action Required ===")
    print(f"1. Visit: {verification_uri}")
    print(f"2. Enter code: {user_code}")
    
    if verification_uri_complete:
        print(f"\nOr visit this URL directly:")
        print(verification_uri_complete)
        print("\nOpening browser...")
        webbrowser.open(verification_uri_complete)
    
    print(f"\nWaiting for authorization (expires in {expires_in} seconds)...")
    
    # Step 2: Poll for token
    start_time = time.time()
    
    while time.time() - start_time < expires_in:
        time.sleep(interval)
        
        token_data = {
            'grant_type': 'urn:ietf:params:oauth:grant-type:device_code',
            'device_code': device_code,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET
        }
        
        token_response = requests.post(TOKEN_ENDPOINT, data=token_data)
        
        if token_response.status_code == 200:
            tokens = token_response.json()
            print("\n✅ Authorization successful! Tokens received.")
            
            # Save tokens
            with open('tokens_device.json', 'w') as f:
                json.dump(tokens, f, indent=2)
            
            # Extract tokens
            access_token = tokens.get('access_token')
            id_token = tokens.get('id_token')
            
            # Decode ID token
            if id_token:
                print("\n=== ID Token Claims ===")
                try:
                    parts = id_token.split('.')
                    payload = parts[1]
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
                    with open('userinfo_device.json', 'w') as f:
                        json.dump(userinfo, f, indent=2)
                else:
                    print(f"\n❌ UserInfo Error:")
                    print(userinfo_response.text)
            
            break
        
        elif token_response.status_code == 400:
            error_data = token_response.json()
            error = error_data.get('error')
            
            if error == 'authorization_pending':
                print(".", end="", flush=True)
                continue
            elif error == 'slow_down':
                interval += 5
                print(f"\nSlowing down... (new interval: {interval}s)")
                continue
            else:
                print(f"\n❌ Token error: {error}")
                print(f"Description: {error_data.get('error_description', '')}")
                break
        else:
            print(f"\n❌ Unexpected error: {token_response.status_code}")
            print(token_response.text)
            break
    
    else:
        print("\n❌ Authorization timeout!")

if __name__ == "__main__":
    main()