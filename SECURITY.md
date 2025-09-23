# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please send an email to [security contact]. Please do not report security vulnerabilities through public GitHub issues.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 72 hours  
- **Resolution**: Depends on severity

## Security Best Practices

### Environment Variables
- Never commit `.env` files
- Use GitHub Secrets for CI/CD
- Rotate secrets regularly

### Authentication
- BetterAuth with scrypt password hashing
- HTTP-only cookies for session management
- Proper session expiration

### Database Security
- Supabase RLS (Row Level Security) enabled
- User data isolation
- SQL injection prevention

### Frontend Security
- Input validation on all forms
- XSS prevention
- CSRF protection
- Content Security Policy headers

### API Security
- Authentication required for all protected routes
- Rate limiting implemented
- Input validation and sanitization
- Error handling without information leakage

## Dependencies

We regularly audit our dependencies for security vulnerabilities:
- Run `npm audit` in CI/CD pipeline
- Automated security scanning with Snyk
- Keep dependencies updated

## Contact

For security concerns: [security contact]
