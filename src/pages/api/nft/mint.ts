/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';

// Mock Firebase functions (replace with actual Firebase when configured)
const mockFirebaseStore = {
  collection: (name: string) => ({
    add: async (data: any) => {
      // Simulate Firebase delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock document ID
      const docId = `nft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log(`Mock Firebase: Storing in ${name} collection:`, data);

      return {
        id: docId,
        data: () => data
      };
    }
  })
};

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
    const {
      nftData,
      blockchain,
      walletAddress,
      transactionHash,
      gasEstimate
    } = req.body;

    // Validate required fields
    if (!nftData || !blockchain || !walletAddress) {
      return res.status(400).json({
        error: 'Missing required fields: nftData, blockchain, walletAddress'
      });
    }

    // Simulate blockchain transaction verification delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Prepare NFT document for storage
    const nftDocument = {
      // NFT Metadata
      name: nftData.name || 'Untitled NFT',
      description: nftData.description || '',
      imageUrl: nftData.imageUrl,
      prompt: nftData.prompt,
      styleValues: nftData.styleValues,

      // Blockchain Data
      blockchain,
      walletAddress,
      transactionHash: transactionHash || `0x${Math.random().toString(16).substr(2, 64)}`,

      // Minting Details
      royaltyPercent: nftData.royaltyPercent || 0,
      maxSupply: nftData.maxSupply || 1,
      currentSupply: 1,

      // Gas Information
      gasUsed: gasEstimate,

      // Timestamps
      createdAt: new Date().toISOString(),
      mintedAt: new Date().toISOString(),

      // Status
      status: 'minted',
      verified: true,

      // Additional Metadata
      metadata: {
        width: 512,
        height: 512,
        format: 'JPEG',
        generatedBy: 'AI-NFT-Studio',
        version: '1.0'
      }
    };

    // Store in mock Firebase
    const docRef = await mockFirebaseStore.collection('nfts').add(nftDocument);

    // Generate OpenSea-style metadata URL
    const metadataUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003'}/api/nft/metadata/${docRef.id}`;

    // Generate shareable link
    const shareableLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5173'}/nft/${docRef.id}`;

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        nftId: docRef.id,
        transactionHash: nftDocument.transactionHash,
        blockchain,
        walletAddress,
        metadataUrl,
        shareableLink,
        mintedAt: nftDocument.mintedAt,
        gasUsed: gasEstimate,
        nft: {
          name: nftDocument.name,
          description: nftDocument.description,
          imageUrl: nftDocument.imageUrl,
          royaltyPercent: nftDocument.royaltyPercent,
          maxSupply: nftDocument.maxSupply
        }
      }
    });

  } catch (error) {
    console.error('NFT minting API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to mint NFT'
    });
  }
}