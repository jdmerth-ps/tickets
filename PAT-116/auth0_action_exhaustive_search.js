/**
 * Auth0 Action: Exhaustive Token Search
 * 
 * This action performs a deep search through ALL properties of the event object
 * to find any occurrence of st* tokens or authorization codes
 * 
 * Trigger: Post Login
 * Runtime: Node 18
 */

exports.onExecutePostLogin = async (event, api) => {
  // Only process for specific connections
  const connectionName = event.connection?.name || '';
  if (!connectionName.toLowerCase().includes('cencora') && 
      !connectionName.toLowerCase().includes('triose') &&
      !connectionName.toLowerCase().includes('aaas')) {
    return;
  }

  console.log('=== EXHAUSTIVE TOKEN SEARCH ===');
  console.log('Connection:', connectionName);
  console.log('Strategy:', event.connection?.strategy);
  
  const findings = [];
  
  // Deep search function
  function deepSearch(obj, path = '', depth = 0) {
    if (depth > 10) return; // Prevent infinite recursion
    
    if (obj === null || obj === undefined) return;
    
    // Check if it's a string that might be a token
    if (typeof obj === 'string') {
      if (obj.startsWith('st') && obj.length > 10) {
        findings.push({
          path: path,
          value: obj.substring(0, 50) + '...',
          type: 'Possible ST token'
        });
      }
      if (obj.includes('code') || obj.includes('token')) {
        findings.push({
          path: path,
          value: obj.substring(0, 50) + '...',
          type: 'Contains code/token keyword'
        });
      }
      return;
    }
    
    // Handle arrays
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        deepSearch(item, `${path}[${index}]`, depth + 1);
      });
      return;
    }
    
    // Handle objects
    if (typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        try {
          deepSearch(obj[key], path ? `${path}.${key}` : key, depth + 1);
        } catch (e) {
          // Some properties might throw errors when accessed
        }
      });
    }
  }
  
  // Search through all top-level event properties
  console.log('\n1. Searching entire event object...');
  deepSearch(event);
  
  // Additional specific checks
  console.log('\n2. Specific property checks:');
  
  // Check session object (if exists)
  if (event.session) {
    console.log('session:', Object.keys(event.session));
    deepSearch(event.session, 'session');
  }
  
  // Check secrets (without logging values)
  if (event.secrets) {
    console.log('secrets available:', Object.keys(event.secrets));
  }
  
  // Check resource server
  if (event.resource_server) {
    console.log('resource_server:', event.resource_server);
    deepSearch(event.resource_server, 'resource_server');
  }
  
  // Check tenant
  if (event.tenant) {
    console.log('tenant.id:', event.tenant.id);
  }
  
  // Check organization
  if (event.organization) {
    console.log('organization:', event.organization);
    deepSearch(event.organization, 'organization');
  }
  
  // Check client
  if (event.client) {
    console.log('client.name:', event.client.name);
    console.log('client.id:', event.client.client_id);
    if (event.client.metadata) {
      console.log('client.metadata keys:', Object.keys(event.client.metadata));
    }
  }
  
  // Check authentication context
  if (event.authentication) {
    console.log('authentication.methods:', event.authentication.methods);
    if (event.authentication.riskAssessment) {
      console.log('riskAssessment:', event.authentication.riskAssessment);
    }
  }
  
  // Check protocol data
  if (event.protocol) {
    console.log('protocol:', event.protocol);
    deepSearch(event.protocol, 'protocol');
  }
  
  // Check stats
  if (event.stats) {
    console.log('stats:', event.stats);
  }
  
  // New in recent versions - check for any oauth properties
  const oauthProps = ['authorization_code', 'code_verifier', 'code_challenge', 'token_endpoint_auth_method'];
  oauthProps.forEach(prop => {
    if (event[prop]) {
      console.log(`Found ${prop}:`, event[prop]);
      findings.push({
        path: prop,
        value: event[prop],
        type: 'OAuth property'
      });
    }
  });
  
  // Check transaction metadata
  if (event.transaction?.metadata) {
    console.log('transaction.metadata:', Object.keys(event.transaction.metadata));
    deepSearch(event.transaction.metadata, 'transaction.metadata');
  }
  
  // Check user app_metadata and user_metadata
  if (event.user) {
    if (event.user.app_metadata) {
      console.log('user.app_metadata keys:', Object.keys(event.user.app_metadata));
      deepSearch(event.user.app_metadata, 'user.app_metadata');
    }
    if (event.user.user_metadata) {
      console.log('user.user_metadata keys:', Object.keys(event.user.user_metadata));
      deepSearch(event.user.user_metadata, 'user.user_metadata');
    }
  }
  
  // Report findings
  console.log('\n=== SEARCH RESULTS ===');
  if (findings.length > 0) {
    console.log(`Found ${findings.length} potential tokens/codes:`);
    findings.forEach(finding => {
      console.log(`- ${finding.path}: ${finding.value} (${finding.type})`);
    });
    
    // Store findings in metadata for inspection
    api.user.setAppMetadata('token_search_results', {
      timestamp: new Date().toISOString(),
      findings_count: findings.length,
      findings: findings.slice(0, 10) // Limit to first 10
    });
  } else {
    console.log('No st* tokens or authorization codes found in event object');
  }
  
  // Also log the full structure for manual inspection
  console.log('\n=== EVENT STRUCTURE ===');
  console.log('Top-level keys:', Object.keys(event));
  
  // Log structure of key objects
  if (event.user?.identities?.[0]) {
    const identity = event.user.identities[0];
    console.log('First identity keys:', Object.keys(identity));
    console.log('Identity details:', {
      provider: identity.provider,
      connection: identity.connection,
      isSocial: identity.isSocial,
      access_token: identity.access_token ? 'Present' : 'Not present',
      refresh_token: identity.refresh_token ? 'Present' : 'Not present',
      expires_in: identity.expires_in
    });
  }
  
  console.log('=== SEARCH COMPLETE ===');
};