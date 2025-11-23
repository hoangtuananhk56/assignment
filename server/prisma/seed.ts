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

    console.log('✅ Created customer role with permissions');

    console.log('\n📊 Seed Summary:');
    console.log(`   Admin Role ID: ${adminRole.id}`);
    console.log(`   Customer Role ID: ${customerRole.id}`);
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
