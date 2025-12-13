# @mrsarac/auth

Unified authentication package for NeuraByte Labs projects.

## Features

- JWT verification with Logto JWKS
- Express middleware (auth + guest mode)
- React hooks (useAuth, useGuestMode)
- User sync utilities
- TypeScript support

## Installation

```bash
npm install @mrsarac/auth
```

## Quick Start

### Backend (Express)

```typescript
import { createAuthMiddleware } from '@mrsarac/auth/middleware';

const auth = createAuthMiddleware({
  endpoint: 'https://auth.neurabytelabs.com',
  audience: 'your-app-id'
});

app.use('/api/protected', auth);
```

### Frontend (React)

```tsx
import { LogtoProvider } from '@logto/react';
import { AuthProvider, useAuth } from '@mrsarac/auth/react';

function App() {
  return (
    <LogtoProvider config={logtoConfig}>
      <AuthProvider apiResource="https://api.example.com">
        <MyApp />
      </AuthProvider>
    </LogtoProvider>
  );
}

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  // ...
}
```

---

## Dogfooding Policy

> **"We eat our own cooking"** - NeuraByte Labs

This package actively uses NeuraByte Labs internal tools:

| Tool | Usage | Status |
|------|-------|--------|
| **Spinoza** | Developer experience sentiment tracking | Planned |
| **SUBSTANCE** | Release date predictions, feature prioritization | Planned |
| **@mrsarac/auth** | Self-testing (this package authenticates itself) | Active |

### Internal Feedback Loop

- [x] Self-testing active (dogfooding own auth)
- [ ] Spinoza DX sentiment tracking
- [ ] SUBSTANCE milestone predictions

### Why We Dogfood

1. **Quality**: We catch bugs before users do
2. **Credibility**: "We use it ourselves"
3. **Insight**: Internal use = better product
4. **Speed**: Faster feedback loop

> Standard: [README_DOGFOODING_STANDARD.md](https://github.com/mrsarac/mustafasarac-core/blob/main/docs/standards/README_DOGFOODING_STANDARD.md)

---

## License

MIT
