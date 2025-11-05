# Fix Build Errors Prompt

## Description

Debug and fix TypeScript compilation errors systematically.

## Prompt

```
I ran `npm run build` and got errors. Please help fix them:

Error Output:
[PASTE_ERROR_OUTPUT_HERE]

Instructions:
1. Analyze each error carefully
2. Explain the root cause
3. Provide the fix with exact file path and line number
4. Apply the fix
5. After each fix, verify with: npm run build
6. Continue until all errors are resolved

Common Issues to Check:
- Missing imports
- Type mismatches
- Undefined properties
- Circular dependencies
- Missing @ai-nx-starter/* package references
- Outdated API client (run: npm run gen-api-client if needed)

For each fix:
- Explain WHY the error occurred
- Show the corrected code
- Mention if similar errors might exist elsewhere
```

## Expected Outcome

- All TypeScript errors resolved
- Clean build: `npm run build` passes
- Explanation of what was fixed and why

## Example Usage

```
I ran `npm run build` and got errors:

Error Output:
```

apps/web-ui/src/app/features/products/product-list.component.ts:45:12 - error TS2339:
Property 'products$' does not exist on type 'ProductListComponent'.

45 this.products$.subscribe(data => {

````

apps/web-server/src/app/features/product/product.service.ts:23:5 - error TS2322:
Type 'ProductEntity' is not assignable to type 'ProductDto'.

23 return product;
~~~~~~

```

[... rest of the prompt ...]
```

## Time Estimate

With AI: 5-10 minutes
Without AI: 20-45 minutes (depending on error complexity)
````
