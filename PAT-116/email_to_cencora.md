Subject: Triose SSO Integration - Technical Challenge with Auth0

Hi Cencora Team,

I hope this email finds you well. We've been working on integrating Triose SSO using your OIDC endpoints and have encountered a technical challenge that we'd like your input on.

**The Issue:**
When authenticating through Auth0 with your OIDC connection, we receive Gigya session tokens (starting with "st2.s.") instead of standard OAuth access tokens. These session tokens cannot be used directly with your documented userinfo endpoint (https://tst.aaas.cencora.com/oidc/op/v1.0/4_Pv18t6XTOc51PxyYytQzHA/userinfo), which expects a bearer token.

Additionally, Auth0's Enterprise OIDC connections don't expose these upstream tokens to our integration layer, preventing us from enriching user profiles with data from your userinfo endpoint.

**Our Question:**
Are there alternative approaches we should consider? For example:
- Is there a different endpoint that accepts Gigya session tokens?
- Can we configure the OIDC flow to return standard OAuth tokens instead?
- Are there other integration patterns you've seen work successfully with Auth0?

We want to ensure we're following best practices for your platform while meeting our integration requirements. Any guidance or alternative approaches you can suggest would be greatly appreciated.

Thank you for your time and assistance.

Best regards,
[Your Name]
ParcelShield Development Team