#!/usr/bin/env node

/**
 * Script to check and update OIDC connection settings
 * This will help us see if token storage can be enabled
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuration - Update these values
const AUTH0_DOMAIN = 'parcelshield-dev.us.auth0.com';
const MANAGEMENT_API_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJVQWhZTXBtLUwtWE40RXhRc0tKUSJ9.eyJpc3MiOiJodHRwczovL3BhcmNlbHNoaWVsZC1kZXYudXMuYXV0aDAuY29tLyIsInN1YiI6IjVRdG42RWtmQVNuNUNDcXQza2dnaFZBWUJvR2RXMElKQGNsaWVudHMiLCJhdWQiOiJodHRwczovL3BhcmNlbHNoaWVsZC1kZXYudXMuYXV0aDAuY29tL2FwaS92Mi8iLCJpYXQiOjE3NTMzOTM3NzYsImV4cCI6MTc1MzQ4MDE3Niwic2NvcGUiOiJyZWFkOmNsaWVudF9ncmFudHMgY3JlYXRlOmNsaWVudF9ncmFudHMgZGVsZXRlOmNsaWVudF9ncmFudHMgdXBkYXRlOmNsaWVudF9ncmFudHMgcmVhZDp1c2VycyB1cGRhdGU6dXNlcnMgZGVsZXRlOnVzZXJzIGNyZWF0ZTp1c2VycyByZWFkOnVzZXJzX2FwcF9tZXRhZGF0YSB1cGRhdGU6dXNlcnNfYXBwX21ldGFkYXRhIGRlbGV0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgY3JlYXRlOnVzZXJzX2FwcF9tZXRhZGF0YSByZWFkOnVzZXJfY3VzdG9tX2Jsb2NrcyBjcmVhdGU6dXNlcl9jdXN0b21fYmxvY2tzIGRlbGV0ZTp1c2VyX2N1c3RvbV9ibG9ja3MgY3JlYXRlOnVzZXJfdGlja2V0cyByZWFkOmNsaWVudHMgdXBkYXRlOmNsaWVudHMgZGVsZXRlOmNsaWVudHMgY3JlYXRlOmNsaWVudHMgcmVhZDpjbGllbnRfa2V5cyB1cGRhdGU6Y2xpZW50X2tleXMgZGVsZXRlOmNsaWVudF9rZXlzIGNyZWF0ZTpjbGllbnRfa2V5cyByZWFkOmNvbm5lY3Rpb25zIHVwZGF0ZTpjb25uZWN0aW9ucyBkZWxldGU6Y29ubmVjdGlvbnMgY3JlYXRlOmNvbm5lY3Rpb25zIHJlYWQ6cmVzb3VyY2Vfc2VydmVycyB1cGRhdGU6cmVzb3VyY2Vfc2VydmVycyBkZWxldGU6cmVzb3VyY2Vfc2VydmVycyBjcmVhdGU6cmVzb3VyY2Vfc2VydmVycyByZWFkOmRldmljZV9jcmVkZW50aWFscyB1cGRhdGU6ZGV2aWNlX2NyZWRlbnRpYWxzIGRlbGV0ZTpkZXZpY2VfY3JlZGVudGlhbHMgY3JlYXRlOmRldmljZV9jcmVkZW50aWFscyByZWFkOnJ1bGVzIHVwZGF0ZTpydWxlcyBkZWxldGU6cnVsZXMgY3JlYXRlOnJ1bGVzIHJlYWQ6cnVsZXNfY29uZmlncyB1cGRhdGU6cnVsZXNfY29uZmlncyBkZWxldGU6cnVsZXNfY29uZmlncyByZWFkOmhvb2tzIHVwZGF0ZTpob29rcyBkZWxldGU6aG9va3MgY3JlYXRlOmhvb2tzIHJlYWQ6YWN0aW9ucyB1cGRhdGU6YWN0aW9ucyBkZWxldGU6YWN0aW9ucyBjcmVhdGU6YWN0aW9ucyByZWFkOmVtYWlsX3Byb3ZpZGVyIHVwZGF0ZTplbWFpbF9wcm92aWRlciBkZWxldGU6ZW1haWxfcHJvdmlkZXIgY3JlYXRlOmVtYWlsX3Byb3ZpZGVyIGJsYWNrbGlzdDp0b2tlbnMgcmVhZDpzdGF0cyByZWFkOmluc2lnaHRzIHJlYWQ6dGVuYW50X3NldHRpbmdzIHVwZGF0ZTp0ZW5hbnRfc2V0dGluZ3MgcmVhZDpsb2dzIHJlYWQ6bG9nc191c2VycyByZWFkOnNoaWVsZHMgY3JlYXRlOnNoaWVsZHMgdXBkYXRlOnNoaWVsZHMgZGVsZXRlOnNoaWVsZHMgcmVhZDphbm9tYWx5X2Jsb2NrcyBkZWxldGU6YW5vbWFseV9ibG9ja3MgdXBkYXRlOnRyaWdnZXJzIHJlYWQ6dHJpZ2dlcnMgcmVhZDpncmFudHMgZGVsZXRlOmdyYW50cyByZWFkOmd1YXJkaWFuX2ZhY3RvcnMgdXBkYXRlOmd1YXJkaWFuX2ZhY3RvcnMgcmVhZDpndWFyZGlhbl9lbnJvbGxtZW50cyBkZWxldGU6Z3VhcmRpYW5fZW5yb2xsbWVudHMgY3JlYXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRfdGlja2V0cyByZWFkOnVzZXJfaWRwX3Rva2VucyBjcmVhdGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiBkZWxldGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiByZWFkOmN1c3RvbV9kb21haW5zIGRlbGV0ZTpjdXN0b21fZG9tYWlucyBjcmVhdGU6Y3VzdG9tX2RvbWFpbnMgdXBkYXRlOmN1c3RvbV9kb21haW5zIHJlYWQ6ZW1haWxfdGVtcGxhdGVzIGNyZWF0ZTplbWFpbF90ZW1wbGF0ZXMgdXBkYXRlOmVtYWlsX3RlbXBsYXRlcyByZWFkOm1mYV9wb2xpY2llcyB1cGRhdGU6bWZhX3BvbGljaWVzIHJlYWQ6cm9sZXMgY3JlYXRlOnJvbGVzIGRlbGV0ZTpyb2xlcyB1cGRhdGU6cm9sZXMgcmVhZDpwcm9tcHRzIHVwZGF0ZTpwcm9tcHRzIHJlYWQ6YnJhbmRpbmcgdXBkYXRlOmJyYW5kaW5nIGRlbGV0ZTpicmFuZGluZyByZWFkOmxvZ19zdHJlYW1zIGNyZWF0ZTpsb2dfc3RyZWFtcyBkZWxldGU6bG9nX3N0cmVhbXMgdXBkYXRlOmxvZ19zdHJlYW1zIGNyZWF0ZTpzaWduaW5nX2tleXMgcmVhZDpzaWduaW5nX2tleXMgdXBkYXRlOnNpZ25pbmdfa2V5cyByZWFkOmxpbWl0cyB1cGRhdGU6bGltaXRzIGNyZWF0ZTpyb2xlX21lbWJlcnMgcmVhZDpyb2xlX21lbWJlcnMgZGVsZXRlOnJvbGVfbWVtYmVycyByZWFkOmVudGl0bGVtZW50cyByZWFkOmF0dGFja19wcm90ZWN0aW9uIHVwZGF0ZTphdHRhY2tfcHJvdGVjdGlvbiByZWFkOm9yZ2FuaXphdGlvbnNfc3VtbWFyeSByZWFkOm9yZ2FuaXphdGlvbnMgdXBkYXRlOm9yZ2FuaXphdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbnMgZGVsZXRlOm9yZ2FuaXphdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJzIHJlYWQ6b3JnYW5pemF0aW9uX21lbWJlcnMgZGVsZXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJzIGNyZWF0ZTpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgcmVhZDpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgdXBkYXRlOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyBkZWxldGU6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIGNyZWF0ZTpvcmdhbml6YXRpb25fbWVtYmVyX3JvbGVzIHJlYWQ6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyBkZWxldGU6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyBjcmVhdGU6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIHJlYWQ6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIGRlbGV0ZTpvcmdhbml6YXRpb25faW52aXRhdGlvbnMiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiI1UXRuNkVrZkFTbjVDQ3F0M2tnZ2hWQVlCb0dkVzBJSiJ9.AYScwg90OrAtjo33Orhg4zGIINoDk9DzjI6hbYCBhTUMW68p9T5W1r_lGzcDqmLrLa8o-72l7BP5kW0Pb7af0uP0Nl5RyJEHos05BAOKqhYI_gLcG93ANqUI5-_Nj3Eype7yhKH-ccPiSouJR4wGb1q5EgXVA7T5PCEmM7AsVjSJ-RK55irvMO4QvqVovWcNYBo1Wi01f4AjKCmvTdxAMRW701QaNU9Te4iU2YQcmS7O-sArzetf-3C0IRO9udwqLlYgjYNjBcB4E7RJXHSaeXls7ruMvReYkamySkCwQ4h7ZeMsfk7uj38moJ2wG68Wo5Ln--ma9DAo_5ea3yJbOQ'; // Get this from Auth0 Dashboard
const CONNECTION_ID = 'con_aIEYJY0KxYsiO9E5'; // Your Cencora connection ID

async function checkConnectionSettings() {
  try {
    // Get current connection settings
    const response = await fetch(
      `https://${AUTH0_DOMAIN}/api/v2/connections/${CONNECTION_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${MANAGEMENT_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get connection: ${response.status}`);
    }

    const connection = await response.json();
    console.log('Current connection settings:');
    console.log(JSON.stringify(connection, null, 2));
    
    // Try to get more details
    if (!connection.options) {
      console.log('\n⚠️  WARNING: No options object found in connection!');
      console.log('This might mean token storage settings are not available for this connection type.');
    }

    // Check specific settings
    console.log('\n=== Token Storage Settings ===');
    console.log('Strategy:', connection.strategy);
    console.log('Options:', connection.options);
    
    // Look for token storage settings
    if (connection.options) {
      console.log('Store IDP Tokens:', connection.options.store_idp_tokens);
      console.log('Set User Root Attributes:', connection.options.set_user_root_attributes);
      console.log('Non-Persistent Attrs:', connection.options.non_persistent_attrs);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

async function enableTokenStorage() {
  try {
    // Update connection to store tokens
    const response = await fetch(
      `https://${AUTH0_DOMAIN}/api/v2/connections/${CONNECTION_ID}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${MANAGEMENT_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          options: {
            store_idp_tokens: true,
            set_user_root_attributes: 'on_each_login',
            // Try these additional options
            upstream_params: {
              store_tokens: {
                value: true
              }
            }
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update connection: ${response.status} - ${error}`);
    }

    console.log('Successfully updated connection settings');
    const updated = await response.json();
    console.log('New settings:', JSON.stringify(updated.options, null, 2));

  } catch (error) {
    console.error('Error updating connection:', error);
  }
}

// Instructions for getting Management API token:
console.log('=== How to get Management API Token ===');
console.log('1. Go to Auth0 Dashboard > APIs');
console.log('2. Click on "Auth0 Management API"');
console.log('3. Go to "API Explorer" tab');
console.log('4. Copy the token');
console.log('5. Or create a new M2M app with read:connections and update:connections scopes\n');

// Function to try different approaches
async function tryEnableTokenStorage() {
  console.log('\n=== Attempting to Enable Token Storage ===');
  
  const attempts = [
    {
      name: 'Standard options approach',
      body: {
        options: {
          store_idp_tokens: true,
          set_user_root_attributes: 'on_each_login'
        }
      }
    },
    {
      name: 'OIDC-specific approach',
      body: {
        options: {
          type: 'back_channel',
          authorization_endpoint: 'https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/authorize',
          token_endpoint: 'https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/token',
          userinfo_endpoint: 'https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo',
          jwks_uri: 'https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/.well-known/jwks',
          client_id: 'erg1mMiczzZR4CltGoUCv_h7',
          scope: 'openid profile email uid',
          store_idp_tokens: true
        }
      }
    }
  ];
  
  for (const attempt of attempts) {
    try {
      console.log(`\nTrying: ${attempt.name}`);
      const response = await fetch(
        `https://${AUTH0_DOMAIN}/api/v2/connections/${CONNECTION_ID}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${MANAGEMENT_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(attempt.body)
        }
      );
      
      if (response.ok) {
        const updated = await response.json();
        console.log('✓ Success! Updated connection:');
        console.log(JSON.stringify(updated.options || {}, null, 2));
        return;
      } else {
        const error = await response.text();
        console.log(`✗ Failed: ${response.status} - ${error}`);
      }
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
    }
  }
}

// Main execution
(async () => {
  await checkConnectionSettings();
  
  // Uncomment the line below to try enabling token storage
  // await tryEnableTokenStorage();
  
  console.log('\n💡 To enable token storage, uncomment the tryEnableTokenStorage() line and run again.');
})();