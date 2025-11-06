# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

The Ai-Imam team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories** (Preferred)
   - Go to the [Security tab](https://github.com/Brian125bot/ai_imam/security/advisories)
   - Click "Report a vulnerability"
   - Fill in the details

2. **Email**
   - Create a private issue requesting contact information
   - Wait for a response with secure communication channel

### What to Include

Please include the following information in your report:

- Type of vulnerability
- Full path of source file(s) related to the vulnerability
- Location of affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability
- Potential solutions (if you have suggestions)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Varies by severity (see below)

### Severity Levels

#### Critical (Fix within 24-48 hours)
- Remote code execution
- SQL injection
- Authentication bypass
- Exposure of sensitive data (API keys, user data)

#### High (Fix within 7 days)
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Privilege escalation
- Insecure direct object references

#### Medium (Fix within 30 days)
- Information disclosure
- Denial of service
- Insecure configuration

#### Low (Fix as time permits)
- Minor information leaks
- Best practice violations

## Security Best Practices

### For Users

1. **API Key Management**
   - Never commit API keys to version control
   - Use environment variables for API keys
   - Rotate API keys regularly
   - Set up usage alerts in Google Cloud Console

2. **Dependencies**
   - Keep dependencies updated
   - Run `npm audit` regularly
   - Review security advisories

3. **Deployment**
   - Use HTTPS in production
   - Enable security headers
   - Implement proper CORS policies
   - Use Content Security Policy (CSP)

### For Contributors

1. **Code Review**
   - Review all code changes for security implications
   - Check for hardcoded secrets
   - Validate input/output handling
   - Ensure proper error handling

2. **Dependencies**
   - Audit new dependencies before adding
   - Prefer well-maintained packages
   - Check for known vulnerabilities
   - Lock dependency versions

3. **Testing**
   - Test security-critical paths
   - Validate input sanitization
   - Test error handling
   - Check for information leaks in errors

## Known Security Considerations

### API Key Exposure

**Risk**: API keys are injected at build time and could be exposed in the client bundle.

**Mitigation**:
- For production, consider using a backend proxy
- Implement rate limiting on the backend
- Monitor API usage for anomalies
- Use API key restrictions in Google Cloud Console

**Recommended Production Setup**:
```
Client → Backend Proxy → Gemini API
         (API key hidden on server)
```

### Client-Side Validation

**Risk**: Client-side validation can be bypassed.

**Current State**: Input validation is client-side only.

**Mitigation**:
- Gemini API has built-in safety filters
- Rate limiting is enforced by the API
- Consider adding backend validation for production

### Cross-Site Scripting (XSS)

**Risk**: Rendering user input or API responses could lead to XSS.

**Mitigation**:
- React automatically escapes content
- `dangerouslySetInnerHTML` is used carefully only for markdown
- Content comes from trusted source (Gemini API)

### Denial of Service

**Risk**: Rapid requests could hit rate limits.

**Mitigation**:
- API rate limiting by Google
- Consider client-side rate limiting
- Monitor usage patterns

## Dependency Security

### Automated Scanning

We use the following tools to monitor dependencies:

- **npm audit**: Check for known vulnerabilities
- **Dependabot**: Automated dependency updates
- **GitHub Security Advisories**: Track security issues

### Update Policy

- **Critical vulnerabilities**: Update immediately
- **High vulnerabilities**: Update within 7 days
- **Medium/Low vulnerabilities**: Update in next release
- **Regular updates**: Monthly dependency review

### Running Security Audit

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if possible)
npm audit fix

# Force fix (may introduce breaking changes)
npm audit fix --force

# View detailed report
npm audit --json
```

## Security Headers

### Recommended Headers for Production

```nginx
# Prevent clickjacking
X-Frame-Options: SAMEORIGIN

# Prevent MIME type sniffing
X-Content-Type-Options: nosniff

# Enable XSS protection
X-XSS-Protection: 1; mode=block

# Content Security Policy
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  font-src 'self' data:;
  connect-src 'self' https://generativelanguage.googleapis.com;

# Force HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains

# Referrer Policy
Referrer-Policy: strict-origin-when-cross-origin

# Permissions Policy
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Incident Response

### In Case of Security Breach

1. **Immediate Actions**
   - Rotate all API keys
   - Review access logs
   - Identify affected users
   - Assess data exposure

2. **Communication**
   - Notify affected users
   - Post security advisory
   - Update documentation

3. **Remediation**
   - Deploy fix
   - Verify fix effectiveness
   - Update security measures

4. **Post-Incident**
   - Conduct security review
   - Update security policies
   - Improve monitoring

## Security Checklist for Releases

Before each release:

- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review code changes for security implications
- [ ] Check for hardcoded secrets or API keys
- [ ] Verify input validation and sanitization
- [ ] Test error handling (no sensitive info in errors)
- [ ] Review dependencies for known issues
- [ ] Update security documentation if needed
- [ ] Test deployment security (HTTPS, headers)

## Contact

For security concerns that don't require immediate attention:

- Create a private security advisory on GitHub
- Tag issues with `security` label (for non-sensitive issues)

## Acknowledgments

We thank the security research community for helping keep Ai-Imam safe. Responsible disclosure is appreciated and will be acknowledged in release notes (with your permission).

---

**Note**: This security policy is subject to change. Please check back regularly for updates.

Last Updated: November 6, 2024
