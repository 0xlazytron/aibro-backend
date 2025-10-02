/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';

// Mock blockchain gas data
const blockchainGasData = {
  eth: {
    symbol: 'ETH',
    name: 'Ethereum',
    baseMintCost: 0.08,
    baseNetworkFee: 0.015,
    basePlatformFee: 0.0025,
    fluctuationRange: 0.3 // 30% fluctuation
  },
  polygon: {
    symbol: 'MATIC',
    name: 'Polygon',
    baseMintCost: 0.001,
    baseNetworkFee: 0.0002,
    basePlatformFee: 0.0001,
    fluctuationRange: 0.2
  },
  bsc: {
    symbol: 'BNB',
    name: 'Binance Smart Chain',
    baseMintCost: 0.005,
    baseNetworkFee: 0.001,
    basePlatformFee: 0.0005,
    fluctuationRange: 0.25
  },
  avalanche: {
    symbol: 'AVAX',
    name: 'Avalanche',
    baseMintCost: 0.01,
    baseNetworkFee: 0.002,
    basePlatformFee: 0.001,
    fluctuationRange: 0.2
  },
  solana: {
    symbol: 'SOL',
    name: 'Solana',
    baseMintCost: 0.00001,
    baseNetworkFee: 0.000005,
    basePlatformFee: 0.000002,
    fluctuationRange: 0.15
  }
};

// Function to apply random fluctuation to gas prices
function applyFluctuation(baseValue: number, fluctuationRange: number): number {
  const fluctuation = (Math.random() - 0.5) * 2 * fluctuationRange;
  return baseValue * (1 + fluctuation);
}

// Function to format price with appropriate decimal places
function formatPrice(value: number, symbol: string): string {
  if (symbol === 'SOL') {
    return value.toFixed(8);
  } else if (symbol === 'MATIC') {
    return value.toFixed(6);
  } else {
    return value.toFixed(6);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { blockchains, nftDetails } = req.body;

    if (!blockchains || !Array.isArray(blockchains)) {
      return res.status(400).json({ error: 'Blockchains array is required' });
    }

    const estimates: Record<string, any> = {};

    // Process each blockchain
    for (const blockchain of blockchains) {
      const chainData = blockchainGasData[blockchain as keyof typeof blockchainGasData];

      if (!chainData) {
        continue; // Skip unsupported blockchains
      }

      // Calculate gas costs with fluctuation
      const mintFee = applyFluctuation(chainData.baseMintCost, chainData.fluctuationRange);
      const networkFee = applyFluctuation(chainData.baseNetworkFee, chainData.fluctuationRange);
      const platformFee = applyFluctuation(chainData.basePlatformFee, chainData.fluctuationRange);

      // Apply complexity multipliers based on NFT details
      let complexityMultiplier = 1;
      if (nftDetails?.royaltyPercent > 0) {
        complexityMultiplier += 0.1; // 10% increase for royalties
      }
      if (nftDetails?.maxSupply > 1) {
        complexityMultiplier += 0.05; // 5% increase for multiple supply
      }

      const finalMintFee = mintFee * complexityMultiplier;
      const finalNetworkFee = networkFee * complexityMultiplier;
      const finalPlatformFee = platformFee;

      // Store estimate for this blockchain
      estimates[blockchain] = {
        mint: `${finalMintFee.toFixed(8)} ${chainData.symbol}`,
        network: `${finalNetworkFee.toFixed(8)} ${chainData.symbol}`,
        platform: `${finalPlatformFee.toFixed(8)} ${chainData.symbol}`
      };
    }

    // Simulate network delay for gas estimation
    await new Promise(resolve => setTimeout(resolve, 800));

    return res.status(200).json({
      success: true,
      estimates: estimates
    });

  } catch (error) {
    console.error('Gas estimation API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to estimate gas costs'
    });
  }
}

// Mock USD rates for different cryptocurrencies
function getUSDRate(symbol: string): number {
  const mockRates = {
    'ETH': 2400,
    'MATIC': 0.85,
    'BNB': 310,
    'AVAX': 35,
    'SOL': 95
  };

  return mockRates[symbol as keyof typeof mockRates] || 1;
}