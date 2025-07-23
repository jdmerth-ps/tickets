#!/usr/bin/env python3
import requests
import json

# Session token captured from the auth flow
session_token = "st2.s.AtLtHY4XWw.bSTBdeqr5AvYWCpx_esPtMsxUiMmjlC9gBHOYXir1NLKlr2V_heus4T7kdK0S-k5Rp266twrGZoLT5pYN3zFrBGREP8nLy-Zipsr80L32TM4_X1UsH9xVIm-shamauWI.-O0wu7s7Gv-rH0SX07HY6s4Wxm0FEi6KZJ4W6IC7Yd_tIoIOEToIgWwGHIb4L2c5odMZLeT16U3LBVmCEtpcpA.sc3"

# Cencora UserInfo endpoint
userinfo_url = "https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo"

print("Testing UserInfo endpoint with session token...")
print(f"Token: {session_token[:50]}...")

# Try different approaches
approaches = [
    {
        "name": "Bearer token in Authorization header",
        "headers": {"Authorization": f"Bearer {session_token}"}
    },
    {
        "name": "Token in custom header",
        "headers": {"X-Session-Token": session_token}
    },
    {
        "name": "Token as query parameter",
        "params": {"access_token": session_token}
    },
    {
        "name": "Token as login_token parameter",
        "params": {"login_token": session_token}
    },
    {
        "name": "Token in Cookie header",
        "headers": {"Cookie": f"login_token={session_token}"}
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

# Also try Gigya's getAccountInfo endpoint
print(f"\n{'='*60}")
print("Trying Gigya getAccountInfo endpoint...")

gigya_url = "https://tst.aaas.cencora.com/accounts.getAccountInfo"
gigya_params = {
    "login_token": session_token,
    "APIKey": "4_Pv18t6XTOc51PxyYytQzHA",
    "format": "json"
}

try:
    response = requests.get(gigya_url, params=gigya_params, timeout=10)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("SUCCESS! User info from Gigya:")
        if 'profile' in data:
            print(f"Profile: {json.dumps(data['profile'], indent=2)}")
        if 'data' in data:
            print(f"Data: {json.dumps(data['data'], indent=2)}")
        print(f"Full response saved to gigya_response.json")
        
        with open('gigya_response.json', 'w') as f:
            json.dump(data, f, indent=2)
    else:
        print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")