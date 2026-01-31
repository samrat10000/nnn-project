# Mini Inventory Management System - Complete Build Walkthrough

**Project**: Enterprise-Grade Full-Stack Inventory System  
**Stack**: NestJS (Backend) + Next.js (Frontend) + MongoDB + TypeScript  
**Build Duration**: 9 Phases from MVP to Enterprise  
**Date Completed**: January 31, 2026

---

## 🎯 Executive Summary

We built a complete **warehouse management system** from scratch, evolving from a simple CRUD app to an enterprise-grade platform with:
- ✅ JWT Authentication with Refresh Tokens
- ✅ Role-Based + Permission-Based Access Control
- ✅ Material & Stock Management (Warehouse Model)
- ✅ Automatic token refresh (invisible to users)
- ✅ Modern, responsive UI with navigation

---

## 📋 Phase-by-Phase Breakdown

### Phase 0: Project Initialization
**Goal**: Bootstrap the full-stack application

**Backend Setup**:
- Created NestJS project structure
- Configured TypeScript & ESLint
- Set up `src/` folder structure (modules, controllers, services)

**Frontend Setup**:
- Created Next.js 14 project with App Router
- Installed shadcn/ui component library
- Configured Tailwind CSS with custom theme

**Files Created**:
- `backend/src/main.ts` - Application entry point
- `backend/src/app.module.ts` - Root module
- `frontend/src/app/layout.tsx` - Root layout
- `frontend/src/app/page.tsx` - Landing page

---

### Phase 1: Database Configuration
**Goal**: Connect MongoDB and prepare for data persistence

**Changes**:
- Created `DatabaseModule` with Mongoose integration
- Added `.env` configuration for MongoDB URI
- Configured environment variable validation

**Files Created**:
- `backend/src/database/database.module.ts`
- `backend/.env` (MongoDB connection string, JWT secret)

**Key Decision**: Used MongoDB Atlas for cloud database hosting

---

### Phase 2: Users Module (Base)
**Goal**: Create the User model and basic CRUD operations

**Backend Changes**:
- Created `UserSchema` with Mongoose decorators
  - Fields: `name`, `email`, `password`, `role` (enum: USER/ADMIN)
  - Timestamps enabled
- Built `UsersService` with `create()` and `findOneByEmail()`
- Created `UsersController` (placeholder for future endpoints)

**Files Created**:
- `backend/src/users/schemas/user.schema.ts`
- `backend/src/users/users.service.ts`
- `backend/src/users/users.controller.ts`
- `backend/src/users/users.module.ts`

---

### Phase 3: Authentication (Auth Module)
**Goal**: Implement JWT-based authentication with role guards

**Backend Changes**:
- Created `AuthService` with:
  - `validateUser()` - bcrypt password comparison
  - `login()` - JWT token generation
  - `register()` - User creation with hashed passwords
- Implemented `JwtStrategy` for Passport authentication
- Created `JwtAuthGuard` - Protects routes requiring authentication
- Created `RolesGuard` - Enforces role-based access (ADMIN vs USER)
- Created `@Roles()` decorator for endpoint-level permissions

**Frontend Changes**:
- Created `AuthContext` for global authentication state
- Built Login page (`/login`) with form validation
- Built Register page (`/register`)
- Implemented client-side JWT storage in `localStorage`

**Files Created**:
Backend:
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.module.ts`
- `backend/src/auth/jwt.strategy.ts`
- `backend/src/auth/guards/jwt-auth.guard.ts`
- `backend/src/common/guards/roles.guard.ts`
- `backend/src/common/decorators/roles.decorator.ts`

Frontend:
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/app/(auth)/login/page.tsx`
- `frontend/src/app/(auth)/register/page.tsx`
- `frontend/src/lib/api/client.ts` (Axios instance with auth headers)

**Security Features**:
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens signed with secret from `.env`
- CORS enabled for frontend communication

---

### Phase 4: Inventory Management (Basic CRUD)
**Goal**: Build the core inventory system

**Backend Changes**:
- Created `InventorySchema`:
  - Fields: `name`, `quantity`, `price`
- Built `InventoryService` with full CRUD:
  - `create()`, `findAll()`, `findOne()`, `delete()`
- Protected endpoints with `@UseGuards(JwtAuthGuard)`
- Admin-only operations: `@Roles(UserRole.ADMIN)` for POST/DELETE

