#!/bin/bash

# Load environment variables
source .env

# OIDC endpoints
TOKEN_ENDPOINT="https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/token"
USERINFO_ENDPOINT="https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo"

echo "Getting access token using client credentials flow..."

# Get access token
TOKEN_RESPONSE=$(curl -s -X POST "$TOKEN_ENDPOINT" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=$CENCORA_CLIENT_ID" \
  -d "client_secret=$CENCORA_SECRET" \
  -d "scope=openid profile email uid")

echo "Token response:"
echo "$TOKEN_RESPONSE" | jq .

# Extract access token
ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r .access_token)

if [ "$ACCESS_TOKEN" != "null" ] && [ ! -z "$ACCESS_TOKEN" ]; then
    echo -e "\nAccess token obtained successfully!"
    echo -e "\nCalling userinfo endpoint..."
    
    USERINFO_RESPONSE=$(curl -s -X GET "$USERINFO_ENDPOINT" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    echo -e "\nUserinfo response:"
    echo "$USERINFO_RESPONSE" | jq .
else
    echo "Failed to get access token"
fi