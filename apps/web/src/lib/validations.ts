import { z } from 'zod';

export const hederaAccountIdSchema = z
  .string()
  .regex(/^0\.0\.\d+$/, 'Invalid Hedera account ID format (expected 0.0.XXXXX)');

export const emailSchema = z.string().email('Invalid email address');

export const connectWalletSchema = z.object({
  accountId: hederaAccountIdSchema,
  publicKey: z.string().optional(),
});

export const createPropertySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  location: z.string().min(3).max(200),
  imageUrl: z.string().url().optional(),
  totalValue: z.number().positive('Total value must be positive'),
  bondYield: z.number().min(0).max(100, 'Yield must be between 0 and 100'),
  maturityDate: z.string().datetime(),
  minimumInvestment: z.number().positive('Minimum investment must be positive'),
  tokenSupply: z.number().int().positive('Token supply must be a positive integer'),
  tokenPrice: z.number().positive('Token price must be positive'),
});

export const updatePropertySchema = createPropertySchema.partial();

export const createKycApplicationSchema = z.object({
  fullName: z.string().min(2).max(200),
  dateOfBirth: z.string().datetime(),
  nationality: z.string().min(2).max(100),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  postalCode: z.string().min(2).max(20),
  country: z.string().min(2).max(100),
  idDocumentUrl: z.string().url(),
  proofOfAddressUrl: z.string().url(),
  selfieUrl: z.string().url().optional(),
});

export const reviewKycSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionNote: z.string().optional(),
});

export const createOrderSchema = z.object({
  propertyId: z.string().cuid(),
  tokenQuantity: z.number().int().positive('Token quantity must be a positive integer'),
});

export const deployTokenSchema = z.object({
  propertyId: z.string().cuid(),
  tokenName: z.string().min(1).max(100),
  tokenSymbol: z.string().min(1).max(10).toUpperCase(),
});

export const grantKycSchema = z.object({
  userId: z.string().cuid(),
  tokenId: z.string().regex(/^0\.0\.\d+$/, 'Invalid token ID'),
});

export const mintTokensSchema = z.object({
  orderId: z.string().cuid(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const propertyFilterSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'SOLD_OUT', 'CLOSED']).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  location: z.string().optional(),
});