**Files Created**:
- `backend/src/inventory/schemas/inventory.schema.ts`
- `backend/src/inventory/inventory.service.ts`
- `backend/src/inventory/inventory.controller.ts`
- `backend/src/inventory/inventory.module.ts`

**API Endpoints**:
- `GET /inventory` - List all items (authenticated users)
- `GET /inventory/:id` - Get single item
- `POST /inventory` - Create item (ADMIN only)
- `DELETE /inventory/:id` - Delete item (ADMIN only)

---

### Phase 5: Frontend Foundation
**Goal**: Build the dashboard UI

**Frontend Changes**:
- Created Dashboard page (`/dashboard`)
- Built `AddItemDialog` component (modal for creating inventory)
- Used shadcn/ui components: Card, Table, Dialog, Button
- Implemented form validation with `react-hook-form` + `zod`
- Added loading states and error handling

**Files Created**:
- `frontend/src/app/(protected)/dashboard/page.tsx`
- `frontend/src/app/(protected)/dashboard/AddItemDialog.tsx`

**UI Features**:
- Minimalist "Japanese art" aesthetic
- Responsive table layout
- Real-time data fetching from backend
- Admin-only "Add Item" button (conditional rendering based on role)

---

### Phase 6: Frontend Integration
**Goal**: Complete the authentication flow and protected routes

**Frontend Changes**:
- Integrated JWT decoding in Login/Register pages
- Added route protection (redirect to `/login` if not authenticated)
- Connected Dashboard to live backend API
- Implemented automatic `Authorization` header injection in Axios

**Fixes Applied**:
- Updated `login()` calls to decode JWT and extract user `role`
- Fixed token passing in `AuthContext`

---

### Phase 7: Inventory CRUD Completion
**Goal**: Add Update and Delete functionality

**Backend Changes**:
- Added `update()` method to `InventoryService`
- Created `PATCH /inventory/:id` endpoint (ADMIN only)
- Confirmed `DELETE /inventory/:id` was functional

**Frontend Changes**:
- Created `EditItemDialog` component
- Added "Actions" column to inventory table (ADMIN only)
- Added Edit (Pencil icon) and Delete (Trash icon) buttons
- Implemented delete confirmation prompt
- Connected Edit dialog to `PATCH` endpoint

**Files Created/Modified**:
- `frontend/src/app/(protected)/dashboard/EditItemDialog.tsx`
- Modified `dashboard/page.tsx` to include Edit/Delete UI

---

### Phase 8: Advanced Authentication
**Goal**: Implement Refresh Tokens and Granular Permissions

**Backend Changes**:
1. **Refresh Token Strategy**:
   - Updated `UserSchema` to include:
     - `permissions: string[]` - Array of permission strings
     - `refreshTokenHash: string` - Hashed refresh token storage
   - Modified `AuthService.login()` to:
     - Generate Access Token (15 min expiry)
     - Generate Refresh Token (7 day expiry)
     - Hash and save refresh token to database
   - Created `AuthService.refresh()`:
     - Validates refresh token
     - Checks hash match in database
     - Issues new Access + Refresh tokens
   - Created `AuthService.logout()` - Clears refresh token hash

2. **Granular Permissions**:
   - Created `@Permissions()` decorator
   - Created `PermissionsGuard` to check permissions array
   - Applied to inventory endpoints:
     - `inventory.create` permission
     - `inventory.update` permission
     - `inventory.delete` permission

**Frontend Changes**:
- Updated `AuthContext.login()` to accept `refreshToken` parameter
- Modified `client.ts` to add **Response Interceptor**:
  - Catches 401 errors
  - Calls `/auth/refresh` automatically
  - Retries original request with new token
  - Logs out user if refresh fails
- Updated Login/Register pages to store refresh token

**Files Created**:
Backend:
- `backend/src/common/decorators/permissions.decorator.ts`
- `backend/src/common/guards/permissions.guard.ts`

Modified:
- `backend/src/users/schemas/user.schema.ts`
- `backend/src/users/users.service.ts` (added `update()` and `findById()`)
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/auth.controller.ts` (added `/refresh` and `/logout`)
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/lib/api/client.ts`

**Security Upgrade**:
- Users stay logged in seamlessly (refresh happens in background)
- Short access tokens minimize attack surface (15 min)
- Refresh tokens can be revoked (deleted from DB)

