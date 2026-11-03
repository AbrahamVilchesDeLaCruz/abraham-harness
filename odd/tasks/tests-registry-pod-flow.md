Objective: settle use case tests, exception registries in bounded contexts, and the pod data flow. Branch: feat/tests-registry-pod-flow.
Delivery: single-pr. Test runner: node --test.

## Specs

- S1. Use case tests: "Los test de use case son test UNITARIOS y replican la ubicación del caso de uso en /src dentro de /test y consta de el request-{use-case}.mother y el propio {use-case}.spec.ts"
- S2. Modules and registries: "bouded context tiene varios subcontext (submódulos) cada submódulo exporta su exception regitry. lo que pasa que al shared module de root solo llegan los shared de los bounded context (así tratamos los bd casi cómo monolitos modulares."
- S3. Pod flow: "los pods hacen: container -> hooks -> repository -> api (client) -> HTTP request -> render en component."
- S4. Assumption: the pod repository is `pods/{pod-name}/{pod-name}.repository.ts`, in the pod root next to the mapper. It calls the API client and returns ViewModels through the mapper. `api/` keeps only the raw model and HTTP calls.
- S5. Assumption: the Container consumes the hooks, and the Component only renders what it receives. Purely visual local state may stay in the Component, because the user did not change that rule.

## Tasks

- [ ] T1 S1-S5 apply to the skills. Route: delegated, context backstop.

## Log

- L1 (2026-11-03): The quotes in S1-S3.
- L2: Engram mirror pending: no Engram tool is available in this session.
