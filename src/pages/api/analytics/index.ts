/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
import { firestoreHelpers, db } from '@/lib/firebase';
import { ApiResponse, AnalyticsData } from '@/types';

// Mock analytics data for demo (Phase 3 implementation)
const generateMockAnalytics = (): AnalyticsData => {
  const now = new Date();
  const mockPrompts = [
    'Cyberpunk robot warrior',
    'Ethereal cosmic landscape',
    'Neon-lit futuristic city',
    'Abstract digital art',
    'Mystical forest creature',
    'Steampunk mechanical dragon',
    'Holographic butterfly',
    'Quantum particle visualization'
  ];

  const blockchains = ['ethereum', 'polygon', 'binance', 'avalanche', 'solana'];

  return {
    totalMints: Math.floor(Math.random() * 10000) + 5000,
    totalRevenue: Math.floor(Math.random() * 500000) + 100000,
    totalUsers: Math.floor(Math.random() * 5000) + 1000,
    popularPrompts: mockPrompts
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map(prompt => ({
        prompt,
        count: Math.floor(Math.random() * 500) + 50
      })),
    recentTransactions: Array.from({ length: 10 }, (_, i) => ({
      id: `tx_${i + 1}`,
      userId: `user_${Math.floor(Math.random() * 1000)}`,
      nftId: `nft_${Math.floor(Math.random() * 5000)}`,
      type: ['mint', 'transfer', 'sale'][Math.floor(Math.random() * 3)] as any,
      blockchain: blockchains[Math.floor(Math.random() * blockchains.length)],
      txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      amount: Math.floor(Math.random() * 1000) / 100,
      gasUsed: Math.floor(Math.random() * 100000) + 21000,
      gasPrice: Math.floor(Math.random() * 50) + 10,
      status: 'confirmed' as any,
      createdAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    })),
    blockchainStats: blockchains.map(blockchain => ({
      blockchain,
      count: Math.floor(Math.random() * 2000) + 100,
      volume: Math.floor(Math.random() * 100000) + 10000
    }))
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }

  try {
    // In production, this would aggregate real data from Firestore
    // For demo purposes, we'll mix some real data with mock data

    const [usersSnapshot, nftsSnapshot, transactionsSnapshot] = await Promise.all([
      db.collection('users').get(),
      db.collection('nfts').get(),
      db.collection('transactions').get()
    ]);

    // Generate analytics with some real counts
    const mockData = generateMockAnalytics();

    const analyticsData: AnalyticsData = {
      ...mockData,
      totalUsers: usersSnapshot.size || mockData.totalUsers,
      totalMints: nftsSnapshot.size || mockData.totalMints,
      // Mix real recent transactions with mock data if available
      recentTransactions: transactionsSnapshot.size > 0
        ? transactionsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .slice(0, 10) as any
        : mockData.recentTransactions
    };

    return res.status(200).json({
      success: true,
      data: analyticsData,
      message: 'Analytics data retrieved successfully'
    });

  } catch (error) {
    console.error('Analytics API Error:', error);

    // Fallback to mock data if database fails
    const fallbackData = generateMockAnalytics();

    return res.status(200).json({
      success: true,
      data: fallbackData,
      message: 'Analytics data retrieved (demo mode)'
    });
  }
}