---

### Phase 9: Advanced Domain Modeling (Warehouse Upgrade)
**Goal**: Split simple "Inventory" into professional "Material" + "Stock" model

**Backend Changes**:
1. **Material Schema** (Product Definitions):
   - Fields: `name`, `description`, `type` (RAW/FINISHED)
   - Embedded `Dimensions` object (length, width, height, unit)
   - `weight` field (in kg)
   
2. **Stock Schema** (Physical Inventory):
   - Reference to Material (`materialId`)
   - Fields: `quantity`, `location`, `batchNumber`, `serialNumber`, `expiryDate`
   
3. **Services & Controllers**:
   - `MaterialService` with full CRUD
   - `StockService` with CRUD + `findByMaterial()` method
   - `MaterialController` with permission guards (`material.create`, etc.)
   - `StockController` with permission guards (`stock.create`, etc.)

**Frontend Changes**:
1. **Navigation**:
   - Created `Navbar` component (top navigation bar)
   - Added links: Dashboard | Materials | Stock
   - Created `(protected)/layout.tsx` - Shared layout with navbar

2. **Materials Page**:
   - Created `/materials` route
   - Built `AddMaterialDialog` with form for:
     - Material name, type, dimensions (L×W×H)
   - Table view of all material definitions

3. **UI Cleanup**:
   - Removed redundant headers from Dashboard
   - Applied consistent layout across all protected pages

**Files Created**:
Backend:
- `backend/src/inventory/schemas/material.schema.ts`
- `backend/src/inventory/schemas/stock.schema.ts`
- `backend/src/inventory/material.service.ts`
- `backend/src/inventory/material.controller.ts`
- `backend/src/inventory/stock.service.ts`
- `backend/src/inventory/stock.controller.ts`

Frontend:
- `frontend/src/components/Navbar.tsx`
- `frontend/src/app/(protected)/layout.tsx`
- `frontend/src/app/(protected)/materials/page.tsx`
- `frontend/src/app/(protected)/materials/AddMaterialDialog.tsx`

**API Endpoints Added**:
- `GET/POST /materials` - Material CRUD
- `GET/POST /stocks` - Stock CRUD
- `GET /stocks/material/:materialId` - Get all stock for a material

---

## 🏗️ Final Architecture

### Backend Structure
```
backend/src/
├── main.ts
├── app.module.ts
├── database/
│   └── database.module.ts
├── users/
│   ├── schemas/user.schema.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   └── users.module.ts
├── auth/
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   └── guards/jwt-auth.guard.ts
├── inventory/
│   ├── schemas/
│   │   ├── inventory.schema.ts
│   │   ├── material.schema.ts
│   │   └── stock.schema.ts
│   ├── inventory.service.ts
│   ├── inventory.controller.ts
│   ├── material.service.ts
│   ├── material.controller.ts
│   ├── stock.service.ts
│   ├── stock.controller.ts
│   └── inventory.module.ts
└── common/
    ├── guards/
    │   ├── roles.guard.ts
    │   └── permissions.guard.ts
    └── decorators/
        ├── roles.decorator.ts
        └── permissions.decorator.ts
```

### Frontend Structure
```
frontend/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (protected)/
│       ├── layout.tsx
│       ├── dashboard/
│       │   ├── page.tsx
│       │   ├── AddItemDialog.tsx
│       │   └── EditItemDialog.tsx
│       └── materials/
│           ├── page.tsx
│           └── AddMaterialDialog.tsx
├── components/
│   ├── ui/ (shadcn components)
│   └── Navbar.tsx
├── context/
│   └── AuthContext.tsx
└── lib/
    └── api/client.ts
```

---

## 🔐 Security Features Implemented

1. **Authentication**:
   - JWT-based authentication
   - Password hashing with bcrypt (10 rounds)
   - Secure token storage (localStorage with refresh mechanism)

2. **Authorization**:
   - Role-Based Access Control (RBAC): ADMIN vs USER
   - Permission-Based Access Control (PBAC): Granular permissions
   - Route guards on both backend and frontend

3. **Session Management**:
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Automatic token refresh (transparent to user)
   - Database-backed token revocation

