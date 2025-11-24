# E-Commerce Application

A full-stack e-commerce application built with React (Frontend) and NestJS (Backend), featuring product management, shopping cart, order processing, and role-based access control.

## Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [Database Seeding](#database-seeding)
- [Running Tests](#running-tests)
- [Prisma ERD](#prisma-erd)
- [API Documentation](#api-documentation)
- [Architecture Decisions](#architecture-decisions)
- [Assumptions & Trade-offs](#assumptions--trade-offs)

## Overview

This is a modern e-commerce platform with:
- User authentication and authorization
- Product catalog with categories
- Shopping cart functionality
- Order management with concurrency control
- Role-based permissions system
- Responsive UI with Tailwind CSS

## Technology Stack

### Backend
- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Testing:** Jest
- **Validation:** class-validator, class-transformer

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** React Hooks

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the server directory (use `env.example` as template):
   ```env
   DATABASE_URL="postgresql://admin:password@localhost:5432/ecommerce?schema=public"
   JWT_SECRET="your-secret-key-here"
   JWT_EXPIRES_IN="7d"
   PORT=3000
   ```

4. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database (optional):**
   ```bash
   npx prisma db seed
   ```

6. **Start the development server:**
   ```bash
   npm run start:dev
   ```

   The backend will be available at `http://localhost:3000`

7. **Run tests:**
   ```bash
   npm test
   ```

8. **Run tests with coverage:**
   ```bash
   npx jest --coverage
   ```

### Frontend Setup

1. **Navigate to app directory:**
   ```bash
   cd app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment (if needed):**
   The app is configured to connect to `http://localhost:3000/api/v1` by default.
   Update `app/constants.ts` if your backend runs on a different port.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

5. **Build for production:**
   ```bash
   npm run build
   ```

### Using Docker Compose (Recommended)

The easiest way to run the entire application stack is with Docker Compose:

#### Prerequisites
- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

#### Quick Start

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database (port 5432)
   - Backend server (port 3000)
   - Frontend app (port 5173)

2. **Check service status:**
   ```bash
   docker-compose ps
   ```

3. **View logs:**
   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f server
   docker-compose logs -f app
   ```

4. **Stop all services:**
   ```bash
   docker-compose down
   ```

5. **Stop and remove volumes (reset database):**
   ```bash
   docker-compose down -v
   ```

#### What Docker Compose Does

- **Builds** Docker images for frontend and backend
- **Creates** PostgreSQL database container
- **Runs** database migrations automatically
- **Seeds** the database with initial data
- **Starts** the backend server on http://localhost:3000
- **Starts** the frontend app on http://localhost:5173
- **Sets up** networking between containers

#### Access the Application

After running `docker-compose up -d`:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/v1
- Database: localhost:5432

Login with seeded credentials:
- Admin: admin@example.com / Admin123!
- Customer: customer@example.com / Customer123!

#### Rebuild Containers

If you make changes to Dockerfile or dependencies:

```bash
docker-compose up -d --build
```

## Database Seeding

**Important:** Before running the project, you must seed the database with initial data including roles, permissions, categories, and sample products.

### Seed Command

After running migrations, execute the seed script:

```bash
cd server
npx prisma db seed
```

### What Gets Seeded

The seed script creates:

1. **Roles:**
   - Admin (full access to all resources)
   - Customer (can view products, manage cart, place orders)

2. **Permissions:**
   - Resource-action pairs for each role (e.g., PRODUCT-CREATE, ORDER-READ)
   - Granular permissions for RBAC system

3. **Sample Users:**
   - Admin : `admin@example.com` / `Admin@123!`
   - Customer: `customer@example.com` / `Customer123!`

4. **Categories:**
   - Electronics
   - Clothing
   - Home & Garden
   - Books
   - Sports & Outdoors

5. **Sample Products:**
   - Multiple products in each category
   - Realistic prices and stock quantities
   - Product descriptions

### Reseed Database

If you need to reset and reseed the database:

```bash
cd server
npx prisma migrate reset
```

This command will:
- Drop the database
- Recreate it
- Run all migrations
- Automatically run the seed script

### Test Credentials

After seeding, you can login with these accounts:

| Role     | Email                    | Password      |
|----------|--------------------------|---------------|
| Admin    | admin@example.com        | Admin123!     |
| Customer | customer@example.com     | Customer123!  |

## Running Tests

The backend includes comprehensive unit tests for all service files with excellent coverage.

### Run All Tests

```bash
cd server
npm test
```

### Run Tests with Coverage Report

```bash
cd server
npx jest --coverage
```

### Test Results

The test suite includes:

- **Test Suites:** 9 passed
- **Total Tests:** 103 passed
- **Coverage:** ~92% for service files

### Test Coverage by Module

| Module          | Tests | Coverage | Description                                    |
|-----------------|-------|----------|------------------------------------------------|
| UserService     | 8     | 100%     | User CRUD, authentication, password hashing    |
| AuthService     | 4     | 100%     | Registration, login, JWT token generation      |
| CategoryService | 5     | 100%     | Category CRUD with pagination                  |
| ProductService  | 6     | 87.5%    | Product CRUD with filters (price, category)    |
| CartService     | 6     | 100%     | Shopping cart operations, totals calculation   |
| OrderService    | 20    | 100%     | Order creation with locking, status management |
| RoleService     | 8     | 100%     | Role CRUD, permissions management              |
| AppService      | 1     | 100%     | Basic health check                             |

### What's Tested

1. **Success Scenarios:**
   - CRUD operations for all entities
   - Pagination logic
   - Business logic (stock validation, price calculations)
   - Authentication and authorization flows

2. **Error Handling:**
   - Not Found exceptions
   - Bad Request exceptions (validation failures)
   - Conflict exceptions (duplicate entries)
   - Insufficient stock scenarios

3. **Edge Cases:**
   - Empty results
   - Invalid IDs
   - Concurrent order handling with row-level locking
   - Cart totals calculation

4. **Integration Points:**
   - Prisma database operations (mocked)
   - Password hashing with bcrypt
   - JWT token generation
   - Transaction handling

### Running Specific Test Files

```bash
# Test a specific service
npm test -- user.service.spec.ts
npm test -- order.service.spec.ts

# Test with watch mode
npm test -- --watch
```

### Test Structure

All tests follow the standard NestJS testing pattern:
- Using `@nestjs/testing` TestingModule
- Mocking Prisma service with Jest
- Testing both success and failure paths
- Validating proper error messages

## Prisma ERD

The database schema consists of the following entities and relationships:
View directly the schema via the Prisma studio

```bash
npx prisma studio
```

Then, enter the local link: [localhost:](http://localhost:51212/#view=schema)
![ERD Diagram](32co-erd.png)

### Key Relationships

1. **User → Role (Many-to-One)**
   - Each user belongs to one role
   - A role can be assigned to multiple users

2. **Role → Permission (One-to-Many)**
   - Each role can have multiple permissions
   - Permissions define resource-action pairs (e.g., PRODUCT-CREATE)

3. **User → Cart (One-to-One)**
   - Each user has one shopping cart
   - Cart persists across sessions

4. **Cart → CartItem (One-to-Many)**
   - A cart contains multiple cart items
   - Each cart item references a product and quantity

5. **User → Order (One-to-Many)**
   - A user can place multiple orders
   - Each order belongs to one user

6. **Order → OrderItem (One-to-Many)**
   - An order contains multiple order items
   - Order items capture product snapshot (price at time of order)

7. **Category → Product (One-to-Many)**
   - Products are organized into categories
   - Each product belongs to one category

8. **Product → CartItem/OrderItem (One-to-Many)**
   - Products can be in multiple carts and orders
   - Referential integrity maintained

### Database Constraints

- **Unique Constraints:** User email, Role name, Category name
- **Check Constraints:** `stockQuantity >= 0` (prevents negative stock)
- **Foreign Keys:** All relationships enforced with foreign key constraints
- **Indexes:** Primary keys, foreign keys, and unique constraints are indexed
- **Cascading:** Delete operations are controlled (e.g., deleting a category requires reassigning products)

### Order Status Flow

```
PENDING → PROCESSING → SHIPPED → DELIVERED
   ↓
CANCELLED (only from PENDING or PROCESSING)
```

## API Documentation

Base URL: `http://localhost:3000/api/v1/docs`

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin@123!",
  "name": "John Doe",
  "roleId": "role-id-here"
}

Response (201):
{
  "id": "admin-id",
  "email": "admin@example.com",
  "name": "John Doe",
  "roleName": "admin",
  "role": {
    "id": "role-id",
    "name": "admin"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin@123!"
}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "admin-id",
    "email": "admin@example.com",
    "name": "John Doe",
    "roleName":"admin",
    "role": {
      "id": "role-id",
      "name": "customer",
      "permissions": [...]
    }
  }
}
```

### Products

#### Get All Products
```http
GET /products?page=1&limit=10&categoryId=category-id&minPrice=10&maxPrice=100&search=laptop
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "product-id",
      "name": "Gaming Laptop",
      "description": "High-performance gaming laptop",
      "price": 1299.99,
      "stockQuantity": 15,
      "categoryId": "category-id",
      "category": {
        "id": "category-id",
        "name": "Electronics"
      },
      "createdAt": "2025-11-24T10:00:00.000Z",
      "updatedAt": "2025-11-24T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### Get Product by ID
```http
GET /products/{id}
Authorization: Bearer {token}

Response (200):
{
  "id": "product-id",
  "name": "Gaming Laptop",
  "description": "High-performance gaming laptop",
  "price": 1299.99,
  "stockQuantity": 15,
  "category": {
    "id": "category-id",
    "name": "Electronics"
  }
}
```

#### Create Product (Admin/Manager)
```http
POST /products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Gaming Laptop",
  "description": "High-performance gaming laptop",
  "price": 1299.99,
  "stockQuantity": 15,
  "categoryId": "category-id"
}

Response (201):
{
  "id": "product-id",
  "name": "Gaming Laptop",
  ...
}
```

#### Update Product (Admin/Manager)
```http
PATCH /products/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "price": 1199.99,
  "stockQuantity": 20
}

Response (200):
{
  "id": "product-id",
  "price": 1199.99,
  "stockQuantity": 20,
  ...
}
```

#### Delete Product (Admin)
```http
DELETE /products/{id}
Authorization: Bearer {token}

Response (200):
{
  "message": "Product deleted successfully"
}
```

### Categories

#### Get All Categories
```http
GET /categories?page=1&limit=10
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "category-id",
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "_count": {
        "products": 45
      }
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### Create Category (Admin/Manager)
```http
POST /categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}

Response (201):
{
  "id": "category-id",
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```

### Cart

#### Get Cart
```http
GET /cart
Authorization: Bearer {token}

Response (200):
{
  "id": "cart-id",
  "userId": "admin-id",
  "items": [
    {
      "id": "cart-item-id",
      "productId": "product-id",
      "quantity": 2,
      "product": {
        "id": "product-id",
        "name": "Gaming Laptop",
        "price": 1299.99,
        "stockQuantity": 15
      }
    }
  ],
  "itemCount": 2,
  "totalPrice": 2599.98
}
```

#### Add to Cart
```http
POST /cart/items
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product-id",
  "quantity": 2
}

Response (200):
{
  "id": "cart-id",
  "items": [...],
  "itemCount": 2,
  "totalPrice": 2599.98
}
```

#### Update Cart Item
```http
PATCH /cart/items/{productId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 3
}

Response (200):
{
  "id": "cart-id",
  "items": [...],
  "itemCount": 3,
  "totalPrice": 3899.97
}
```

#### Remove from Cart
```http
DELETE /cart/items/{productId}
Authorization: Bearer {token}

Response (200):
{
  "id": "cart-id",
  "items": [],
  "itemCount": 0,
  "totalPrice": 0
}
```

#### Clear Cart
```http
DELETE /cart
Authorization: Bearer {token}

Response (200):
{
  "message": "Cart cleared successfully"
}
```

### Orders

#### Create Order from Cart
```http
POST /orders/from-cart
Authorization: Bearer {token}

Response (201):
{
  "id": "order-id",
  "userId": "admin-id",
  "totalPrice": 2599.98,
  "status": "PENDING",
  "orderItems": [
    {
      "id": "order-item-id",
      "productId": "product-id",
      "quantity": 2,
      "price": 1299.99,
      "product": {
        "name": "Gaming Laptop"
      }
    }
  ],
  "createdAt": "2025-11-24T10:00:00.000Z"
}
```

#### Create Order Directly
```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "productId": "product-id",
      "quantity": 2
    }
  ]
}

