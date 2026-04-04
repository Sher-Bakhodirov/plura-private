# Prisma Schema Documentation

> **Database:** MySQL · **Relation mode:** `prisma` (emulated foreign keys) · **Generated client output:** `src/generated/prisma`

---

## Table of Contents

- [Configuration](#configuration)
- [Enums](#enums)
  - [Role](#role)
  - [TriggerTypes](#triggertypes)
  - [ActionType](#actiontype)
  - [InvitationStatus](#invitationstatus)
  - [Plan](#plan)
  - [Icon](#icon)
- [Models](#models)
  - [User](#user)
  - [Agency](#agency)
  - [SubAccount](#subaccount)
  - [Permissions](#permissions)
  - [Tag](#tag)
  - [Pipeline](#pipeline)
  - [Lane](#lane)
  - [Ticket](#ticket)
  - [Notification](#notification)
  - [Trigger](#trigger)
  - [Automation](#automation)
  - [AutomationInstance](#automationinstance)
  - [Action](#action)
  - [Contact](#contact)
  - [Media](#media)
  - [Funnel](#funnel)
  - [ClassName](#classname)
  - [FunnelPage](#funnelpage)
  - [AgencySidebarOption](#agencysidebaroption)
  - [SubAccountSidebarOption](#subaccountsidebaroption)
  - [Invitation](#invitation)
  - [Subscription](#subscription)
  - [AddOns](#addons)
- [Relation Map](#relation-map)
- [Known Issues & Notes](#known-issues--notes)

---

## Configuration

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider     = "mysql"
  relationMode = "prisma"
}
```

| Setting | Value | Notes |
|---|---|---|
| Provider | `mysql` | MySQL-compatible database |
| Relation mode | `prisma` | FK constraints are emulated in Prisma, not enforced at the DB level. All FK scalar fields **must** have a manual `@@index`. |
| Client output | `src/generated/prisma` | Import from this path, **not** from `@prisma/client` |

> **Important:** Because `relationMode = "prisma"` is used, the database does not enforce referential integrity natively. Prisma handles this at the query layer. Every foreign key field used in a relation requires a manual `@@index` to avoid N+1 query degradation.

---

## Enums

### Role

Defines the access level of a user within the platform.

| Value | Description |
|---|---|
| `AGENCY_OWNER` | Full owner of an agency with unrestricted access |
| `AGENCY_ADMIN` | Admin-level user within an agency |
| `SUBACCOUNT_USER` | Regular user scoped to a sub-account |
| `SUBACCOUNT_GUEST` | Read-only or limited guest user within a sub-account |

---

### TriggerTypes

Defines the event types that can initiate an automation.

| Value | Description |
|---|---|
| `CONTACT_FORM` | Triggered when a contact form is submitted |

---

### ActionType

Defines the types of actions that can be executed within an automation.

| Value | Description |
|---|---|
| `CREATE_CONTACT` | Creates a new contact record |

---

### InvitationStatus

Tracks the lifecycle state of an agency invitation.

| Value | Description |
|---|---|
| `PENDING` | Invitation sent but not yet acted upon |
| `ACCEPTED` | Invitation was accepted by the recipient |
| `REVOKED` | Invitation was cancelled by the agency |

---

### Plan

Maps to Stripe price IDs for billing plans.

| Value | Description |
|---|---|
| `price_1OpACCFdfEv15JJwACWCyqW2` | Product 1 — Base Plan |
| `price_1OpACCFdfEv15JJw0k6lm8HC` | Product 2 — Unlimited Plan |

---

### Icon

A set of icon identifiers used for sidebar navigation options.

`settings` · `chart` · `calendar` · `check` · `chip` · `compass` · `database` · `flag` · `home` · `info` · `link` · `lock` · `messages` · `notification` · `payment` · `power` · `receipt` · `shield` · `star` · `tune` · `videorecorder` · `wallet` · `warning` · `headphone` · `send` · `pipelines` · `person` · `category` · `contact` · `clipboardIcon`

---

## Models

### User

Represents a platform user. A user can belong to an agency and can hold permissions across multiple sub-accounts.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `name` | `String` | — | Display name |
| `avatarUrl` | `String` | `@db.Text` | URL to the user's avatar image |
| `email` | `String` | `@unique` | Unique email address |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `role` | `Role` | `@default(SUBACCOUNT_USER)` | Access role |
| `agencyId` | `String?` | — | FK → `Agency.id` |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `agency` | `Agency` | Optional many-to-one |
| `Permissions` | `Permissions[]` | One-to-many |
| `Tickets` | `Ticket[]` | One-to-many |
| `Notifications` | `Notification[]` | One-to-many |

**Indexes:** `agencyId`

---

### Agency

The top-level entity. An agency owns sub-accounts, manages subscriptions, and has its own branding and settings.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `connectedAccountId` | `String?` | `@default("")` | Stripe Connect account ID |
| `customerId` | `String?` | `@default("")` | Stripe customer ID |
| `name` | `String` | — | Agency name |
| `agencyLogo` | `String` | `@db.Text` | Logo URL |
| `companyEmail` | `String` | `@db.Text` | Primary contact email |
| `whiteLabel` | `Boolean` | `@default(true)` | Whether white-labeling is enabled |
| `address` | `String` | — | Street address |
| `city` | `String` | — | City |
| `zipCode` | `String` | — | ZIP / postal code |
| `state` | `String` | — | State / region |
| `country` | `String` | — | Country |
| `goal` | `Int` | — | Agency goal metric (e.g. number of sub-accounts) |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `users` | `User[]` | One-to-many |
| `subAccount` | `SubAccount[]` | One-to-many |
| `sidebarOption` | `AgencySidebarOption[]` | One-to-many |
| `invitation` | `Invitation[]` | One-to-many |
| `notification` | `Notification[]` | One-to-many |
| `subscription` | `Subscription?` | One-to-one |
| `addOns` | `AddOns[]` | One-to-many |

---

### SubAccount

A client account owned by an agency. Most platform features (funnels, pipelines, automations, etc.) are scoped to a sub-account.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `connectedAccountId` | `String?` | `@default("")` | Stripe Connect account ID |
| `name` | `String` | — | Sub-account name |
| `subAccountLogo` | `String` | `@db.Text` | Logo URL |
| `companyEmail` | `String` | — | Contact email |
| `companyPhone` | `String` | — | Contact phone |
| `goal` | `Int` | `@default(5)` | Goal metric |
| `address` | `String` | — | Street address |
| `city` | `String` | — | City |
| `zipCode` | `String` | — | ZIP / postal code |
| `state` | `String` | — | State / region |
| `country` | `String` | — | Country |
| `agencyId` | `String` | — | FK → `Agency.id` |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `agency` | `Agency` | Required many-to-one |
| `sidebarOptions` | `SubAccountSidebarOption[]` | One-to-many |
| `permissions` | `Permissions[]` | One-to-many |
| `funnels` | `Funnel[]` | One-to-many |
| `media` | `Media[]` | One-to-many |
| `contacts` | `Contact[]` | One-to-many |
| `triggers` | `Trigger[]` | One-to-many |
| `automations` | `Automation[]` | One-to-many |
| `pipelines` | `Pipeline[]` | One-to-many |
| `tags` | `Tag[]` | One-to-many |
| `notifications` | `Notification[]` | One-to-many |

**Indexes:** `agencyId`

---

### Permissions

Controls which users have access to which sub-accounts.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `email` | `String` | — | FK → `User.email` |
| `subAccountId` | `String` | — | FK → `SubAccount.id` |
| `access` | `Boolean` | — | Whether access is granted |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `user` | `User` | Many-to-one (via `email`) |
| `subAccount` | `SubAccount` | Many-to-one |

**Indexes:** `subAccountId`, `email`

---

### Tag

A colored label that can be attached to tickets within a sub-account.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `name` | `String` | — | Tag label |
| `color` | `String` | — | Hex or named color |
| `subAccountId` | `String` | — | FK → `SubAccount.id` |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `subAccount` | `SubAccount` | Many-to-one |
| `tickets` | `Ticket[]` | One-to-many |

**Indexes:** `subAccountId`

---

### Pipeline

A sales or project pipeline belonging to a sub-account. Contains an ordered set of lanes.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `name` | `String` | — | Pipeline name |
| `subAccountId` | `String` | — | FK → `SubAccount.id` |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `lanes` | `Lane[]` | One-to-many |
| `subAccount` | `SubAccount` | Many-to-one |

**Indexes:** `subAccountId`

---

### Lane

A column (stage) within a pipeline. Contains tickets.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `name` | `String` | — | Lane name |
| `pipelineId` | `String` | — | FK → `Pipeline.id` |
| `order` | `Int` | `@default(0)` | Display order |
| `color` | `String` | — | Lane accent color |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `pipeline` | `Pipeline` | Many-to-one |
| `tickets` | `Ticket[]` | One-to-many |

**Indexes:** `pipelineId`

---

### Ticket

A task or deal card inside a lane. Can be assigned to a user, tagged, and have a monetary value.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `name` | `String` | — | Ticket title |
| `laneId` | `String` | — | FK → `Lane.id` |
| `order` | `Int` | `@default(0)` | Display order within the lane |
| `value` | `Decimal?` | — | Monetary value of the ticket |
| `description` | `String?` | — | Optional description |
| `customerId` | `String?` | — | Reference to an external customer (no formal relation) |
| `assignedUserId` | `String?` | — | Reference to an assigned user (no formal relation — see notes) |
| `userId` | `String?` | — | FK → `User.id` (the owning/assigned user relation) |
| `tagId` | `String?` | — | FK → `Tag.id` |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `lane` | `Lane` | Required many-to-one |
| `user` | `User?` | Optional many-to-one |
| `tag` | `Tag?` | Optional many-to-one |

**Indexes:** `laneId`, `userId`, `tagId`

> **Note:** `assignedUserId` and `customerId` are bare scalar fields with no Prisma relation defined. They appear to be placeholders for future relations or are handled at the application layer.

---

### Notification

An activity feed item that can be scoped to an agency or optionally to a specific sub-account.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `notification` | `String` | — | Notification message text |
| `agencyId` | `String` | — | FK → `Agency.id` |
| `subAccountId` | `String?` | — | FK → `SubAccount.id` (optional) |
| `userId` | `String` | — | FK → `User.id` |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `user` | `User` | Required many-to-one |
| `agency` | `Agency` | Required many-to-one |
| `subAccount` | `SubAccount?` | Optional many-to-one |

**Indexes:** `agencyId`, `subAccountId`, `userId`

---

### Trigger

An event condition that can start one or more automations within a sub-account.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `name` | `String` | — | Trigger name |
| `subAccountId` | `String` | — | FK → `SubAccount.id` |
| `type` | `TriggerTypes` | — | The event type |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `subAccount` | `SubAccount` | Required many-to-one |
| `automations` | `Automation[]` | One-to-many |

**Indexes:** `subAccountId`

---

### Automation

A workflow that is activated by a trigger and executes a sequence of actions.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `name` | `String` | — | Automation name |
| `triggerId` | `String?` | — | FK → `Trigger.id` |
| `published` | `Boolean` | `@default(false)` | Whether the automation is live |
| `subAccountId` | `String` | — | FK → `SubAccount.id` |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `trigger` | `Trigger?` | Optional many-to-one |
| `subAccount` | `SubAccount` | Required many-to-one |
| `actions` | `Action[]` | One-to-many |
| `automationInstances` | `AutomationInstance[]` | One-to-many |

**Indexes:** `triggerId`, `subAccountId`

---

### AutomationInstance

A runtime execution record of an automation. Tracks whether it is currently active.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `automationId` | `String` | — | FK → `Automation.id` |
| `active` | `Boolean` | `@default(false)` | Whether this instance is running |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `automation` | `Automation` | Required many-to-one |

**Indexes:** `automationId`

---

### Action

A single step in an automation workflow, executed in order.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `name` | `String` | — | Action name |
| `order` | `Int` | — | Execution order |
| `automationId` | `String` | — | FK → `Automation.id` |
| `laneId` | `String` | `@default("0")` | Reference lane ID (application-defined) |
| `type` | `ActionType` | — | The action type to perform |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `automation` | `Automation` | Required many-to-one |

**Indexes:** `automationId`

---

### Contact

A CRM contact belonging to a sub-account.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `name` | `String` | — | Contact full name |
| `email` | `String` | — | Contact email address |
| `subAccountId` | `String` | — | FK → `SubAccount.id` |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `subAccount` | `SubAccount` | Required many-to-one |

**Indexes:** `subAccountId`

---

### Media

A file or asset uploaded to a sub-account's media library.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `type` | `String?` | — | MIME type or media category |
| `name` | `String` | — | File name |
| `link` | `String` | `@unique` | Unique URL/path to the file |
| `subAccountId` | `String` | — | FK → `SubAccount.id` |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `subAccount` | `SubAccount` | Required many-to-one |

**Indexes:** `subAccountId`

---

### Funnel

A multi-page marketing funnel belonging to a sub-account. Can be published with a custom subdomain.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `name` | `String` | — | Funnel name |
| `description` | `String` | — | Short description |
| `published` | `Boolean` | `@default(false)` | Whether the funnel is publicly accessible |
| `subDomainName` | `String?` | `@unique` | Custom subdomain for this funnel |
| `favicon` | `String?` | `@db.Text` | Favicon URL |
| `subAccountId` | `String` | — | FK → `SubAccount.id` |
| `liveProducts` | `String?` | `@default("[]")` | JSON array of live product IDs |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `subAccount` | `SubAccount` | Required many-to-one |
| `funnelPages` | `FunnelPage[]` | One-to-many |
| `className` | `ClassName[]` | One-to-many |

**Indexes:** `subAccountId`

---

### ClassName

A named CSS class with custom styling data, scoped to a funnel (used by the funnel page builder).

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `name` | `String` | — | CSS class name |
| `color` | `String` | — | Associated color |
| `funnelId` | `String` | — | FK → `Funnel.id` |
| `customData` | `String?` | `@db.LongText` | Serialized custom style or data payload |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `funnel` | `Funnel` | Required many-to-one |

**Indexes:** `funnelId`

---

### FunnelPage

An individual page within a funnel. Stores page content as serialized JSON.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `name` | `String` | — | Page name |
| `pathName` | `String` | `@default("")` | URL path segment |
| `visits` | `Int` | `@default(0)` | Visit counter |
| `content` | `String?` | `@db.LongText` | Serialized page builder content (JSON) |
| `order` | `Int` | — | Page order within the funnel |
| `previewImage` | `String?` | `@db.Text` | Screenshot/preview image URL |
| `funnelId` | `String` | — | FK → `Funnel.id` |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `funnel` | `Funnel` | Required many-to-one |

**Indexes:** `funnelId`

---

### AgencySidebarOption

A navigation menu item displayed in the sidebar for an agency.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `name` | `String` | `@default("Menu")` | Menu item label |
| `link` | `String` | `@default("#")` | Navigation link |
| `icon` | `Icon` | `@default(info)` | Icon identifier |
| `agencyId` | `String` | — | FK → `Agency.id` |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `agency` | `Agency?` | Optional many-to-one |

**Indexes:** `agencyId`

---

### SubAccountSidebarOption

A navigation menu item displayed in the sidebar for a sub-account.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `name` | `String` | `@default("Menu")` | Menu item label |
| `link` | `String` | `@default("#")` | Navigation link |
| `subAccountId` | `String?` | — | FK → `SubAccount.id` |
| `icon` | `Icon` | `@default(info)` | Icon identifier |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `subAccount` | `SubAccount?` | Optional many-to-one |

**Indexes:** `subAccountId`

---

### Invitation

An email invitation sent to a user to join an agency with a specific role.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `email` | `String` | `@unique` | Invitee email (one active invitation per email) |
| `agencyId` | `String` | — | FK → `Agency.id` |
| `status` | `InvitationStatus` | `@default(PENDING)` | Current invitation state |
| `role` | `Role` | `@default(SUBACCOUNT_USER)` | Role granted upon acceptance |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `agency` | `Agency` | Required many-to-one |

**Indexes:** `agencyId`

---

### Subscription

Stripe subscription details linked to an agency. One agency can have at most one subscription.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `plan` | `Plan?` | — | The subscribed plan |
| `price` | `String?` | — | Human-readable price label |
| `active` | `Boolean` | `@default(false)` | Whether the subscription is active |
| `priceId` | `String` | — | Stripe price ID |
| `customerId` | `String` | — | Stripe customer ID |
| `currentPeriodEndDate` | `DateTime` | — | When the current billing period ends |
| `subscriptionId` | `String` | `@unique` | Stripe subscription ID |
| `agencyId` | `String?` | `@unique` | FK → `Agency.id` (one-to-one) |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `agency` | `Agency?` | Optional one-to-one |

**Indexes:** `customerId`

---

### AddOns

Optional feature add-ons that an agency can activate, linked to a Stripe price.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |
| `name` | `String` | — | Add-on name |
| `active` | `Boolean` | `@default(false)` | Whether the add-on is enabled |
| `priceId` | `String` | `@unique` | Stripe price ID |
| `agencyId` | `String?` | — | FK → `Agency.id` |

**Relations:**

| Relation field | Target | Type |
|---|---|---|
| `agency` | `Agency?` | Optional many-to-one |

**Indexes:** `agencyId`

---

## Relation Map

```
Agency
├── User[]
├── SubAccount[]
│   ├── Permissions[]
│   ├── Tag[]
│   │   └── Ticket[]
│   ├── Pipeline[]
│   │   └── Lane[]
│   │       └── Ticket[]
│   ├── Funnel[]
│   │   ├── FunnelPage[]
│   │   └── ClassName[]
│   ├── Media[]
│   ├── Contact[]
│   ├── Trigger[]
│   │   └── Automation[]
│   │       ├── Action[]
│   │       └── AutomationInstance[]
│   ├── Automation[]
│   ├── Notification[]
│   └── SubAccountSidebarOption[]
├── AgencySidebarOption[]
├── Invitation[]
├── Notification[]
├── Subscription (1-to-1)
└── AddOns[]
```

---

## Known Issues & Notes

### 1. `Ticket.assignedUserId` and `Ticket.customerId` have no formal relations

These two scalar fields exist on the `Ticket` model but are not wired to any Prisma relation. If they are meant to reference `User` or `Contact`, proper `@relation` directives and `@@index` entries should be added.

```prisma
// Current state — bare scalars with no relation
assignedUserId String?
customerId     String?
```

### 2. PrismaClient import path in `src/lib/db.ts`

The schema generates the client to `src/generated/prisma`, but `db.ts` imports from `@prisma/client`:

```ts
// db.ts — current (may not resolve correctly)
import { PrismaClient } from "@prisma/client";

// Should be:
import { PrismaClient } from "@/generated/prisma";
```

Update this import to match the `output` path in the generator block to avoid module resolution failures.

### 3. Model naming conventions (non-blocking)

Prisma's convention is singular model names. `Permissions` and `AddOns` are plural. This does not cause errors but affects the generated client API naming (e.g. `db.permissions` vs `db.permission`).

### 4. `Action.laneId` is a plain string, not a relation

`Action.laneId` defaults to `"0"` and has no `@relation`. It appears to be used as an application-level reference, not a true DB relation.
