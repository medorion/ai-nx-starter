---
trigger: model_decision
description: Applies to main entities and structure of the application
---

---

trigger: model_decision
description: Applies to main entities and structure of the application

---

# Product Entities & Rules

## Organization

- Top-level entity; end user always belongs to one organization.
- Contains default channel settings.
- An organization can have multiple apps.

## User

- Can belong to one or more organizations.

## Data (Snapshot)

- Belongs to only one organization.
- Snapshot is timestamped; present in all tables for tracking changes.
- Always work with the latest snapshot; previous snapshots cannot be used.
- Data can be used in communication events as variables or labels.
- Supports scoring system for calculating scores and phenotypes.

## System Services

- Background systems used by multiple entities.
- Capabilities:
  - Calculate scores, phenotypes, and labels
  - Calculate recommendations
  - Run phone and email validations

## App (Solution)

- Belongs to one organization.
- Contains channel settings (email, SMS, Facebook, Slack, etc.)
- Inherits organization settings unless overridden

## Content (App context)

- Belongs to one app.
- Contains external and internal templates (email, SMS, Facebook, Slack, etc.)
- Messages are sent through communication events; each message has its own configuration
- Messages can be labeled by scoring system labels or phenotype labels

## Message (App context)

- Belongs to one app.
- Sent to users through communication events
- Contains template, channel, and configuration
- Can be labeled by scoring system labels or phenotype labels

## Communication Event (App context)

- Belongs to one app
- Sends messages to users via predefined channels
- Configuration:
  - Scheduling message batches
  - Channels
  - Triggered by user or system actions
- Dashboard/Statistics:
  - Member funnel (e.g., invalid emails)
  - Channel-specific statistics

## Objectives (App context)

- Belongs to one app
- Used to track user progress based on predefined rules

## Users

- **Organization Root**: Developers/ops team; configure system services and data processes
- **Organization Admin (CSM)**: Configure content, messages, communication events, objectives, and apps
- **Organization Manager (End user)**: Mainly views statistics, communication events, objectives, and maybe scoring system
