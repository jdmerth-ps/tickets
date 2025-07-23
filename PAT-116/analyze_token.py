#!/usr/bin/env python3

import sys
import base64
import json

def analyze_token(token):
    print(f"=== Token Analysis ===\n")
    print(f"Token: {token[:50]}...")
    print(f"Length: {len(token)}")
    
    # Check if it's a JWT (has 3 parts separated by dots)
    parts = token.split('.')
    print(f"Parts: {len(parts)}")
    
    if len(parts) == 3:
        print("\nThis appears to be a JWT token")
        try:
            # Decode header
            header = parts[0]
            header += '=' * (4 - len(header) % 4)
            decoded_header = base64.urlsafe_b64decode(header)
            print("\nHeader:")
            print(json.dumps(json.loads(decoded_header), indent=2))
            
            # Decode payload
            payload = parts[1]
            payload += '=' * (4 - len(payload) % 4)
            decoded_payload = base64.urlsafe_b64decode(payload)
            print("\nPayload:")
            print(json.dumps(json.loads(decoded_payload), indent=2))
            
        except Exception as e:
            print(f"\nError decoding JWT: {e}")
    else:
        print("\nThis doesn't appear to be a standard JWT")
        # Check if it's an opaque token format
        if token.startswith("st2.s."):
            print("This appears to be a Gigya/SAP CDC session token format")
            print("\nToken structure:")
            print("- Prefix: st2.s. (session token v2)")
            print("- This is likely an opaque reference token, not a JWT")
            print("- It requires validation against the authorization server")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        token = sys.argv[1]
    else:
        print("Enter token:")
        token = input().strip()
    
    analyze_token(token)