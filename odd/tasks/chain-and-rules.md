Objective: match the user's agent chain, add Brain, and settle contradictions between rules. Branch: feat/chain-and-rules.
Delivery: single-pr. Test runner: node --test.

## Specs

- S1. The diagram is the SDD chain: Spec writer, then Builder, then Seguridad, UX, UI and Código in parallel, then Approver. On a rejection, "Vuelve al builder."
- S2. "Mantener las 3 vías": Answer, FTD and SDD stay.
- S2b. Lane choice: "si cambialo así". SDD applies when several open decisions affect each other, or when the work is large, meaning it could not be resumed from the request and `git diff` alone. File and line counts never decide it.
- S3. Agent to model assignment: "era una propuesta, de momento no tenemos una asignación de agente => modelo". Agents use the session's model.
- S4. Brain: "sí es la carpeta docs con las convenciones y podemos usar engram si lo tenemos en ese sentido".
- S5. HTTP status: "en el caso de que devuelva, es un 201, pero de normal en acciones DDD el body está vacío. Es decir la response está vacía. Simplemente devuelves el código 200. El patch con body siempre será 204 y no devolvemos body realmente."
- S6. Pagination: "paginación haremos page, page size."
- S7. Payload conversion: "El type en payloads se añadirá en los objetos anidados."
- S8. Error status: "Código HTTP de un error lo decide el registro de error. Tendremos un error registry, exception registry y ya vamos a ir mapeando las excepciones de dominio a cada error HTTP. Si no se ejecuta una excepción personalizada, ahí ya se devolverá un desto por default, pero será desde el registro de errores."
- S9. Domain services: "Los domain service siempre van en domain, si no nos llamarían domain service."
- S10. Domain tests: "Los tests de dominios se hacen a través de un use case, siempre a través de un use case. Nunca hay tests de dominio en particular, salvo servicios que quieras probar porque serán un poquito más grandes, pero todo se prueba a través de un caso de uso utilizando los object models."
- S11. Object Mothers: "Los object models se crean junto al test, salvo los shared o lo que sea, que entonces van en test/shared."
- S12. Mapper: "El mapper lo dejaremos siempre en la raíz del pod."
- S13. Pod root: "La raíz de los pods siempre va a ir por pod name. En caso de que fuera containers sería containers pod name, pero podemos poner pods pod name." Assumption: the root is `pods/{pod-name}`.
- S14. Pod hooks: named functions in a separate hooks file, called `use{Something}`. Superseded on return shape by S15: "este ejemplo también se puede con estado? ... si se puede los prefiero así". Every hook, pod or global (L7), returns an object with named fields, also when it exposes state, for example `const { size, setSize } = useProductFilters();`. No tuples.
- S15. Casing: "pasamos todas las que estan en snake_case a camelCase. que me gusta más y siempre programo en ts." Assumption: this covers API fields and TypeScript. SQL tables and columns, environment variables, queue and event routing names, and Prometheus metrics keep their own convention. Event payload fields use camelCase (L6).

## Tasks

- [x] T1 S1-S4 chain, agents, Brain. Route: inline, no writer reason.
- [x] T2 S5-S15 unify the rules in the skills. Route: delegated, parallel unit and context backstop.
- [x] T3 S1-S15 independent verification. Risk: item 6, no test catches a change of meaning in prose.

## Log

- L1 (2026-11-03): The user's diagram, and the answers quoted in S1-S14. "object models" in the dictated text is read as Object Mothers.
- L2: Engram mirror pending: no Engram tool is available in this session.
- L3 (2026-11-03): "pon page_size sino" and "las demás estan bien". The response envelope uses `page_size`, and query parameters keep `pageSize`. The user approved: auth POSTs return 201, an unmapped exception returns 500 from the registry, framework HTTP exceptions keep their status, `CannotX` returns 403, and a pod hook that only exposes functions may return named functions.
- L4: T3 found 11 blockers, including a client example that read a PATCH response body, and the lost 201 rule for creation. All corrected, and rechecked only for these blockers. The validator now rejects retired conventions.
- L5 (2026-11-03): "pasamos todas las que estan en snake_case a camelCase. que me gusta más y siempre programo en ts. este ejemplo también se puede con estado? si se puede los prefiero así,"
- L6 (2026-11-03): "las colas si se almacenan con update_product_stats_on_payment_recorded solo que los payloads de dentro del evento iran en camelCase". S15 is refined: queue names keep snake_case, and event payload fields use camelCase.
- L7 (2026-11-03): "todos los hooks iguales". S14 now covers every hook, pod or global. A framework primitive such as `useState` keeps its own shape.
- L8 (2026-11-03): "Los test de use case son test UNITARIOS y replican la ubicación del caso de uso en /src dentro de /test y consta de el request-{use-case}.mother y el propio {use-case}.spec.ts para nest se habla de modules no? realmente si: bouded context tiene varios subcontext (submódulos) cada submódulo exporta su exception regitry. lo que pasa que al shared module de root solo llegan los shared de los bounded context (así tratamos los bd casi cómo monolitos modulares. DIgamos que los pods hacen: container -> hooks -> repository -> api (client) -> HTTP request -> render en component. 3. Me parece bien así. 4. Porque apuntan a bigschool? las quiero agnósticas realmente o con ejemplos dentro del mismo harness."