Response (201):
{
  "id": "order-id",
  "totalPrice": 2599.98,
  "status": "PENDING",
  ...
}
```

#### Get All Orders (Admin)
```http
GET /orders?page=1&limit=10
Authorization: Bearer {token}

Response (200):
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### Get My Orders
```http
GET /orders/my-orders
Authorization: Bearer {token}

Response (200):
[
  {
    "id": "order-id",
    "totalPrice": 2599.98,
    "status": "PENDING",
    "orderItems": [...],
    "createdAt": "2025-11-24T10:00:00.000Z"
  }
]
```

#### Cancel Order
```http
PATCH /orders/{id}/cancel
Authorization: Bearer {token}

Response (200):
{
  "id": "order-id",
  "status": "CANCELLED",
  ...
}
```

### Users

#### Get All Users (Admin)
```http
GET /users?page=1&limit=10
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "user-id",
      "email": "customer@example.com",
      "name": "John Doe",
      "role": {
        "name": "customer"
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### Get User by ID (Admin)
```http
GET /users/{id}
Authorization: Bearer {token}

Response (200):
{
  "id": "admin-id",
  "email": "admin@example.com",
  "name": "John Doe",
  "role": {
    "id": "role-id",
    "name": "customer",
    "permissions": [...]
  }
}
```

#### Update User
```http
PATCH /users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}

