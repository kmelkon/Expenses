# Contributing to Expenses

Thank you for your interest in contributing to the Expenses project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Security](#security)

## Code of Conduct

This project and everyone participating in it is governed by professionalism and respect. Please be considerate and constructive in your contributions and interactions.

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Git
- For mobile development: Android Studio or Xcode

### Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR-USERNAME/Expenses.git
   cd Expenses
   ```

2. **Install dependencies**

   ```bash
   pnpm install --registry https://registry.npmjs.org/
   ```

3. **Set up environment variables**

   ```bash
   # For mobile app
   cp apps/mobile/.env.example apps/mobile/.env
   # Edit apps/mobile/.env with your values
   
   # For web app
   cp apps/web/.env.example apps/web/.env.local
   # Edit apps/web/.env.local with your values
   ```

4. **Start development**

   ```bash
   # Mobile app
   pnpm start:mobile
   
   # Web app
   pnpm dev:web
   ```

## Development Workflow

### Project Structure

This is a pnpm monorepo with three packages:

- **`apps/mobile`**: React Native/Expo mobile app
- **`apps/web`**: Next.js web dashboard
- **`packages/shared`**: Shared TypeScript types and utilities

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Making Changes

1. **Create a branch from `develop`**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the [Code Style](#code-style) guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**

   ```bash
   # Run all tests
   pnpm test
   
   # Run specific package tests
   pnpm test:shared
   pnpm test:web
   
   # Lint code
   pnpm lint
   ```

4. **Commit your changes**

   Use conventional commit messages:
   
   ```bash
   git commit -m "feat: add expense filtering by category"
   git commit -m "fix: resolve date formatting issue"
   git commit -m "docs: update setup instructions"
   git commit -m "test: add validation tests"
   ```

   Commit types:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style changes (formatting, etc.)
   - `refactor`: Code refactoring
   - `test`: Adding or updating tests
   - `chore`: Maintenance tasks

## Code Style

### TypeScript

- Use TypeScript for all code
- Enable `strict` mode in tsconfig.json
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for public APIs

### Naming Conventions

- **Components**: PascalCase (`ExpenseList.tsx`)
- **Hooks**: camelCase with `use` prefix (`useExpenses.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`ExpenseRow`, `PayerId`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_AMOUNT`)

### File Organization

- Colocate tests with source files: `validators.ts` → `validators.test.ts`
- Keep related files together
- Use barrel exports (`index.ts`) for public APIs

### Formatting

- 2-space indentation
- Double quotes for strings
- Trailing commas in multi-line objects/arrays
- Use semicolons
- Run `pnpm lint` before committing

## Testing

### Test Requirements

- All new features must include tests
- Aim for at least 80% code coverage
- Test edge cases and error conditions
- Use descriptive test names

### Test Structure

```typescript
describe("validators", () => {
  describe("isValidAmount", () => {
    it("should accept positive integers", () => {
      expect(isValidAmount(100)).toBeNull();
    });
    
    it("should reject negative numbers", () => {
      const error = isValidAmount(-100);
      expect(error?.message).toContain("greater than 0");
    });
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm --filter @expenses/shared test:watch
pnpm --filter @expenses/web test:watch

# Run with coverage
pnpm --filter @expenses/shared test:coverage
```

### Test Guidelines

- **Mobile**: Use `@testing-library/react-native` for component tests
- **Web**: Use `@testing-library/react` and `vitest` for tests
- **Shared**: Use `vitest` for unit tests
- Mock external dependencies (database, network)
- Test user interactions, not implementation details

## Submitting Changes

### Pull Request Process

1. **Update documentation**
   - Update README.md if adding features
   - Add JSDoc comments to new functions
   - Update ROADMAP.md if completing planned items

2. **Create a pull request**
   - Target the `develop` branch
   - Use a descriptive title
   - Fill out the PR template
   - Link related issues

3. **PR Description Template**

   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Tests pass locally
   - [ ] Added new tests for changes
   - [ ] Manual testing completed
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   ```

4. **Code Review**
   - Address review feedback promptly
   - Keep discussions professional
   - Update your branch with `develop` if needed

5. **After Approval**
   - Squash commits if requested
   - Maintainer will merge to `develop`

### Commit Best Practices

- Keep commits atomic (one logical change per commit)
- Write clear commit messages
- Reference issues in commits: `fix: resolve #123 - date parsing error`
- Don't commit:
  - `.env` files with secrets
  - `node_modules` or build artifacts
  - IDE-specific files (unless .gitignore updated)
  - Large binary files without discussion

## Security

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities. Instead:

1. Email the maintainer directly (see SECURITY.md)
2. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Security Best Practices

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Use parameterized queries for database operations
- Keep dependencies updated
- Follow principle of least privilege

### Code Security

When contributing:

- **Input Validation**: Use validators from `@expenses/shared`
- **Database Queries**: Always filter by `household_id` in multi-tenant contexts
- **Authentication**: Never bypass auth checks
- **Error Handling**: Don't expose sensitive info in error messages
- **Dependencies**: Run `npm audit` before submitting PRs

```typescript
// ✅ Good: Validate input
const result = validateAddExpense(input);
if (!result.valid) {
  throw new Error(result.errors.join(", "));
}

// ✅ Good: Filter by household
const expenses = await supabase
  .from('expenses')
  .select('*')
  .eq('household_id', householdId);

// ❌ Bad: No validation
await addExpense(input); // Could be invalid!

// ❌ Bad: No household filter
const expenses = await supabase
  .from('expenses')
  .select('*'); // Data leak!
```

## Development Tips

### Mobile Development

```bash
# Start with clear cache
pnpm start:mobile --clear

# Run on specific device
cd apps/mobile
npm run android
npm run ios
```

### Web Development

```bash
# Development server
pnpm dev:web

# Build for production
pnpm build:web

# Type checking
cd apps/web && npx tsc --noEmit
```

### Database Development

- Mobile uses SQLite with migrations in `apps/mobile/src/db/sqlite.ts`
- Web uses Supabase (PostgreSQL)
- Keep `packages/shared/src/types.ts` in sync with both schemas

### Debugging

- Use browser DevTools for web app
- Use React Native Debugger for mobile
- Enable verbose logging in development
- Check console for errors

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Testing Library](https://testing-library.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Questions?

- Check existing issues and discussions
- Review documentation in `/docs`
- Ask in pull request comments
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Expenses! 🎉
