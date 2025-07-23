#!/usr/bin/env python3

import http.server
import socketserver
import urllib.parse
import json
from datetime import datetime

class CallbackHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL and query parameters
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        
        # Log the callback
        print(f"\n{'='*60}")
        print(f"Callback received at {datetime.now()}")
        print(f"{'='*60}")
        
        if 'code' in params:
            code = params['code'][0]
            state = params.get('state', [''])[0]
            
            print(f"✅ Authorization successful!")
            print(f"Code: {code}")
            print(f"State: {state}")
            
            # Create response HTML
            response_html = f"""
            <html>
            <head><title>Authorization Successful</title></head>
            <body style="font-family: Arial, sans-serif; padding: 40px;">
                <h1>✅ Authorization Successful!</h1>
                <p><strong>Authorization Code:</strong></p>
                <code style="background: #f0f0f0; padding: 10px; display: block; word-break: break-all;">
                {code}
                </code>
                <p><strong>Next Step:</strong></p>
                <pre style="background: #f0f0f0; padding: 10px;">./exchange_code.sh {code}</pre>
            </body>
            </html>
            """
            
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(response_html.encode())
            
        elif 'error' in params:
            error = params['error'][0]
            error_desc = params.get('error_description', [''])[0]
            
            print(f"❌ Authorization failed!")
            print(f"Error: {error}")
            print(f"Description: {error_desc}")
            
            response_html = f"""
            <html>
            <head><title>Authorization Failed</title></head>
            <body style="font-family: Arial, sans-serif; padding: 40px;">
                <h1>❌ Authorization Failed</h1>
                <p><strong>Error:</strong> {error}</p>
                <p><strong>Description:</strong> {error_desc}</p>
            </body>
            </html>
            """
            
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(response_html.encode())
        else:
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<h1>Waiting for callback...</h1>")

PORT = 8080

print(f"Starting callback server on http://localhost:{PORT}/callback")
print(f"Use this redirect URI in your authorization request:")
print(f"http://localhost:{PORT}/callback")
print(f"\nServer is ready to receive callbacks...")

with socketserver.TCPServer(("", PORT), CallbackHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")