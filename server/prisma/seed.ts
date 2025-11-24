import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://admin:admin123@localhost:5432/myapp_db',
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin role with all permissions
    const adminRole = await prisma.role.upsert({
        where: { name: 'admin' },
        update: {},
        create: {
            name: 'admin',
            description: 'Administrator with full access',
            permissions: {
                create: [
                    // Users
                    { resource: 'users', action: 'create' },
                    { resource: 'users', action: 'read' },
                    { resource: 'users', action: 'update' },
                    { resource: 'users', action: 'delete' },
                    // Roles
                    { resource: 'roles', action: 'create' },
                    { resource: 'roles', action: 'read' },
                    { resource: 'roles', action: 'update' },
                    { resource: 'roles', action: 'delete' },
                    // Categories
                    { resource: 'categories', action: 'create' },
                    { resource: 'categories', action: 'read' },
                    { resource: 'categories', action: 'update' },
                    { resource: 'categories', action: 'delete' },
                    // Products
                    { resource: 'products', action: 'create' },
                    { resource: 'products', action: 'read' },
                    { resource: 'products', action: 'update' },
                    { resource: 'products', action: 'delete' },
                    // Orders
                    { resource: 'orders', action: 'create' },
                    { resource: 'orders', action: 'read' },
                    { resource: 'orders', action: 'update' },
                    { resource: 'orders', action: 'delete' },
                ],
            },
        },
    });

    console.log('✅ Created admin role with permissions');

    // Create customer role with limited permissions
    const customerRole = await prisma.role.upsert({
        where: { name: 'customer' },
        update: {},
        create: {
            name: 'customer',
            description: 'Customer with limited access',
            permissions: {
                create: [
                    // Products (read only)
                    { resource: 'products', action: 'read' },
                    // Categories (read only)
                    { resource: 'categories', action: 'read' },
                    // Cart (full access for own cart)
                    { resource: 'cart', action: 'create' },
                    { resource: 'cart', action: 'read' },
                    { resource: 'cart', action: 'update' },
                    { resource: 'cart', action: 'delete' },
                    // Orders (create and read own orders)
                    { resource: 'orders', action: 'create' },
                    { resource: 'orders', action: 'read' },
                    // Profile (read and update own profile)
                    { resource: 'profile', action: 'read' },
                    { resource: 'profile', action: 'update' },
                ],
            },
        },
    });

    // Create admin user
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            roleId: adminRole.id,
            roleName: 'admin',
        },
    });

    console.log('✅ Created admin user');

    // Create customer user
    const hashedCustomerPassword = await bcrypt.hash('Customer@123', 10);
    const customerUser = await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: {},
        create: {
            email: 'customer@example.com',
            password: hashedCustomerPassword,
            firstName: 'Customer',
            lastName: 'User',
            roleId: customerRole.id,
            roleName: 'customer',
        },
    });

    // Create sample categories
    const dentalCategory = await prisma.category.upsert({
        where: { name: 'Dental' },
        update: {},
        create: {
            name: 'Dental',
            description: 'Dental products and equipment',
        },
    });

    const cosmeticCategory = await prisma.category.upsert({
        where: { name: 'Cosmetic' },
        update: {},
        create: {
            name: 'Cosmetic',
            description: 'Cosmetic dentistry products',
        },
    });

    const accessoriesCategory = await prisma.category.upsert({
        where: { name: 'Accessories' },
        update: {},
        create: {
            name: 'Accessories',
            description: 'Dental accessories and tools',
        },
    });

    console.log('✅ Created categories');

    // Create sample products
    const products = [
        {
            name: 'Clear Aligner Kit',
            description: 'Professional clear aligner kit for orthodontic treatment',
            price: 299.99,
            stockQuantity: 50,
            categoryId: dentalCategory.id,
        },
        {
            name: 'Teeth Whitening System',
            description: 'Advanced LED teeth whitening system',
            price: 149.99,
            stockQuantity: 100,
            categoryId: cosmeticCategory.id,
        },
        {
            name: 'Digital Impression Scanner',
            description: 'High-precision digital impression scanner',
            price: 1299.99,
            stockQuantity: 10,
            categoryId: dentalCategory.id,
        },
        {
            name: 'Dental Cleaning Kit',
            description: 'Complete dental cleaning and maintenance kit',
            price: 79.99,
            stockQuantity: 200,
            categoryId: accessoriesCategory.id,
        },
        {
            name: 'Smile Design Software',
            description: 'Professional smile design and simulation software',
            price: 499.99,
            stockQuantity: 25,
            categoryId: cosmeticCategory.id,
        },
        {
            name: 'Orthodontic Brackets Set',
            description: 'Premium stainless steel orthodontic brackets',
            price: 189.99,
            stockQuantity: 75,
            categoryId: dentalCategory.id,
        },
        {
            name: 'Teeth Veneer Kit',
            description: 'Complete teeth veneer application kit',
            price: 599.99,
            stockQuantity: 30,
            categoryId: cosmeticCategory.id,
        },
        {
            name: 'Electric Toothbrush Pro',
            description: 'Professional electric toothbrush with smart timer',
            price: 129.99,
            stockQuantity: 150,
            categoryId: accessoriesCategory.id,
        },
        {
            name: 'Dental Microscope',
            description: 'High-resolution dental surgical microscope',
            price: 2499.99,
            stockQuantity: 5,
            categoryId: dentalCategory.id,
        },
        {
            name: 'Gum Contouring Laser',
            description: 'Precision laser for cosmetic gum contouring',
            price: 3999.99,
            stockQuantity: 3,
            categoryId: cosmeticCategory.id,
        },
    ];

    for (const productData of products) {
        const existing = await prisma.product.findFirst({
            where: { name: productData.name },
        });

        if (!existing) {
            await prisma.product.create({
                data: productData,
            });
        }
    }

    console.log('✅ Created sample products');
    console.log('\n✨ Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
