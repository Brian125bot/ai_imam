# Contributing to Ai-Imam

Thank you for your interest in contributing to Ai-Imam! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Be respectful and considerate in communication
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Scope

This Code of Conduct applies to all project spaces, including:
- GitHub repository (issues, pull requests, discussions)
- Code reviews
- Project documentation
- Communication channels

### Enforcement

Instances of unacceptable behavior may be reported to the project maintainers. All complaints will be reviewed and investigated promptly and fairly.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**Good bug reports include:**

- Clear, descriptive title
- Steps to reproduce the behavior
- Expected vs. actual behavior
- Screenshots (if applicable)
- Environment details (browser, OS, Node version)
- Error messages or console logs

**Bug Report Template:**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS 13.0]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17.0]
- App version: [e.g., commit hash]

**Additional context**
Any other relevant information.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please:

- Use a clear, descriptive title
- Provide a detailed description of the proposed feature
- Explain why this enhancement would be useful
- Include mockups or examples if applicable
- Consider backward compatibility

**Feature Request Template:**

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other approaches you've thought about.

**Additional context**
Screenshots, mockups, or examples.
```

### Contributing Code

We welcome code contributions! Areas where help is especially appreciated:

#### 🐛 Bug Fixes
- Fix reported issues
- Improve error handling
- Enhance edge case coverage

#### ✨ New Features
- Fatwa history/favorites
- User authentication
- Additional language support
- Offline support
- Export functionality (PDF, etc.)

#### 🎨 UI/UX Improvements
- Accessibility enhancements
- Responsive design improvements
- Dark mode support
- Animation refinements

#### 📖 Documentation
- Code documentation
- User guides
- API documentation
- Translation of documentation

#### 🧪 Testing
- Unit tests
- Integration tests
- E2E tests
- Accessibility tests

## Development Setup

### Prerequisites

- **Node.js**: 18.x or later
- **npm**: 9.x or later
- **Git**: Latest version
- **Text Editor**: VS Code recommended

### Initial Setup

1. **Fork the repository**
   
   Click the "Fork" button on GitHub to create your own copy.

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai_imam.git
   cd ai_imam
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Brian125bot/ai_imam.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment variables**
   
   Create `.env.local`:
   ```env
   GEMINI_API_KEY=your_development_api_key
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Verify setup**
   
   Open `http://localhost:3000` and test the application.

### Recommended VS Code Extensions

- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Error Lens
- GitLens
- Auto Rename Tag
- Path Intellisense

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch Naming Conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

### 3. Test Your Changes

```bash
# Build the project
npm run build

# Preview production build
npm run preview

# Test in different browsers
# Test on mobile devices
```

### 4. Commit Your Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add fatwa history feature"
```

See [Commit Messages](#commit-messages) for guidelines.

### 5. Keep Your Branch Updated

```bash
# Fetch upstream changes
git fetch upstream

# Rebase your branch
git rebase upstream/main

# Resolve conflicts if any
# Then continue rebase
git rebase --continue
```

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in the PR template
4. Submit the pull request

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Provide explicit types (avoid `any`)
- Use interfaces for object shapes
- Document complex types with comments

**Good:**
```typescript
interface UserPreferences {
  language: 'en' | 'ar';
  voiceSpeed: number;
  theme: 'light' | 'dark';
}

function savePreferences(prefs: UserPreferences): void {
  // Implementation
}
```

**Avoid:**
```typescript
function savePreferences(prefs: any) {
  // No type safety
}
```

### React Components

- Use functional components with hooks
- Memoize expensive computations with `useMemo`
- Optimize callbacks with `useCallback`
- Use proper prop types

**Good:**
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};
```

### File Organization

```
component/
├── ComponentName.tsx       # Component implementation
├── ComponentName.test.tsx  # Unit tests (if added)
└── index.ts               # Re-export (if needed)
```

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Use semicolons
- **Line length**: Max 100 characters
- **Naming**:
  - PascalCase for components and types
  - camelCase for functions and variables
  - UPPER_CASE for constants

### Comments

Use JSDoc-style comments for functions and components:

```typescript
/**
 * Generates a fatwa based on user prompt.
 * 
 * @param prompt - The user's question about Islamic jurisprudence
 * @returns A promise that resolves to a Fatwa object
 * @throws {Error} When API call fails or validation fails
 * 
 * @example
 * const fatwa = await generateFatwa("What is the ruling on fasting?");
 */
export async function generateFatwa(prompt: string): Promise<Fatwa> {
  // Implementation
}
```

### Accessibility

- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain proper color contrast

**Good:**
```typescript
<button
  onClick={handleSubmit}
  aria-label="Submit question for fatwa"
  disabled={isLoading}
>
  Submit
</button>
```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, config)
- `perf`: Performance improvements

### Examples

```bash
feat(ui): add dark mode support

Implement dark mode with system preference detection and manual toggle.

Closes #123
```

```bash
fix(api): handle rate limit errors gracefully

Improve error handling for Gemini API rate limits with user-friendly messages.
```

```bash
docs(readme): update installation instructions

Add troubleshooting section for common setup issues.
```

### Commit Message Guidelines

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor" not "moves cursor")
- Keep subject line under 50 characters
- Capitalize subject line
- No period at end of subject line
- Include detailed body if needed
- Reference issues in footer

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Changes have been tested locally
- [ ] Documentation has been updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe testing approach.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added (if applicable)

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Closes #(issue number)
```

### Review Process

1. **Automated Checks**: CI/CD runs build and tests
2. **Code Review**: Maintainers review code
3. **Feedback**: Address review comments
4. **Approval**: Get approval from maintainer
5. **Merge**: Maintainer merges PR

### Addressing Feedback

```bash
# Make requested changes
# Commit changes
git add .
git commit -m "address review feedback"

# Push to update PR
git push origin feature/your-feature-name
```

## Testing Guidelines

### Manual Testing

Always test:
1. Form submission with various inputs
2. Error scenarios (empty input, API failures)
3. Text-to-speech functionality
4. Copy to clipboard
5. Responsive design (mobile, tablet, desktop)
6. Browser compatibility (Chrome, Firefox, Safari, Edge)
7. Accessibility with keyboard navigation

### Automated Testing (Future)

When adding tests, follow these patterns:

**Unit Test Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PromptForm from './PromptForm';

describe('PromptForm', () => {
  it('renders textarea and submit button', () => {
    render(<PromptForm 
      prompt="" 
      onPromptChange={() => {}} 
      onSubmit={() => {}} 
      isLoading={false} 
    />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

## Documentation

### Updating Documentation

When making changes, update relevant documentation:

- **README.md**: User-facing features, setup instructions
- **ARCHITECTURE.md**: Technical architecture changes
- **API.md**: API integration changes
- **DEPLOYMENT.md**: Deployment process changes
- **Code Comments**: Complex logic explanations

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Keep formatting consistent
- Check spelling and grammar

## Getting Help

- 💬 **Discussions**: [GitHub Discussions](https://github.com/Brian125bot/ai_imam/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Brian125bot/ai_imam/issues)
- 📧 **Email**: Create an issue for contact

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes (for significant contributions)
- README acknowledgments section (optional)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Ai-Imam! Your efforts help make Islamic knowledge more accessible through technology. 🙏
