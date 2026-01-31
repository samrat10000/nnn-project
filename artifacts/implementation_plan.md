# User Management System - Implementation Plan

## Goal
Build an ADMIN-only User Management page to create, view, edit, and delete users with role assignment.

## Current State
- Users can only be created via `/register` endpoint
- No UI to manage existing users
- No way for ADMIN to assign roles or manage team

## Target State
- **Users Page** (`/users`) - ADMIN-only
- List all users in table
- Create new users with role selection
- Edit user roles
- Delete users
- Role badges for visual identification

---

## Proposed Changes

### Backend

#### [MODIFY] [users.controller.ts](file:///c:/Users/cross/Downloads/NNN/backend/src/users/users.controller.ts)

Add new ADMIN-only endpoints:

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // NEW: List all users (ADMIN only)
    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    findAll() {
        return this.usersService.findAll();
    }

    // NEW: Create user (ADMIN only)
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    // NEW: Update user role (ADMIN only)
    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async updateRole(@Param('id') id: string, @Body() body: { role: UserRole }) {
        return this.usersService.updateRole(id, body.role);
    }

    // NEW: Delete user (ADMIN only)
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
```

---

#### [MODIFY] [users.service.ts](file:///c:/Users/cross/Downloads/NNN/backend/src/users/users.service.ts)

Add service methods:

```typescript
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    // NEW: Find all users (exclude passwords)
    async findAll(): Promise<User[]> {
        return this.userModel.find().select('-password').exec();
    }

    // NEW: Update user role
    async updateRole(id: string, role: UserRole): Promise<User> {
        return this.userModel
            .findByIdAndUpdate(id, { role }, { new: true })
            .select('-password')
            .exec();
    }

    // NEW: Delete user
    async remove(id: string): Promise<void> {
        await this.userModel.findByIdAndDelete(id).exec();
    }

    // Existing methods...
}
```

---

### Frontend

#### [NEW] [users/page.tsx](file:///c:/Users/cross/Downloads/NNN/frontend/src/app/(protected)/users/page.tsx)

Main Users management page:

**Features**:
- Table showing all users
- Columns: Name, Email, Role (with badge), Created Date, Actions
- "Add User" button (opens dialog)
- Edit/Delete buttons per row
- Role badges with different colors:
  - ADMIN: Blue
  - WAREHOUSE_WORKER: Green
  - VIEWER: Gray

**Permissions**: Only accessible by ADMIN (redirect non-admin users)

---

#### [NEW] [users/AddUserDialog.tsx](file:///c:/Users/cross/Downloads/NNN/frontend/src/app/(protected)/users/AddUserDialog.tsx)

Dialog to create new users:

**Form Fields**:
- Name (text, required)
- Email (email, required)
- Password (password, required)
- Role (dropdown: ADMIN/WAREHOUSE_WORKER/VIEWER, required)

**Validation**:
- Email must be valid format
- Password minimum 6 characters
- All fields required

**API**: `POST /users`

---

#### [NEW] [users/EditUserDialog.tsx](file:///c:/Users/cross/Downloads/NNN/frontend/src/app/(protected)/users/EditUserDialog.tsx)

Dialog to update user role:

**Features**:
- Show user name/email (read-only)
- Role dropdown (editable)
- Cannot edit your own role (prevent self-demotion)

**API**: `PATCH /users/:id`

---

### Component Structure

```
frontend/src/app/(protected)/users/
├── page.tsx              (Main user list)
├── AddUserDialog.tsx     (Create new user)
└── EditUserDialog.tsx    (Update user role)
```

---

## Implementation Steps

### Step 1: Backend - User Endpoints
1. Update `users.controller.ts` with ADMIN-only endpoints
2. Update `users.service.ts` with findAll, updateRole, remove methods
3. Add DTO for create user validation
4. Test endpoints with Postman

### Step 2: Frontend - Users Page
1. Create `users/page.tsx` with table layout
2. Fetch users from `GET /users`
3. Display user data with role badges
4. Add loading/error states

### Step 3: Frontend - Add User Dialog
1. Create `AddUserDialog.tsx` with form
2. Role selection dropdown
3. Form validation (email, password length)
4. Submit to `POST /users`

### Step 4: Frontend - Edit/Delete
1. Create `EditUserDialog.tsx`
2. Add Edit button (opens dialog)
3. Add Delete button with confirmation
4. Prevent editing own role

---

## UI Design

### Users Table

```
┌──────────────────────────────────────────────────────────────┐
│  Users                                    [+ Add User]        │
│  Manage team members and permissions                         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Team Members                                                 │
├──────────┬──────────────┬────────────┬─────────┬────────────┤
│ Name     │ Email        │ Role       │ Joined  │ Actions    │
├──────────┼──────────────┼────────────┼─────────┼────────────┤
│ John Doe │ john@ex.com  │ [ADMIN]    │ Jan 1   │ [Edit] [X] │
│ Jane S.  │ jane@ex.com  │ [WORKER]   │ Jan 15  │ [Edit] [X] │
│ Bob V.   │ bob@ex.com   │ [VIEWER]   │ Feb 1   │ [Edit] [X] │
└──────────┴──────────────┴────────────┴─────────┴────────────┘
```

### Role Badges

```tsx
// ADMIN - Blue
<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
    ADMIN
