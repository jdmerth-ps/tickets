#!/bin/bash

# Load environment variables
source .env

# OIDC endpoints
AUTHORIZATION_ENDPOINT="https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/authorize"
TOKEN_ENDPOINT="https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/token"

# Try different redirect URIs
echo "Let's try a few different redirect URI options:"
echo ""

# Option 1: localhost
REDIRECT_URI_1="http://localhost:8080/callback"
STATE=$(openssl rand -hex 16)
NONCE=$(openssl rand -hex 16)

echo "Option 1 - Localhost redirect:"
echo "$AUTHORIZATION_ENDPOINT?client_id=$CENCORA_CLIENT_ID&response_type=code&scope=openid%20profile%20email%20uid&redirect_uri=$(echo -n $REDIRECT_URI_1 | jq -sRr @uri)&state=$STATE&nonce=$NONCE"
echo ""

# Option 2: Direct Auth0 connection callback
REDIRECT_URI_2="https://parcelshield-dev.us.auth0.com/login/callback"
echo "Option 2 - Auth0 callback:"
echo "$AUTHORIZATION_ENDPOINT?client_id=$CENCORA_CLIENT_ID&response_type=code&scope=openid%20profile%20email%20uid&redirect_uri=$(echo -n $REDIRECT_URI_2 | jq -sRr @uri)&state=$STATE&nonce=$NONCE"
echo ""

# Option 3: Try without redirect URI to see what happens
echo "Option 3 - No redirect URI (to see error message):"
echo "$AUTHORIZATION_ENDPOINT?client_id=$CENCORA_CLIENT_ID&response_type=code&scope=openid%20profile%20email%20uid&state=$STATE&nonce=$NONCE"