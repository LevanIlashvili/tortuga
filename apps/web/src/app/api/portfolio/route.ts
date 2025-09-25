import { NextRequest } from 'next/server';
import { prisma } from '@tortuga/database';
import { successResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';
import { getTokenBalances } from '@tortuga/hedera';

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      wallets: true,
      orders: {
        where: {
          status: {
            in: ['PAYMENT_RECEIVED', 'TOKENS_MINTED', 'COMPLETED'],
          },
        },
        include: {
          property: {
            include: {
              hederaToken: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      balances: {
        include: {
          property: {
            include: {
              hederaToken: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.wallets.length) {
    return successResponse({
      portfolio: [],
      totalValue: 0,
      totalTokens: 0,
    });
  }

  const primaryWallet = user.wallets[0];
  let hederaBalances: Array<{ tokenId: string; balance: string }> = [];

  try {
    hederaBalances = await getTokenBalances(primaryWallet.accountId);
  } catch (error) {
    console.error('Failed to fetch Hedera balances:', error);
  }

  const portfolioMap = new Map<string, any>();

  user.orders.forEach((order) => {
    if (!order.property.hederaToken) return;

    const tokenId = order.property.hederaToken.tokenId;
    if (!portfolioMap.has(order.property.id)) {
      portfolioMap.set(order.property.id, {
        propertyId: order.property.id,
        propertyName: order.property.name,
        location: order.property.location,
        imageUrl: order.property.imageUrl,
        tokenId: tokenId,
        tokenSymbol: order.property.hederaToken.tokenSymbol,
        tokenPrice: order.property.tokenPrice,
        bondYield: order.property.bondYield,
        totalTokens: 0,
        totalInvested: 0,
        currentValue: 0,
      });
    }

    const item = portfolioMap.get(order.property.id);
    item.totalTokens += order.tokenQuantity;
    item.totalInvested += Number(order.totalAmount);
  });

  hederaBalances.forEach((balance) => {
    portfolioMap.forEach((item) => {
      if (item.tokenId === balance.tokenId) {
        item.hederaBalance = balance.balance;
      }
    });
  });

  const portfolio = Array.from(portfolioMap.values()).map((item) => ({
    ...item,
    currentValue: item.totalTokens * Number(item.tokenPrice),
  }));

  const totalValue = portfolio.reduce((sum, item) => sum + item.currentValue, 0);
  const totalTokens = portfolio.reduce((sum, item) => sum + item.totalTokens, 0);

  return successResponse({
    portfolio,
    totalValue,
    totalTokens,
    totalInvested: portfolio.reduce((sum, item) => sum + item.totalInvested, 0),
  });
});
