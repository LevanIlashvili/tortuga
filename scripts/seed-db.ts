#!/usr/bin/env tsx

import { PrismaClient, UserRole, PropertyStatus, KycStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tortuga.com' },
    update: {},
    create: {
      email: 'admin@tortuga.com',
      role: UserRole.ADMIN,
      isActive: true,
      wallets: {
        create: {
          accountId: '0.0.123456',
          publicKey: '302a300506032b6570032100...',
        },
      },
    },
  });
  console.log('✅ Created admin user:', admin.email);

  const investor = await prisma.user.upsert({
    where: { email: 'investor@example.com' },
    update: {},
    create: {
      email: 'investor@example.com',
      role: UserRole.INVESTOR,
      isActive: true,
      wallets: {
        create: {
          accountId: '0.0.654321',
          publicKey: '302a300506032b6570032100...',
        },
      },
      kycApplication: {
        create: {
          status: KycStatus.APPROVED,
          fullName: 'John Doe',
          dateOfBirth: new Date('1990-01-01'),
          nationality: 'USA',
          address: '123 Main St',
          city: 'New York',
          postalCode: '10001',
          country: 'USA',
          idDocumentUrl: '/uploads/kyc/sample-id.pdf',
          proofOfAddressUrl: '/uploads/kyc/sample-proof.pdf',
          selfieUrl: '/uploads/kyc/sample-selfie.jpg',
          reviewedAt: new Date(),
          reviewedBy: admin.id,
        },
      },
    },
  });
  console.log('✅ Created investor user:', investor.email);

  const property = await prisma.property.upsert({
    where: { id: 'sample-property-1' },
    update: {},
    create: {
      id: 'sample-property-1',
      name: 'Luxury Apartment Complex - Miami Beach',
      description: 'Premium beachfront residential property with 120 units. Features include ocean views, resort-style amenities, and strong rental demand.',
      location: 'Miami Beach, FL',
      imageUrl: '/images/properties/miami-beach-apartment.jpg',
      totalValue: 5000000,
      bondYield: 8.5,
      maturityDate: new Date('2030-12-31'),
      minimumInvestment: 1000,
      tokenSupply: 5000,
      tokenPrice: 1000,
      tokensSold: 0,
      status: PropertyStatus.DRAFT,
    },
  });
  console.log('✅ Created sample property:', property.name);

  const property2 = await prisma.property.upsert({
    where: { id: 'sample-property-2' },
    update: {},
    create: {
      id: 'sample-property-2',
      name: 'Commercial Office Building - Austin',
      description: 'Class A office space in downtown Austin with major tech tenants. Long-term leases and stable cash flow.',
      location: 'Austin, TX',
      imageUrl: '/images/properties/austin-office.jpg',
      totalValue: 8000000,
      bondYield: 7.2,
      maturityDate: new Date('2031-06-30'),
      minimumInvestment: 500,
      tokenSupply: 16000,
      tokenPrice: 500,
      tokensSold: 0,
      status: PropertyStatus.DRAFT,
    },
  });
  console.log('✅ Created sample property:', property2.name);

  console.log('');
  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📋 Summary:');
  console.log(`   - Admin: ${admin.email}`);
  console.log(`   - Investor: ${investor.email} (KYC approved)`);
  console.log(`   - Properties: 2 sample properties created`);
  console.log('');
  console.log('🔐 Next steps:');
  console.log('   1. Run: pnpm hedera:setup (to create Hedera accounts and HCS topic)');
  console.log('   2. Deploy HTS tokens for properties via admin dashboard');
  console.log('   3. Start development server: pnpm dev');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
