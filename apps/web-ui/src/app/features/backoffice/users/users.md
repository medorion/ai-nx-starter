# Users Feature

**Location**: `apps/web-ui/src/app/features/backoffice/users`

## Overview

Complete CRUD implementation for managing user accounts in the backoffice application. Allows administrators to create, view, edit, and delete users with roles and permissions.

## Key Entities

- **User**: System user with authentication credentials
  - Properties: name, email, password, role, phone
  - Roles: Admin, User, Guest

## Components

- **users-list**: Displays users in a searchable, paginated table with edit/delete actions
- **user-form**: Handles both create and edit operations for users

## API Integration

- Uses `ApiUserService` from `@ai-nx-starter/api-client` (auto-generated)
- DTOs: `ClientUserDto`, `CreateUserDto`, `UpdateUserDto` from `@ai-nx-starter/types`
