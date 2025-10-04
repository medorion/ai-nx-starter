## Work flow example (CRUD operations) Ver 1

#### Generate

- Tell claude read product.md (We do it once in dev session)
- Build and test after each step
- Check if there are any errors
- Validate that you got what you asked for

- Tell claude run run npm run build after each step, to check if

1. Create Entity
   Create Dto First and ask claude to define entity, and db service in data-access-layer (use data-access-layer.md rules)
   (CRUD operations and additional actions, according to our needs) (use db-service.md rules)

2. Implement api , controller, service, mapper (use web-server.md rules)

3. Run generate client services (Auto generated service for each controller)

```
npm run gen-api-client
```

4. Implement feature on UI based on existing examples (apps/web-ui/src/app/features/examples)
   Identity and analyse existing examples and implement new feature based on them

Prompt:

```
Implement feature on UI based on existing examples (use web-ui rules)
```

5. Cleanup generated files

- Remove unused code from generated files (use cleanup.md rules)

```
npm run gen-api-client
```

## Work flow example (CRUD operations) Ver 2

0. Tell claude read product.md (We do it once in dev session)

1. Before dealing with any of packages, tell claude to analyze corresponding file from /Users/.windsurf/rules u.e. /Users/.windsurf/rules/web-server.md for web-server
