# Role & Permission System Implementation

## Overview
The application now uses a database-backed role and permission system instead of hardcoded enums. This allows for flexible, granular access control where permissions can be dynamically managed.

## Database Schema

### Role Model
```prisma
model Role {
  id          String       @id @default(uuid())
  name        String       @unique
  description String?
  permissions Permission[]
  users       User[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}
```

### Permission Model
```prisma
model Permission {
  id       String @id @default(uuid())
  resource String // e.g., "user", "product", "order"
  action   String // e.g., "create", "read", "update", "delete"
  roleId   String
  role     Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([roleId, resource, action])
  @@index([roleId, resource])
}
```

### User Model
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  firstName String?
  lastName  String?
  roleId    String
  role      Role     @relation(fields: [roleId], references: [id])
  // ... other fields
}
```

## Seeded Roles & Permissions

### Admin Role
Full CRUD access to all resources:
- **Users**: create, read, update, delete
- **Roles**: create, read, update, delete
- **Categories**: create, read, update, delete
- **Products**: create, read, update, delete
- **Orders**: read, update

Total: 14 permissions

### Customer Role
Limited access for customer operations:
- **Products**: read
- **Categories**: read
- **Cart**: create, read, update, delete
- **Orders**: create, read

Total: 10 permissions

## API Endpoints

### Role Management (Admin Only)
All role endpoints require admin authentication.

#### Create Role
```http
POST /api/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "moderator",
  "description": "Moderator role with limited permissions"
}
```

#### Get All Roles
```http
GET /api/role
Authorization: Bearer <admin-token>
```

Response includes permissions for each role.

#### Get Single Role
```http
GET /api/role/:id
Authorization: Bearer <admin-token>
```

#### Update Role
```http
PATCH /api/role/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "super-moderator",
  "description": "Updated description"
}
```

#### Delete Role
```http
DELETE /api/role/:id
Authorization: Bearer <admin-token>
```

#### Add Permissions to Role
```http
POST /api/role/:id/permissions
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "permissions": [
    { "resource": "product", "action": "create" },
    { "resource": "product", "action": "update" }
  ]
}
```

#### Remove Permission from Role
```http
DELETE /api/role/:roleId/permissions/:permissionId
Authorization: Bearer <admin-token>
```

## User Registration & Assignment

### Default Role Assignment
When a new user registers (without specifying a role), they are automatically assigned the **customer** role.

### Admin Assignment
To create an admin user, the roleId must be specified during user creation. This can only be done:
1. By an existing admin user
2. Or directly in the database

### Example: Register as Customer
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```
Automatically gets customer role.

### Example: Create Admin User (Admin Only)
```http
POST /api/user
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123",
  "firstName": "Admin",
  "lastName": "User",
  "roleId": "<admin-role-id>"
}
```

## Guards & Authorization

### RolesGuard
The `@Roles()` decorator checks if the user's role name matches the required roles:

```typescript
@Roles('admin')
@Get()
findAll() {
  return this.roleService.findAll();
}
```

The guard verifies: `user.role.name === 'admin'`

### JWT Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Public Endpoints
Use `@Public()` decorator to bypass authentication:
```typescript
@Public()
@Post('register')
register(@Body() registerDto: RegisterDto) {
  return this.authService.register(registerDto);
}
```

## Running the Seed Script

To populate the database with initial roles and permissions:

```bash
npx prisma db seed
```

Or use npm script:
```bash
npm run seed
```

This creates:
- Admin role with ID (stored in database)
- Customer role with ID (stored in database)
- All associated permissions

## Checking Roles in Database

### Using Prisma Studio
```bash
npx prisma studio
```
Navigate to http://localhost:5555 to view and edit roles, permissions, and users.

### Using SQL
```sql
-- View all roles
SELECT * FROM "Role";

-- View all permissions
SELECT * FROM "Permission";

-- View role with permissions
SELECT r.*, p.resource, p.action 
FROM "Role" r
LEFT JOIN "Permission" p ON p."roleId" = r.id
WHERE r.name = 'admin';

-- View user with role
SELECT u.email, u."firstName", r.name as role
FROM "User" u
LEFT JOIN "Role" r ON r.id = u."roleId";
```

## Permission Format

Permissions follow the pattern:
```
resource:action
```

Examples:
- `user:create` - Can create users
- `product:read` - Can view products
- `order:update` - Can update orders
- `category:delete` - Can delete categories

## Migration History

1. **Initial Schema**: Used `UserRole` enum (customer, admin)
2. **Current Schema**: Separate `Role` and `Permission` tables with many-to-many relationship
3. **Migration**: `20251123082626_add_role_permission_tables`

## Best Practices

1. **Never hardcode role IDs** - Always query by role name
2. **Seed on deployment** - Run seed script in production to ensure roles exist
3. **Cascade delete** - Permissions are automatically deleted when a role is deleted
4. **Unique constraints** - Each role can only have one permission per resource+action combination
5. **Include role relation** - Always include role when querying users to get role information

## Future Enhancements

1. **Permission-based guards**: Create guards that check specific permissions instead of just role names
2. **Role hierarchy**: Implement role inheritance (e.g., admin inherits all customer permissions)
3. **User-specific permissions**: Allow permissions to be assigned directly to users
4. **Audit logging**: Track who creates/modifies roles and permissions
5. **Permission caching**: Cache user permissions for better performance