4. **API Security**:
   - All inventory operations require authentication
   - Write operations (POST/PATCH/DELETE) require ADMIN role
   - CORS configured for frontend access

---

## 📊 Database Schema

### Users Collection
```typescript
{
  name: string,
  email: string (unique),
  password: string (hashed),
  role: 'USER' | 'ADMIN',
  permissions: string[],
  refreshTokenHash: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Inventory Collection (Legacy)
```typescript
{
  name: string,
  quantity: number,
  price: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Materials Collection
```typescript
{
  name: string (unique),
  description: string,
  type: string, // 'RAW', 'FINISHED'
  dimensions: {
    length: number,
    width: number,
    height: number,
    unit: string // default: 'cm'
  },
  weight: number, // kg
  createdAt: Date,
  updatedAt: Date
}
```

### Stocks Collection
```typescript
{
  materialId: ObjectId (ref: Material),
  quantity: number,
  location: string, // e.g., "A1-B2"
  batchNumber: string,
  serialNumber: string,
  expiryDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 How to Run

### Prerequisites
- Node.js v18+
- MongoDB instance (local or Atlas)
- npm or yarn

### Environment Setup
Create `backend/.env`:
```env
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-super-secret-key
```

### Start Backend
```bash
cd backend
npm install
npm run start:dev
# Server runs on http://localhost:3000
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3001
```

---

## 🎨 UI/UX Highlights

- **Minimalist Design**: Japanese art-inspired aesthetics
- **Responsive Layout**: Works on all screen sizes
- **Dark Mode Ready**: Clean color palette with zinc grays
- **Loading States**: Spinner animations during data fetch
- **Modal Dialogs**: shadcn/ui Dialog for forms
- **Icon System**: Lucide React icons throughout
- **Form Validation**: Zod schemas with react-hook-form

---

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: NestJS 10
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js + JWT
- **Validation**: class-validator, class-transformer
- **Password**: bcrypt

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3
- **Components**: shadcn/ui
- **Forms**: react-hook-form + zod
- **HTTP Client**: Axios
- **Icons**: Lucide React

---

## 📈 Future Enhancements (Final Roadmap)

- ✅ Stock Management UI (Implemented)
- ✅ Multi-Role Enforcement (Implemented)
- ✅ User Management System (Implemented)
- [ ] Low Stock Alerts & Expiry Warnings (Backend ready, Frontend badge pending)
- [ ] Batch tracking and barcode integration
- [ ] Advanced reporting and PDF/CSV export
- [ ] Real-time updates with WebSockets

---

### Phase 10: Dashboard Analytics Hub (New)
**Goal**: Transform the dashboard into a data-driven overview.

**Changes**:
- Added **Summary Cards** for total materials, unique stock items, and locations.
- **Stock by Material** table with auto-aggregation.
- Quick navigation links for warehouse operations.

---

### Phase 11: Multi-Role Permission System (New)
**Goal**: Implement industry-standard access control.

**Roles**:
- **ADMIN**: Unrestricted access.
- **WAREHOUSE_WORKER**: Manage physical stock, view-only for materials.
- **VIEWER**: Audit-only read access.

---

### Phase 12: User Management System (New)
**Goal**: Administrative interface for team management.

**Features**:
- ADMIN page to list, create, edit roles, and delete users.
- Role-specific badges and UI restrictions.
- Self-protection logic (cannot delete your own account).

---

## ✅ Final Testing Checklist

- [x] User Registration & Login
- [x] JWT Access & Refresh Token Flow
- [x] Role-Based Access Control (Admin/Worker/Viewer)
- [x] Material Catalog CRUD
- [x] Physical Stock Management (Add/Edit/Delete)
- [x] Dashboard Analytics & Aggregation
- [x] User Management (Admin only)
- [x] Automatic Token Refresh on expiry

---

## 📝 Key Learnings

1. **Scalable Modeling**: Distinguishing between Product Definitions (Materials) and Physical Instances (Stock) is essential for inventory accuracy.
2. **Security Hierarchies**: Permission guards should exist on both Backend (enforcement) and Frontend (UX).
3. **Admin Tooling**: High-quality internal tools (User Management) are as vital as the core inventory features.

---

**Project Status**: ✅ **Enterprise-Ready Mini WMS**  
**Final Build Date**: February 1, 2026

---

*Built with ❤️ using modern TypeScript, NestJS, and Next.js*
