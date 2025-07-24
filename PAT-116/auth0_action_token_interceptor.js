/**
 * Auth0 Action: Token Interceptor and Logger
 * 
 * This action intercepts and logs all tokens during the authentication flow
 * to help identify where the st* tokens appear and how to capture them.
 * 
 * Trigger: Post Login
 * Runtime: Node 18
 * 
 * Deploy this FIRST to understand your token flow, then deploy the handler.
 */

exports.onExecutePostLogin = async (event, api) => {
  console.log('=== TOKEN INTERCEPTOR - DEBUGGING ===');
  
  // Log all available event data that might contain tokens
  const tokenLocations = {
    // User identities
    'user.identities': event.user?.identities?.map(id => ({
      provider: id.provider,
      connection: id.connection,
      access_token: id.access_token ? 'Present' : 'Missing',
      refresh_token: id.refresh_token ? 'Present' : 'Missing',
      id_token: id.id_token ? 'Present' : 'Missing'
    })),
    
    // Transaction data
    'transaction.protocol': event.transaction?.protocol,
    'transaction.protocol_params': Object.keys(event.transaction?.protocol_params || {}),
    'transaction.identity_provider_access_token': event.transaction?.identity_provider_access_token ? 'Present' : 'Missing',
    
    // Request data
    'request.query': Object.keys(event.request?.query || {}),
    'request.body': Object.keys(event.request?.body || {}),
    
    // Authorization data
    'authorization': event.authorization ? Object.keys(event.authorization) : [],
    
    // Connection info
    'connection.name': event.connection?.name,
    'connection.strategy': event.connection?.strategy,
    
    // Authentication info  
    'authentication.methods': event.authentication?.methods
  };
  
  console.log('Token Locations:', JSON.stringify(tokenLocations, null, 2));
  
  // Check for st* tokens in various places
  const stTokenSearch = {
    found: [],
    locations: []
  };
  
  // Helper function to check for st* tokens
  function checkForStToken(value, location) {
    if (typeof value === 'string' && value.startsWith('st')) {
      stTokenSearch.found.push(value.substring(0, 50) + '...');
      stTokenSearch.locations.push(location);
      return true;
    }
    return false;
  }
  
  // Search in query parameters
  if (event.request?.query) {
    Object.entries(event.request.query).forEach(([key, value]) => {
      checkForStToken(value, `request.query.${key}`);
    });
  }
  
  // Search in body parameters
  if (event.request?.body) {
    Object.entries(event.request.body).forEach(([key, value]) => {
      checkForStToken(value, `request.body.${key}`);
    });
  }
  
  // Search in protocol params
  if (event.transaction?.protocol_params) {
    Object.entries(event.transaction.protocol_params).forEach(([key, value]) => {
      checkForStToken(value, `transaction.protocol_params.${key}`);
    });
  }
  
  // Search in identities
  if (event.user?.identities) {
    event.user.identities.forEach((identity, index) => {
      checkForStToken(identity.access_token, `user.identities[${index}].access_token`);
      checkForStToken(identity.refresh_token, `user.identities[${index}].refresh_token`);
    });
  }
  
  // Log findings
  console.log('ST Token Search Results:', JSON.stringify(stTokenSearch, null, 2));
  
  // Store debugging info in user metadata for inspection
  api.user.setAppMetadata('token_interceptor_debug', {
    timestamp: new Date().toISOString(),
    connection: event.connection?.name,
    strategy: event.connection?.strategy,
    st_tokens_found: stTokenSearch.found.length > 0,
    st_token_locations: stTokenSearch.locations,
    protocol: event.transaction?.protocol,
    authentication_methods: event.authentication?.methods
  });
  
  // Add debug info to tokens for testing
  api.idToken.setCustomClaim('debug_token_locations', stTokenSearch.locations);
  api.accessToken.setCustomClaim('debug_st_found', stTokenSearch.found.length > 0);
  
  console.log('=== TOKEN INTERCEPTOR - COMPLETE ===');
};