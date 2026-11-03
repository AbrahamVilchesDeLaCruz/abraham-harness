# client-api with Vitest and MSW

The concept skill `client-api` defines the rules. This file names the tools.

- The mapper is a pure function — easy to test with Vitest.
- Mappers are unit tested as pure functions with Vitest. Containers are integration tested with MSW.
- The repository is unit tested with Vitest, with `vi.mock` on the pod's `api/{pod-name}.api.ts`.
