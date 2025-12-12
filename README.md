# @mrsarac/auth

Unified authentication package for Mustafa Sarac projects.

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
  endpoint: 'https://auth.mustafasarac.com',
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

## License

MIT
