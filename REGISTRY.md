# Creating Your Own Photon MCP Registry

Want to create your own registry of Photon MCPs? It's simple! Just create a GitHub repository with `.photon.ts` files.

## 📁 Repository Structure

```
my-mcps/
├── auth.photon.ts           # Your custom MCP
├── database.photon.ts       # Another MCP
├── api-client.photon.ts     # More MCPs...
├── README.md                # Documentation
└── LICENSE                  # Your license
```

**That's it!** No special configuration files needed.

## 🚀 Quick Start

### 1. Create GitHub Repository

```bash
mkdir my-mcps
cd my-mcps
git init
```

### 2. Add Your MCPs

Create `.photon.ts` files following the Photon MCP format:

```typescript
/**
 * My Custom Auth MCP
 *
 * Description of what this MCP does.
 *
 * @version 1.0.0
 * @author Your Name
 * @license MIT
 *
 * @dependencies jsonwebtoken@^9.0.0
 */

export default class Auth {
  constructor(private secret: string) {
    if (!secret) {
      throw new Error('JWT secret is required');
    }
  }

  async onInitialize() {
    console.error('[auth] ✅ Initialized');
  }

  /**
   * Generate JWT token
   * @param payload Token payload
   * @param expiresIn Expiration time (default: "1h")
   */
  async generateToken(params: { payload: any; expiresIn?: string }) {
    // Implementation...
    return { success: true, token: "..." };
  }

  /**
   * Verify JWT token
   * @param token Token to verify
   */
  async verifyToken(params: { token: string }) {
    // Implementation...
    return { success: true, payload: {} };
  }
}
```

### 3. Push to GitHub

```bash
git add .
git commit -m "feat: initial MCPs"
git branch -M main
git remote add origin https://github.com/yourusername/my-mcps.git
git push -u origin main
```

### 4. Users Add Your Registry

Users can now add your registry with a single command:

```bash
# Using shorthand
photon registry:add yourusername/my-mcps

# Or full URL
photon registry:add https://github.com/yourusername/my-mcps

# Install your MCPs
photon install auth
photon install database
```

## ✅ MCP Requirements

Each `.photon.ts` file should:

### 1. **Export Default Class**
```typescript
export default class MyMCP { }
```

### 2. **Include Version Tag**
```typescript
/**
 * @version 1.0.0
 */
```

### 3. **Document Tools with JSDoc**
```typescript
/**
 * Tool description
 * @param param1 Parameter description
 * @param param2 Another parameter
 */
async myTool(params: { param1: string; param2?: number }) { }
```

### 4. **List Dependencies**
```typescript
/**
 * @dependencies package-name@^1.0.0
 * @dependencies another-package@^2.0.0
 */
```

### 5. **Return Structured Responses**
```typescript
return {
  success: true,
  data: { ... }
};
// or
return {
  success: false,
  error: "Error message"
};
```

### 6. **Use Constructor for Configuration**
```typescript
constructor(
  private apiKey: string,
  private host?: string
) { }
```

## 📝 Best Practices

### Versioning

Use semantic versioning in `@version` tags:

```typescript
/**
 * @version 1.0.0   // Initial release
 * @version 1.1.0   // New features (backward compatible)
 * @version 2.0.0   // Breaking changes
 */
```

When users run `photon upgrade`, Photon:
1. Reads local `@version` tag
2. Fetches latest from your GitHub repo
3. Compares versions
4. Auto-updates if newer version available

### Documentation

Include comprehensive README with:

```markdown
# My MCPs

Production-ready Photon MCPs for [your use case].

## Installation

\`\`\`bash
photon registry:add yourusername/my-mcps
photon install auth
\`\`\`

## MCPs

### Auth
- `generateToken` - Generate JWT token
- `verifyToken` - Verify JWT token

**Configuration:**
\`\`\`bash
export AUTH_SECRET="your-secret-key"
photon auth
\`\`\`

### Database
...
```

### Error Handling

Always return structured errors:

```typescript
try {
  // Operation...
  return { success: true, data };
} catch (error: any) {
  return { success: false, error: error.message };
}
```

### Testing

Test your MCPs before sharing:

```bash
# Local development
cd /path/to/my-mcps
photon auth.photon.ts --dev

# Test with Claude Desktop
photon auth --config
# Add to Claude Desktop and test
```

## 🔄 Updating Your MCPs

When you update an MCP:

1. **Bump version in `@version` tag**
```typescript
/**
 * @version 1.1.0  // Was 1.0.0
 */
```

2. **Commit and push to GitHub**
```bash
git add .
git commit -m "feat: add new features"
git push
```

3. **Users automatically get updates**
```bash
photon upgrade --check  # Shows: auth: 1.0.0 → 1.1.0 (update available)
photon upgrade          # Auto-downloads latest version
```

## 🌟 Real-World Examples

### Company MCPs

```bash
# Structure
acme-corp/mcps/
├── acme-auth.photon.ts       # Company SSO
├── acme-database.photon.ts   # Internal DB access
├── acme-api.photon.ts        # Company API wrapper
└── README.md

# Usage
photon registry:add acme-corp/mcps
photon install acme-auth
```

### Community MCPs

```bash
# Structure
awesome-mcps/registry/
├── aws-s3.photon.ts
├── stripe-payments.photon.ts
├── sendgrid-email.photon.ts
└── README.md

# Usage
photon registry:add awesome-mcps/registry
photon install aws-s3
```

### Personal MCPs

```bash
# Structure
myusername/photon-mcps/
├── my-notes.photon.ts        # Personal note-taking
├── my-snippets.photon.ts     # Code snippets
└── README.md

# Usage
photon registry:add myusername/photon-mcps
photon install my-notes
```

## 🔒 Private Registries

For private GitHub repos, users need authentication:

```bash
# Users configure GitHub token
git config --global credential.helper store

# Or use SSH
photon registry:add git@github.com:company/private-mcps.git
```

**Note:** Currently only public repos are fully supported. Private repo support coming soon.

## 📊 Registry Discovery

Optional: Create an `index.json` file for better discovery:

```json
{
  "name": "my-mcps",
  "description": "Custom MCPs for [purpose]",
  "author": "Your Name",
  "mcps": [
    "auth",
    "database",
    "api-client"
  ]
}
```

This allows future features like `photon registry:browse yourusername/my-mcps`.

## 💡 Tips

1. **Keep MCPs focused** - One MCP = One service/API
2. **Use descriptive names** - `github-issues` not `gh-i`
3. **Document everything** - JSDoc for every tool
4. **Test thoroughly** - Ensure tools work before pushing
5. **Version consistently** - Follow semver
6. **Handle errors gracefully** - Always return `success: false` with `error` message

## 🤝 Contributing to Official Registry

Want to add your MCP to the official Photons registry?

1. Fork [portel-dev/photons](https://github.com/portel-dev/photons)
2. Add your `.photon.ts` file
3. Update README.md
4. Submit Pull Request

We review and merge high-quality, well-documented MCPs!

## 📚 Resources

- **Photon Framework:** https://github.com/portel-dev/photon
- **Official Registry:** https://github.com/portel-dev/photons
- **MCP Skill:** https://github.com/portel-dev/photon-skill
- **Examples:** See files in this repo

---

Happy MCP building! 🚀
