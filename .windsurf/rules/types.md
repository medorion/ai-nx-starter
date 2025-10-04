---
trigger: model_decision
description: Applies only to packages/types
---

---

trigger: model_decision
description: Applies only to packages/types

---

# Types Package Rules


This package is shared between serber and client
- MUST NOT include server or client specific reference/code

## File Organization

- **Constants** must be placed in the `constants` folder.
- **Enums** must be placed in the `enum` folder.
- **DTOs** must be placed in the `dto` folder.
- Multiple DTOs for the same entity must be placed in a corresponding subfolder, e.g., `types/dto/todo-item.dto.ts`.

## Naming Conventions

- All DTO files MUST end with `.dto.ts`.
- All DTO classes MUST end with Dto

## Validation

- Use **class-validator** to annotate and describe fields in DTOs for validation and clarity.