</span>

// WAREHOUSE_WORKER - Green
<span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
    WAREHOUSE_WORKER
</span>

// VIEWER - Gray
<span className="px-2 py-1 bg-zinc-100 text-zinc-800 rounded text-xs">
    VIEWER
</span>
```

---

## API Endpoints

### GET /users
**Response**:
```json
[
  {
    "_id": "65f...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "ADMIN",
    "createdAt": "2026-01-01T00:00:00Z"
  },
  ...
]
```

### POST /users
**Request**:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "WAREHOUSE_WORKER"
}
```

**Response**: 201 Created

### PATCH /users/:id
**Request**:
```json
{
  "role": "ADMIN"
}
```

**Response**:
```json
{
  "_id": "65f...",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "ADMIN"
}
```

### DELETE /users/:id
**Response**: 204 No Content

---

## Security Considerations

1. **Only ADMIN can access**: Use `@Roles(UserRole.ADMIN)` guard
2. **Cannot delete self**: Frontend check + backend validation
3. **Cannot edit own role**: Prevent self-demotion
4. **Passwords excluded**: Never return passwords in responses
5. **Email validation**: Backend validates unique emails

---

## Validation Rules

**Create User**:
- Name: Required, min 2 characters
- Email: Required, valid format, unique
- Password: Required, min 6 characters
- Role: Required, must be valid enum value

**Update Role**:
- Role: Required, must be valid enum value
- Cannot be self (userId !== currentUserId)

---

## Navigation Update

Add "Users" link to Navbar (ADMIN only):

```tsx
// In Navbar.tsx
{user?.role === 'ADMIN' && (
  <Link href="/users">Users</Link>
)}
```

---

## Edge Cases

1. **Empty user list**: Show "No users found" message
2. **Cannot delete last ADMIN**: Backend validation (at least 1 ADMIN required)
3. **Self-edit prevention**: Disable edit button for current user
4. **Duplicate email**: Show error message
5. **Long names/emails**: Truncate with ellipsis

---

## Testing Workflow

### Create User
1. Login as ADMIN
2. Navigate to `/users`
3. Click "Add User"
4. Fill form: Name, Email, Password, Role = WAREHOUSE_WORKER
5. Submit → Verify new user appears in table

### Edit User Role
1. Click Edit on any user (not yourself)
2. Change role from WAREHOUSE_WORKER to VIEWER
3. Save → Verify role badge updates

### Delete User
1. Click Delete on any user
2. Confirm deletion
3. Verify user removed from list

### Permission Check
1. Logout and login as WAREHOUSE_WORKER
2. Try to access `/users`
3. Should be redirected or show "Access Denied"

---

## Files to Create/Modify

**Backend** (2 files):
1. `backend/src/users/users.controller.ts` (modify)
2. `backend/src/users/users.service.ts` (modify)

**Frontend** (4 files):
1. `frontend/src/app/(protected)/users/page.tsx` (new)
2. `frontend/src/app/(protected)/users/AddUserDialog.tsx` (new)
3. `frontend/src/app/(protected)/users/EditUserDialog.tsx` (new)
4. `frontend/src/components/Navbar.tsx` (modify - add Users link)

**Total**: 6 files

---

## Success Criteria

✅ ADMIN can view all users  
✅ ADMIN can create new users with role selection  
✅ ADMIN can edit user roles  
✅ ADMIN can delete users (except self)  
✅ Non-ADMIN users cannot access Users page  
✅ Role badges display correctly  
✅ Cannot delete last ADMIN user  
✅ Passwords never exposed in responses  

---

## Estimated Time
- Backend: 15 minutes
- Frontend Users page: 20 minutes
- Add/Edit dialogs: 25 minutes
- Testing: 10 minutes

**Total**: ~70 minutes
