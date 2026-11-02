# client-api with React

The concept skill `client-api` defines the rules. This file holds the detail of the HTTP client and the schema validator.

- Schema validator: when a type is not known, use `unknown` and validate with Zod.

## Global API client

The HTTP client lives in `core/` and is imported from any pod:

```ts
// core/api/apiClient.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,  // for httpOnly cookies (refresh token)
});

// Auth interceptor — adds the access token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

## External Documentation

- [Axios — Docs](https://axios-http.com/docs/intro) — if the project uses Axios as its HTTP client

In the concept skill, `.{view}` means `.tsx` in this stack.
