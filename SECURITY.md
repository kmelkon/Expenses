# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to the project maintainer. You can find contact information in the repository.

### What to Include

When reporting a security issue, please include:

1. **Description**: Clear description of the vulnerability
2. **Impact**: Potential impact and severity assessment
3. **Steps to Reproduce**: Detailed steps to reproduce the issue
4. **Affected Versions**: Which versions are affected
5. **Proposed Fix**: If you have suggestions for fixing the issue
6. **Proof of Concept**: Code or screenshots demonstrating the issue (if applicable)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Next release cycle

## Security Best Practices

### For Contributors

When contributing to this project, please follow these security practices:

#### 1. Input Validation

**Always validate user inputs** before processing or storing them.

```typescript
import { validateAddExpense } from "@expenses/shared";

// ✅ Good: Validate before processing
const result = validateAddExpense(input);
if (!result.valid) {
  throw new Error(result.errors.join(", "));
}
await addExpense(input);

// ❌ Bad: No validation
await addExpense(input);
```

#### 2. Multi-Tenant Data Isolation

**Always filter by household_id** in database queries for the web app.

```typescript
// ✅ Good: Household filtered
const { data } = await supabase
  .from('expenses')
  .select('*')
  .eq('household_id', user.household_id)
  .eq('date', date);

// ❌ Bad: No household filter - DATA LEAK!
const { data } = await supabase
  .from('expenses')
  .select('*')
  .eq('date', date);
```

#### 3. Parameterized Queries

**Always use parameterized queries** to prevent SQL injection.

```typescript
// ✅ Good: Parameterized query
await db.runAsync(
  'INSERT INTO expenses (id, amount_cents) VALUES (?, ?)',
  [id, amount]
);

// ❌ Bad: String concatenation - SQL INJECTION RISK!
await db.runAsync(
  `INSERT INTO expenses (id, amount_cents) VALUES ('${id}', ${amount})`
);
```

#### 4. Authentication

**Never bypass authentication checks** in protected routes or components.

```typescript
// ✅ Good: Check authentication
if (!user) {
  redirect('/login');
}

// ❌ Bad: No auth check
// Allow access to protected resource without verification
```

#### 5. Error Handling

**Don't expose sensitive information** in error messages.

```typescript
// ✅ Good: Generic error message
catch (error) {
  console.error('Database error:', error); // Log for debugging
  throw new Error('Failed to save expense'); // User-facing message
}

// ❌ Bad: Exposes internals
catch (error) {
  throw new Error(`Database error: ${error.message}`);
}
```

#### 6. Secrets Management

**Never commit secrets** to the repository.

- Use `.env` files for local development
- Add `.env` to `.gitignore`
- Use environment variables in production
- Rotate secrets if accidentally committed
- Use `.env.example` to document required variables

```bash
# ✅ Good: Environment variable
SUPABASE_URL=https://project.supabase.co

# ❌ Bad: Hardcoded secret
const API_KEY = "sb-abc123..."; // Never do this!
```

#### 7. Dependencies

**Keep dependencies up to date** and audit regularly.

```bash
# Check for vulnerabilities
npm audit
pnpm audit

# Update dependencies
pnpm update

# Fix vulnerabilities
npm audit fix
```

## Known Security Considerations

### 1. Row Level Security (RLS)

The web app relies on Supabase Row Level Security policies. Ensure:

- RLS is enabled on all tables
- Policies filter by `household_id`
- Users can only access their household's data

### 2. Client-Side Validation

Client-side validation provides UX but **is not a security control**.

- Always validate on the server/database side
- Use validators from `@expenses/shared` on both client and server
- Treat all client input as untrusted

### 3. API Keys

The Supabase `anon` key is safe to expose in client apps because:

- It's prefixed with `NEXT_PUBLIC_` or `EXPO_PUBLIC_`
- RLS policies enforce authorization
- It cannot bypass database security

However:

- Never expose service role keys
- Never disable RLS on production tables
- Monitor for unusual activity

### 4. Mobile Storage

The mobile app stores data in SQLite:

- Data is not encrypted at rest by default
- Consider enabling device encryption
- Sensitive data should use `expo-secure-store`
- Authentication tokens are stored securely

### 5. OAuth Flow

Google OAuth implementation:

- Uses PKCE flow for security
- State parameter prevents CSRF
- Tokens stored in secure storage
- Callback URL validated

## Security Checklist for PRs

Before submitting a PR, verify:

- [ ] All user inputs are validated
- [ ] Database queries are parameterized
- [ ] Multi-tenant queries filter by `household_id`
- [ ] No secrets in code or commits
- [ ] Error messages don't expose sensitive info
- [ ] Authentication checks are present
- [ ] Dependencies are up to date
- [ ] Tests cover security-relevant code
- [ ] Documentation updated if security model changes

## Common Vulnerabilities to Avoid

### SQL Injection

- ✅ Use parameterized queries
- ✅ Validate and sanitize inputs
- ❌ Never concatenate user input into queries

### Cross-Site Scripting (XSS)

- ✅ React/Next.js auto-escapes by default
- ✅ Sanitize user input before storage
- ❌ Avoid `dangerouslySetInnerHTML` without sanitization

### Authentication Bypass

- ✅ Check authentication in middleware
- ✅ Verify session tokens
- ❌ Don't trust client-side auth state alone

### Insecure Direct Object Reference (IDOR)

- ✅ Filter by `household_id` in all queries
- ✅ Verify user has access to requested resources
- ❌ Don't trust IDs from client

### Information Disclosure

- ✅ Use generic error messages
- ✅ Log details server-side only
- ❌ Don't return stack traces to clients

## Security Updates

Security patches will be:

1. Developed privately
2. Tested thoroughly
3. Released with security advisory
4. Documented in changelog
5. Communicated to users

## Acknowledgments

We thank security researchers who responsibly disclose vulnerabilities. Contributors who report valid security issues will be:

- Credited in security advisories (if desired)
- Mentioned in release notes
- Thanked publicly (with permission)

## Contact

For security concerns, contact the maintainer via:

- Email: [See repository owner profile]
- GitHub: Create a security advisory at `/security/advisories/new`

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [React Security Best Practices](https://react.dev/learn/security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)

---

**Last Updated**: 2026-02-07
