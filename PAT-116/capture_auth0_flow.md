# Alternative Approaches to Get Access Token

Since we can't directly use OAuth flows, here are alternative approaches:

## Option 1: Browser Developer Tools
1. Open Chrome/Firefox Developer Tools (F12)
2. Go to Network tab
3. Log in through Auth0 with the Cencora connection
4. Look for the token exchange request to Cencora's token endpoint
5. The response will contain the access_token

## Option 2: Auth0 Real-time Webtask Logs
1. In Auth0 Dashboard, go to Extensions
2. Install "Real-time Webtask Logs" if not already installed
3. Start capturing logs
4. Perform a login
5. Look for the token exchange details

## Option 3: Create a Debug Rule in Auth0
Create a temporary Auth0 Rule to log the tokens:

```javascript
function debugTokens(user, context, callback) {
  if (context.connection === 'Cencora') {
    console.log('=== CENCORA DEBUG ===');
    console.log('Access Token from IDP:', context.accessToken);
    console.log('ID Token from IDP:', context.idToken);
    console.log('User object:', JSON.stringify(user, null, 2));
    console.log('Context object:', JSON.stringify(context, null, 2));
  }
  callback(null, user, context);
}
```

## Option 4: Use Auth0 Management API
We might be able to get more details about the connection configuration:

```bash
auth0 api get "connections/con_aIEYJY0KxYsiO9E5" | jq '.options'
```

## Option 5: HTTP Proxy
Use a tool like Charles Proxy or Fiddler to intercept the HTTPS traffic during login to see the actual token exchange.