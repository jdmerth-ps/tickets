/**
 * Auth0 Action: Complete Token Location Reference
 * 
 * This documents ALL possible locations where tokens (including st*) 
 * might be found in Auth0 Actions as of 2025
 * 
 * Trigger: Post Login
 * Runtime: Node 18
 */

exports.onExecutePostLogin = async (event, api) => {
  console.log('=== ALL POSSIBLE TOKEN LOCATIONS IN AUTH0 ACTIONS ===');
  
  // 1. USER IDENTITIES - Most common location for IDP tokens
  console.log('\n1. USER IDENTITIES (event.user.identities)');
  if (event.user?.identities) {
    event.user.identities.forEach((identity, index) => {
      console.log(`Identity [${index}]:`, {
        provider: identity.provider,
        connection: identity.connection,
        // These properties might contain IDP tokens if "Store tokens" is enabled
        access_token: identity.access_token ? '✓ Present' : '✗ Missing',
        accessToken: identity.accessToken ? '✓ Present' : '✗ Missing', // Alternative casing
        refresh_token: identity.refresh_token ? '✓ Present' : '✗ Missing',
        refreshToken: identity.refreshToken ? '✓ Present' : '✗ Missing',
        id_token: identity.id_token ? '✓ Present' : '✗ Missing',
        idToken: identity.idToken ? '✓ Present' : '✗ Missing',
        expires_in: identity.expires_in,
        // Check the actual token value
        token_type: identity.access_token?.substring(0, 10)
      });
      
      // Check for st* token
      if (identity.access_token?.startsWith('st')) {
        console.log('🎯 FOUND ST TOKEN in identity.access_token!');
      }
    });
  }
  
  // 2. AUTHORIZATION OBJECT - Rarely contains upstream tokens
  console.log('\n2. AUTHORIZATION OBJECT (event.authorization)');
  if (event.authorization) {
    console.log('Properties:', Object.keys(event.authorization));
    // Usually contains: roles, permissions
    // Does NOT typically contain: access_token, code
  }
  
  // 3. TRANSACTION OBJECT - Contains flow metadata
  console.log('\n3. TRANSACTION OBJECT (event.transaction)');
  if (event.transaction) {
    console.log('Available properties:', Object.keys(event.transaction));
    // Check for any token-related properties
    const tokenProps = ['access_token', 'id_token', 'refresh_token', 'code', 
                       'identity_provider_access_token', 'idp_access_token'];
    tokenProps.forEach(prop => {
      if (event.transaction[prop]) {
        console.log(`Found ${prop}:`, event.transaction[prop].substring(0, 20) + '...');
      }
    });
  }
  
  // 4. REQUEST OBJECT - Contains initial request data
  console.log('\n4. REQUEST OBJECT (event.request)');
  if (event.request) {
    // Query parameters (from redirect)
    if (event.request.query?.code) {
      console.log('Authorization code in query:', event.request.query.code.substring(0, 20) + '...');
      if (event.request.query.code.startsWith('st')) {
        console.log('🎯 FOUND ST CODE in request.query.code!');
      }
    }
    // Body parameters (from POST)
    if (event.request.body?.code) {
      console.log('Authorization code in body:', event.request.body.code.substring(0, 20) + '...');
    }
  }
  
  // 5. SESSION OBJECT - May contain session tokens
  console.log('\n5. SESSION OBJECT (event.session)');
  if (event.session) {
    console.log('Session properties:', Object.keys(event.session));
    // Usually contains: id, user_id, clients, created_at, updated_at
  }
  
  // 6. AUTHENTICATION OBJECT - Contains auth method info
  console.log('\n6. AUTHENTICATION OBJECT (event.authentication)');
  if (event.authentication) {
    console.log('Properties:', Object.keys(event.authentication));
    // Contains: methods, riskAssessment
    // Does NOT contain tokens
  }
  
  // 7. USER METADATA - Might contain stored tokens
  console.log('\n7. USER METADATA');
  if (event.user?.user_metadata) {
    console.log('user_metadata keys:', Object.keys(event.user.user_metadata));
  }
  if (event.user?.app_metadata) {
    console.log('app_metadata keys:', Object.keys(event.user.app_metadata));
    // Check for any stored IDP tokens
    if (event.user.app_metadata.idp_access_token) {
      console.log('Found stored IDP token in app_metadata');
    }
  }
  
  // 8. CONNECTION METADATA - May contain OAuth settings
  console.log('\n8. CONNECTION METADATA (event.connection)');
  if (event.connection?.metadata) {
    console.log('Connection metadata:', event.connection.metadata);
  }
  
  // 9. CLIENT METADATA - Application-specific data
  console.log('\n9. CLIENT METADATA (event.client)');
  if (event.client?.metadata) {
    console.log('Client metadata keys:', Object.keys(event.client.metadata));
  }
  
  // 10. UNDOCUMENTED PROPERTIES - Check for any hidden properties
  console.log('\n10. CHECKING FOR UNDOCUMENTED PROPERTIES');
  const knownProps = ['user', 'connection', 'transaction', 'request', 'client', 
                     'tenant', 'secrets', 'organization', 'authentication', 
                     'authorization', 'session', 'protocol', 'stats'];
  const allProps = Object.keys(event);
  const unknownProps = allProps.filter(prop => !knownProps.includes(prop));
  if (unknownProps.length > 0) {
    console.log('Found undocumented properties:', unknownProps);
  }
  
  // SUMMARY
  console.log('\n=== SUMMARY: WHERE TO FIND ST* TOKENS ===');
  console.log('1. MOST LIKELY: event.user.identities[0].access_token');
  console.log('   - Requires "Store tokens" enabled on the connection');
  console.log('2. POSSIBLE: event.request.query.code (during initial callback)');
  console.log('3. REQUIRES MANAGEMENT API: Use read:user_idp_tokens scope');
  console.log('4. NOT AVAILABLE: Authorization codes are exchanged before Actions run');
  
  // IMPORTANT NOTE
  console.log('\n⚠️  IMPORTANT: If tokens are not in identities array:');
  console.log('1. Check connection settings → Advanced → "Store tokens" must be ON');
  console.log('2. For OIDC connections, ensure proper scope configuration');
  console.log('3. Some IDPs dont return tokens in standard format');
  console.log('4. Auth0 may process tokens internally without exposing them');
};