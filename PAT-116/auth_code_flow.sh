#!/bin/bash

# Load environment variables
source .env

# OIDC endpoints
AUTHORIZATION_ENDPOINT="https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/authorize"
TOKEN_ENDPOINT="https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/token"
REDIRECT_URI="https://parcelshield-dev.us.auth0.com/login/callback"

# Generate authorization URL
STATE=$(openssl rand -hex 16)
NONCE=$(openssl rand -hex 16)

echo "To get a user access token, you need to:"
echo "1. Open this URL in a browser and log in:"
echo ""
echo "$AUTHORIZATION_ENDPOINT?client_id=$CENCORA_CLIENT_ID&response_type=code&scope=openid%20profile%20email%20uid&redirect_uri=$REDIRECT_URI&state=$STATE&nonce=$NONCE"
echo ""
echo "2. After login, you'll be redirected to a URL like:"
echo "   https://parcelshield-dev.us.auth0.com/login/callback?code=AUTHORIZATION_CODE&state=$STATE"
echo ""
echo "3. Copy the 'code' parameter value and run:"
echo "   ./exchange_code.sh AUTHORIZATION_CODE"