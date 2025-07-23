# PAT-116: Triose - Implement SSO with Triose and Customers - Early 2025 Initiative

## Status
- **Current Status**: New (Dev)
- **Priority**: Low
- **Created**: December 13, 2024
- **Labels**: Development, PAT_Approved

## Summary
Implement SSO integration between Triose and ParcelShield to streamline user account management. This is a configuration-only task with no development work expected.

## Key Details

### Overview
- Triose will act as an SSO gateway for their customers
- Configuration work will be done in Microsoft Azure (and third-party apps)
- No development work is expected - this is purely configuration

### How It Works
1. **Security Approach**: Minimum necessary access - users need only what's required to perform their job duties
2. **Triose Portal**: Triose has setup a portal for their customers to login which authenticates customers/users from an SSO perspective
3. **SSO Connection**: Triose and ParcelShield will establish SSO connection that sees Triose customers/users as 'authenticated' users
4. **User Management**: 
   - Triose will provide ParcelShield with users by customer who need access to platform/UI
   - Users are typically going to be setup as 'contributors' so they can interact with the Triose Support team
   - Some Triose customer users will be setup as 'viewers'
   - We'll still need to setup an initial password
5. **Customer Login**: Triose customer users will use their email address and established password to login to the new platform/UI and perform their job roles
6. **Access Control**: If Triose does not request user credentials for a customer user, users should not be allowed to login to the new platform/UI
7. **Password Management**: Triose customer users will need to manage their password internal to their company rather than requesting ParcelShield to reset a password

### Benefits
- Streamlines and improves how Triose and ParcelShield manage user accounts
- Triose customers can manage their own passwords
- If a customer disables a user account, they should no longer be allowed to login

## Attachments
1. Guide -- AaaS Fundamentals - OIDC.pdf
2. Triose_Cencora SSO Configuration Details_062725_1.pdf
3. Triose_Cencora SSO Configuration Details_062725_2.pdf
4. Triose SSO Integration Email-060625.pdf

## Recent Activity
- **January 22, 2025**: Team (Alex, Chris, Al) talked to Triose team about SSO implementation
- **June 9, 2025**: Additional SSO configuration details attached
- **July 2, 2025**: More SSO configuration details added
- **July 7, 2025**: Cencora/Triose team asking when SSO configuration will be updated with their specifics for testing in lower environment

## Team Members
- Al Mahnke (Reporter/Creator)
- Justin Merth
- Erica Wittenmyer
- Chris Olszewski
- Alex Olszewski

## Next Steps
Waiting for team response on when SSO configuration will be updated with Triose/Cencora specifics for testing in lower environment.