Response (200):
{
  "id": "admin-id",
  "name": "Jane Doe",
  "email": "jane@example.com",
  ...
}
```

### Roles

#### Get All Roles (Admin)
```http
GET /roles?page=1&limit=10
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "role-id",
      "name": "admin",
      "description": "Administrator role",
      "permissions": [
        {
          "resource": "PRODUCT",
          "action": "CREATE"
        }
      ]
    }
  ],
  "meta": {...}
}
```

#### Add Permissions to Role (Admin)
```http
POST /roles/{id}/permissions
Authorization: Bearer {token}
Content-Type: application/json

{
  "permissions": [
    {
      "resource": "PRODUCT",
      "action": "CREATE"
    },
    {
      "resource": "PRODUCT",
      "action": "UPDATE"
    }
  ]
}

Response (200):
{
  "id": "role-id",
  "permissions": [...]
}
```

## Architecture Decisions

### Backend Architecture

#### 1. **Modular Structure (NestJS)**
- **Decision:** Used NestJS modular architecture with feature-based modules
- **Rationale:** 
  - Clear separation of concerns
  - Easy to scale and maintain
  - Built-in dependency injection
  - TypeScript-first approach with excellent tooling

#### 2. **Prisma ORM**
- **Decision:** Used Prisma as the ORM instead of TypeORM
- **Rationale:**
  - Type-safe database queries
  - Excellent migration tooling
  - Auto-generated TypeScript types
  - Better performance with optimized queries
  - Intuitive schema definition

#### 3. **JWT Authentication**
- **Decision:** Implemented JWT-based authentication with passport.js
- **Rationale:**
  - Stateless authentication (scalable)
  - Works well with REST APIs
  - Can be easily extended to support refresh tokens
  - Industry standard

#### 4. **Role-Based Access Control (RBAC)**
- **Decision:** Implemented granular permissions system with roles
- **Rationale:**
  - Flexible permission management
  - Can assign multiple permissions per role
  - Easy to extend with new resources/actions
  - Separation of authentication from authorization

#### 5. **Concurrent Order Handling**
- **Decision:** Implemented row-level locking with PostgreSQL `SELECT ... FOR UPDATE`
- **Rationale:**
  - Prevents race conditions when multiple users order the same low-stock item
  - Atomic stock updates ensure data consistency
  - Database-level constraint (`stockQuantity >= 0`) as safety net
  - Better than optimistic locking for high-contention scenarios

#### 6. **Entity Pattern**
- **Decision:** Used entity classes to transform Prisma models before sending to client
- **Rationale:**
  - Hide sensitive data (e.g., password hashes)
  - Consistent response formatting
  - Easy to add computed properties
  - Separation of database models from API contracts

#### 7. **Global Exception Filters**
- **Decision:** Implemented global HTTP exception filter
- **Rationale:**
  - Consistent error responses across all endpoints
  - Better error logging
  - Client-friendly error messages

### Frontend Architecture

#### 1. **React with TypeScript**
- **Decision:** Used React with TypeScript and functional components
- **Rationale:**
  - Type safety reduces bugs
  - Better IDE support
  - Self-documenting code
  - Hooks provide cleaner state management

#### 2. **Vite Build Tool**
- **Decision:** Used Vite instead of Create React App
- **Rationale:**
  - Significantly faster build times
  - Hot Module Replacement (HMR) is instant
  - Better development experience
  - Modern ESM-based approach

#### 3. **Tailwind CSS**
- **Decision:** Used Tailwind CSS for styling
- **Rationale:**
  - Utility-first approach speeds up development
  - Consistent design system
  - Small bundle size (purges unused styles)
  - No CSS naming conflicts

#### 4. **Component Structure**
- **Decision:** Screen-based component organization
- **Rationale:**
  - Clear navigation flow
  - Easy to understand application structure
  - Screens represent major application states

#### 5. **Axios for HTTP**
- **Decision:** Used Axios with interceptors
- **Rationale:**
  - Automatic JWT token injection
  - Request/response interceptors for error handling
  - Better API than native fetch
  - Easy to configure base URL and headers

#### 6. **Local Storage for Auth**
- **Decision:** Store JWT token and user data in localStorage
- **Rationale:**
  - Persists across browser sessions
  - Simple implementation
  - Suitable for this application's security requirements

## Assumptions & Trade-offs

### Assumptions

1. **Single Currency:**
   - Prices are in a single currency (USD assumed)
   - No multi-currency support needed

2. **Simple Inventory:**
   - Stock is managed at product level only
   - No warehouse/location-based inventory
   - No reserved stock (items locked during checkout)

3. **Order States:**
   - Orders have simple status flow: PENDING → PROCESSING → SHIPPED → DELIVERED
   - CANCELLED can happen from PENDING or PROCESSING
   - No partial fulfillment

4. **Payment Integration:**
   - No actual payment gateway integration
   - Orders are created without payment verification
   - Real-world app would need Stripe/PayPal integration

5. **User Roles:**
   - Three main roles: Admin, Manager, Customer
   - Permissions are pre-defined in seed data
   - No dynamic role creation from UI

6. **Email Verification:**
   - No email verification on registration
   - Production app should verify emails

7. **Product Images:**
   - No image upload functionality
   - Products would need image URLs or file upload in production

### Trade-offs

#### 1. **Row-Level Locking vs Optimistic Locking**
- **Chosen:** Row-level locking (pessimistic)
- **Trade-off:**
  - Better for high-contention scenarios (flash sales)
  - Guaranteed consistency
  - Slightly slower for low-contention cases
  - Holds database locks

#### 2. **JWT vs Session-Based Auth**
- **Chosen:** JWT tokens
- **Trade-off:**
  - Stateless (easier to scale horizontally)
  - Works well with microservices
  - Cannot invalidate tokens before expiry
  - Tokens can get large with many permissions
  - **Mitigation:** Short expiry times (7 days), could add refresh tokens

#### 3. **Monolithic vs Microservices**
- **Chosen:** Monolithic NestJS application
- **Trade-off:**
  - Simpler deployment
  - Easier development and debugging
  - Better for small-medium applications
  - Harder to scale individual components
  - All services share same database

#### 4. **Client-Side Routing vs Server-Side**
- **Chosen:** Client-side routing (single-page app)
- **Trade-off:**
  - Better user experience (no page reloads)
  - Faster navigation
  - Initial bundle size larger
  - SEO challenges (not critical for authenticated app)

#### 5. **Global State Management**
- **Chosen:** React Context + useState (no Redux/Zustand)
- **Trade-off:**
  - Simpler implementation
  - Less boilerplate code
  - Sufficient for application size
  - Would need refactoring if app grows significantly
  - No time-travel debugging

#### 6. **Validation Strategy**
- **Chosen:** Backend validation with class-validator
- **Trade-off:**
  - Security (never trust client)
  - Single source of truth
  - Could duplicate validation on frontend for UX
  - **Note:** Frontend has basic validation, backend is authoritative

#### 7. **Database Migrations**
- **Chosen:** Prisma migrations with version control
- **Trade-off:**
  - Trackable schema changes
  - Easy rollback
  - Team collaboration
  - Requires migration files to be committed
  - Need careful management in production

#### 8. **Testing Strategy**
- **Chosen:** Unit tests for services (103 tests, ~92% coverage)
- **Trade-off:**
  - Fast test execution
  - Easy to maintain
  - No E2E tests (would catch integration issues)
  - No frontend tests
  - **Future:** Add E2E tests with Playwright/Cypress

#### 9. **Error Handling**
- **Chosen:** Exception-based error handling
- **Trade-off:**
  - NestJS best practice
  - Clear error flow
  - Automatic HTTP status codes
  - Can make control flow harder to follow
  - **Mitigation:** Global exception filter for consistency

#### 10. **Pagination Implementation**
- **Chosen:** Offset-based pagination
- **Trade-off:**
  - Simple to implement
  - Easy to navigate to specific page
  - Performance degrades with large offsets
  - Inconsistent results if data changes during pagination
  - **Alternative:** Cursor-based for large datasets

## Project Structure

```
assignment/
├── server/                 # Backend (NestJS)
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   │   ├── auth/      # Authentication
│   │   │   ├── user/      # User management
│   │   │   ├── product/   # Product catalog
│   │   │   ├── category/  # Categories
│   │   │   ├── cart/      # Shopping cart
│   │   │   ├── order/     # Order processing
│   │   │   └── role/      # Roles & permissions
│   │   ├── common/        # Shared utilities
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   └── interceptors/
│   │   ├── config/        # Configuration
│   │   └── database/      # Prisma service
│   ├── prisma/            # Database schema & migrations
│   └── test/              # E2E tests
├── app/                   # Frontend (React)
│   ├── components/        # React components
│   │   ├── screens/       # Main screens
│   │   └── UI.tsx         # Shared UI components
│   ├── constants.ts       # API endpoints
│   └── types.ts           # TypeScript types
└── docker-compose.yml     # Docker configuration
```

## Security Considerations

1. **Password Hashing:** bcrypt with salt rounds (10)
2. **JWT Secrets:** Stored in environment variables
3. **SQL Injection:** Prevented by Prisma parameterized queries
4. **XSS Protection:** React escapes output by default
5. **CORS:** Configured for specific origins
6. **Input Validation:** class-validator on all DTOs
7. **Rate Limiting:** Should be added in production
8. **HTTPS:** Should be enforced in production

## Performance Optimizations

1. **Database Indexes:** Primary keys and foreign keys indexed
2. **Pagination:** Limits data transfer and memory usage
3. **Query Optimization:** Prisma `include` only when needed
4. **Bundle Size:** Vite tree-shaking and code splitting
5. **Caching:** Could add Redis for frequently accessed data

## Future Enhancements

1. **Payment Integration:** Stripe or PayPal
2. **Email Notifications:** Order confirmations, shipping updates
3. **Product Reviews & Ratings**
4. **Wishlist Functionality**
5. **Product Images:** File upload with cloud storage (S3, Cloudinary)
6. **Search Improvements:** Elasticsearch for better search
7. **Admin Dashboard:** Analytics and reporting
8. **Refresh Tokens:** More secure auth flow
9. **Rate Limiting:** Protect against abuse
10. **Logging:** Structured logging with Winston/Pino
11. **Monitoring:** Application monitoring (DataDog, New Relic)
12. **CI/CD Pipeline:** Automated testing and deployment

## License

This project is for demonstration purposes.

## Author

Built as a full-stack e-commerce demonstration project.
