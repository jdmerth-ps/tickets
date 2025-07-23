#!/usr/bin/env python3

import os
import sys
import json
import base64
import secrets
import requests
from urllib.parse import urlencode, parse_qs, urlparse
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading
import webbrowser
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

CLIENT_ID = os.getenv('CENCORA_CLIENT_ID')
CLIENT_SECRET = os.getenv('CENCORA_SECRET')

# OIDC endpoints
AUTHORIZATION_ENDPOINT = "https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/authorize"
TOKEN_ENDPOINT = "https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/token"
USERINFO_ENDPOINT = "https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo"

# Local callback server
REDIRECT_URI = "http://localhost:8080/callback"
PORT = 8080

# Global variable to store the authorization code
auth_code = None
state_param = None

class CallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global auth_code, state_param
        
        parsed = urlparse(self.path)
        if parsed.path == '/callback':
            params = parse_qs(parsed.query)
            
            if 'code' in params:
                auth_code = params['code'][0]
                received_state = params.get('state', [''])[0]
                
                # Verify state matches
                if received_state == state_param:
                    self.send_response(200)
                    self.send_header('Content-type', 'text/html')
                    self.end_headers()
                    self.wfile.write(b"""
                        <html>
                        <body style="font-family: Arial, sans-serif; padding: 40px;">
                            <h1>Authorization Successful!</h1>
                            <p>You can close this window and return to the terminal.</p>
                            <script>window.close();</script>
                        </body>
                        </html>
                    """)
                else:
                    self.send_response(400)
                    self.send_header('Content-type', 'text/html')
                    self.end_headers()
                    self.wfile.write(b"<h1>Error: State mismatch</h1>")
            else:
                error = params.get('error', ['Unknown error'])[0]
                error_desc = params.get('error_description', [''])[0]
                self.send_response(400)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(f"<h1>Error: {error}</h1><p>{error_desc}</p>".encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        # Suppress server logs
        pass

def start_callback_server():
    server = HTTPServer(('localhost', PORT), CallbackHandler)
    thread = threading.Thread(target=server.serve_forever)
    thread.daemon = True
    thread.start()
    return server

def main():
    global state_param
    
    print("=== Cencora OIDC UserInfo Test ===\n")
    
    # Generate state and nonce
    state_param = secrets.token_urlsafe(32)
    nonce = secrets.token_urlsafe(32)
    
    # Start callback server
    print(f"Starting callback server on {REDIRECT_URI}...")
    server = start_callback_server()
    
    # Build authorization URL
    auth_params = {
        'client_id': CLIENT_ID,
        'response_type': 'code',
        'scope': 'openid profile email uid',
        'redirect_uri': REDIRECT_URI,
        'state': state_param,
        'nonce': nonce
    }
    
    auth_url = f"{AUTHORIZATION_ENDPOINT}?{urlencode(auth_params)}"
    
    print(f"\nOpening browser for authorization...")
    print(f"If browser doesn't open, visit: {auth_url}\n")
    
    # Open browser
    webbrowser.open(auth_url)
    
    # Wait for callback
    print("Waiting for authorization callback...")
    while auth_code is None:
        try:
            import time
            time.sleep(0.5)
        except KeyboardInterrupt:
            print("\nCancelled by user")
            server.shutdown()
            sys.exit(1)
    
    print(f"\n✅ Authorization code received!")
    
    # Exchange code for tokens
    print("\nExchanging authorization code for tokens...")
    token_data = {
        'grant_type': 'authorization_code',
        'code': auth_code,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'redirect_uri': REDIRECT_URI
    }
    
    token_response = requests.post(TOKEN_ENDPOINT, data=token_data)
    
    if token_response.status_code == 200:
        tokens = token_response.json()
        print("✅ Tokens received successfully!")
        
        # Extract tokens
        access_token = tokens.get('access_token')
        id_token = tokens.get('id_token')
        
        # Save tokens
        with open('tokens.json', 'w') as f:
            json.dump(tokens, f, indent=2)
        print("Tokens saved to tokens.json")
        
        # Decode ID token
        if id_token:
            print("\n=== ID Token Claims ===")
            try:
                # Split token and decode payload
                header, payload, signature = id_token.split('.')
                # Add padding if needed
                payload += '=' * (4 - len(payload) % 4)
                decoded_payload = base64.urlsafe_b64decode(payload)
                id_claims = json.loads(decoded_payload)
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
            
            print(f"Status Code: {userinfo_response.status_code}")
            print(f"Response Headers: {dict(userinfo_response.headers)}")
            
            if userinfo_response.status_code == 200:
                userinfo = userinfo_response.json()
                print("\n✅ UserInfo Response:")
                print(json.dumps(userinfo, indent=2))
                
                # Save userinfo
                with open('userinfo.json', 'w') as f:
                    json.dump(userinfo, f, indent=2)
                print("\nUserInfo saved to userinfo.json")
            else:
                print(f"\n❌ UserInfo Error:")
                print(userinfo_response.text)
    else:
        print(f"\n❌ Token exchange failed:")
        print(f"Status Code: {token_response.status_code}")
        print(token_response.text)
    
    # Shutdown server
    server.shutdown()
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    main()