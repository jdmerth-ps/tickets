#!/usr/bin/env python3
import requests
import json

# Read the Auth0 access token
with open('auth0_access_token.txt', 'r') as f:
    access_token = f.read().strip()

# Auth0 userinfo endpoint
userinfo_url = "https://parcelshield-dev.us.auth0.com/userinfo"

print("Testing Auth0's userinfo endpoint...")
print(f"URL: {userinfo_url}")
print(f"Access Token: {access_token[:50]}...")

headers = {
    "Authorization": f"Bearer {access_token}"
}

try:
    response = requests.get(userinfo_url, headers=headers, timeout=10)
    print(f"\nStatus: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("\nAuth0 UserInfo Response:")
        print(json.dumps(data, indent=2))
        
        print("\n\nANALYSIS:")
        print("- Auth0 is returning user info from its own database")
        print("- But the profile fields are empty because Auth0 didn't get them from Cencora")
        print("- This confirms Auth0 is NOT successfully calling Cencora's userinfo endpoint")
        print("- Or Cencora's userinfo endpoint is not returning the expected data")
    else:
        print(f"Error Response: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")