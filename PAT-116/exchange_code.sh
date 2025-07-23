#!/bin/bash

# Load environment variables
source .env

if [ -z "$1" ]; then
    echo "Usage: ./exchange_code.sh AUTHORIZATION_CODE"
    exit 1
fi

AUTH_CODE=$1
TOKEN_ENDPOINT="https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/token"
USERINFO_ENDPOINT="https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo"
REDIRECT_URI="https://parcelshield-dev.us.auth0.com/login/callback"

echo "Exchanging authorization code for tokens..."

# Exchange code for tokens
TOKEN_RESPONSE=$(curl -s -X POST "$TOKEN_ENDPOINT" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=$AUTH_CODE" \
  -d "client_id=$CENCORA_CLIENT_ID" \
  -d "client_secret=$CENCORA_SECRET" \
  -d "redirect_uri=$REDIRECT_URI")

echo "Token response:"
echo "$TOKEN_RESPONSE" | jq .

# Extract tokens
ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r .access_token)
ID_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r .id_token)

if [ "$ACCESS_TOKEN" != "null" ] && [ ! -z "$ACCESS_TOKEN" ]; then
    echo -e "\n=== Access token obtained successfully! ==="
    
    # Decode ID token payload
    echo -e "\n=== ID Token claims: ==="
    echo "$ID_TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | jq .
    
    # Call userinfo endpoint
    echo -e "\n=== Calling userinfo endpoint... ==="
    USERINFO_RESPONSE=$(curl -s -X GET "$USERINFO_ENDPOINT" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    echo -e "\nUserinfo response:"
    echo "$USERINFO_RESPONSE" | jq .
    
    # Save for reference
    echo "$ACCESS_TOKEN" > access_token.txt
    echo "$ID_TOKEN" > id_token.txt
    echo "$USERINFO_RESPONSE" > userinfo_response.json
    
    echo -e "\nTokens and response saved to files for reference."
else
    echo "Failed to get access token"
fi