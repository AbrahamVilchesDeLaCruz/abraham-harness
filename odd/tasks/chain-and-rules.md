Objective: match the user's agent chain, add Brain, and settle contradictions between rules. Branch: feat/chain-and-rules.
Delivery: single-pr. Test runner: node --test.

## Specs

- S1. The diagram is the SDD chain: Spec writer, then Builder, then Seguridad, UX, UI and Código in parallel, then Approver. On a rejection, "Vuelve al builder."
- S2. "Mantener las 3 vías": Answer, FTD and SDD stay.
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
- S14. Pod hooks: "Haremos las funciones con nombre en el sentido de un archivo aparte que sea hooks y con el use, lo que sea, use tal tal tal. Claro si tienen que devolver estados o lo que sea, pues devolver a tu plus, claro." Assumption: "a tu plus" means a tuple, so pod hooks live in a separate hooks file, are named `use{Something}`, and return a tuple when they expose state.

## Tasks

- [x] T1 S1-S4 chain, agents, Brain. Route: inline, no writer reason.
- [ ] T2 S5-S14 unify the rules in the skills. Route: delegated, parallel unit and context backstop.
- [ ] T3 S1-S14 independent verification. Risk: item 6, no test catches a change of meaning in prose.

## Log

- L1 (2026-11-03): The user's diagram, and the answers quoted in S1-S14. "object models" in the dictated text is read as Object Mothers.
- L2: Engram mirror pending: no Engram tool is available in this session.
