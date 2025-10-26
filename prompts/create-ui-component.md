# Create UI Component Prompt

## Description
Generates an Angular component following project conventions and NG-ZORRO patterns.

## Prompt

```
Create an Angular component for [COMPONENT_PURPOSE]:

Component Specifications:
- Location: apps/web-ui/src/app/features/[feature]/[component-name]/
- Type: [list | form | detail | dashboard]
- Features needed: [list features]

Example Features:
- Data table with pagination
- Search/filter functionality
- Create/Edit forms
- Delete confirmation
- Loading states
- Error handling

Data Source:
- API Service: [ServiceName] from @ai-nx-starter/api-client
- DTO Type: [DtoName] from @ai-nx-starter/types

UI Requirements:
- Use NG-ZORRO components (nz-table, nz-form, nz-card, etc.)
- Follow the pattern in: [PATH_TO_SIMILAR_EXAMPLE]
- Implement reactive forms if form component
- Add proper TypeScript typing
- Use OnPush change detection strategy
- Add error handling with MessageService
- Add loading indicators

Styling:
- Use LESS for styles
- Follow existing theme from apps/web-ui/src/assets/styles/theme.less
- Use NG-ZORRO utility classes where possible
- Avoid inline styles

Files to generate:
1. [component-name].component.ts
2. [component-name].component.html
3. [component-name].component.less
4. [component-name].component.spec.ts (if requested)

After generation:
- Run: npm run build
- Fix any TypeScript errors
- Test the component manually
```

## Placeholders

- `[COMPONENT_PURPOSE]`: What the component does
- `[feature]`: Feature area (e.g., "backoffice", "examples")
- `[component-name]`: Kebab-case component name
- `[ServiceName]`: API service name
- `[DtoName]`: Data transfer object type
- `[PATH_TO_SIMILAR_EXAMPLE]`: Reference component path

## Expected Outcome

- Fully functional Angular component
- Proper typing and error handling
- NG-ZORRO styled UI
- Integrated with backend API

## Example Usage

```
Create an Angular component for displaying and managing products:

Component Specifications:
- Location: apps/web-ui/src/app/features/backoffice/products/product-list/
- Type: list
- Features needed:
  - Data table with pagination (10 items per page)
  - Search by name and category
  - Create/Edit/Delete actions
  - Loading states
  - Error handling

Data Source:
- API Service: ApiProductService from @ai-nx-starter/api-client
- DTO Type: ProductDto from @ai-nx-starter/types

UI Requirements:
- Use nz-table with pagination
- Use nz-input for search
- Use nz-button for actions
- Follow the pattern in: apps/web-ui/src/app/features/backoffice/users/components/users-list/

[... rest of the prompt ...]
```

## Time Estimate

With AI: 10-15 minutes
Without AI: 45-60 minutes
