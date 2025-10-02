/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
import { firestoreHelpers, db } from '@/lib/firebase';
import { ApiResponse, NFT, CreateNFTRequest } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock AI image generation (Phase 2 implementation)
const mockAIGeneration = async (prompt: string) => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Return mock image URLs (will be replaced with real AI in production)
  const mockImages = [
    '/api/mock-images/robot-1.jpg',
    '/api/mock-images/robot-2.jpg',
    '/api/mock-images/cosmic-1.jpg',
    '/api/mock-images/abstract-1.jpg',
    '/api/mock-images/neon-1.jpg'
  ];

  const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];

  return {
    imageUrl: randomImage,
    seed: Math.floor(Math.random() * 1000000),
    parameters: {
      width: 512,
      height: 512,
      steps: 50,
      guidance: 7.5
    }
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('NFT API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, page = '1', limit = '10' } = req.query;

  try {
    let nfts: any[];

    if (userId && typeof userId === 'string') {
      nfts = await firestoreHelpers.getNFTsByUser(userId);
    } else {
      // Get all NFTs (with pagination in production)
      const snapshot = await db.collection('nfts')
        .orderBy('createdAt', 'desc')
        .limit(parseInt(limit as string))
        .get();

      nfts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    return res.status(200).json({
      success: true,
      data: nfts
    });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch NFTs'
    });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query;
  const nftData: CreateNFTRequest = req.body;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
  }

  if (!nftData.prompt || !nftData.title) {
    return res.status(400).json({
      success: false,
      error: 'Prompt and title are required'
    });
  }

  try {
    // Generate AI image
    const aiResult = await mockAIGeneration(nftData.prompt);

    // Create NFT metadata
    const metadata = {
      name: nftData.title,
      description: nftData.description || '',
      image: aiResult.imageUrl,
      attributes: nftData.attributes || [],
      external_url: `${process.env.NEXTAUTH_URL}/nft/`,
    };

    // Create NFT record
    const nftId = await firestoreHelpers.createNFT({
      userId,
      title: nftData.title,
      description: nftData.description || '',
      prompt: nftData.prompt,
      imageUrl: aiResult.imageUrl,
      metadata,
      blockchain: nftData.blockchain || 'ethereum',
      price: nftData.price || 0,
      royalty: nftData.royalty || 5,
      status: 'draft',
      aiParameters: aiResult.parameters,
      seed: aiResult.seed
    });

    // Fetch the created NFT
    const createdNFT = await firestoreHelpers.getNFTById(nftId);

    return res.status(201).json({
      success: true,
      data: createdNFT,
      message: 'NFT created successfully'
    });
  } catch (error) {
    console.error('Error creating NFT:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create NFT'
    });
  }
}