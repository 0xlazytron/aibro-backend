import type { NextApiRequest, NextApiResponse } from 'next';
import { firestoreHelpers, db } from '@/lib/firebase';
import { ApiResponse, NFT } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'NFT ID is required'
    });
  }
  
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, id);
      case 'PUT':
        return await handlePut(req, res, id);
      case 'DELETE':
        return await handleDelete(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
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
  res: NextApiResponse,
  id: string
) {
  try {
    const nft = await firestoreHelpers.getNFTById(id);
    
    if (!nft) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: nft
    });
  } catch (error) {
    console.error('Error fetching NFT:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch NFT'
    });
  }
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const updateData = req.body;
    
    // Check if NFT exists
    const existingNFT = await firestoreHelpers.getNFTById(id);
    if (!existingNFT) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }
    
    // Update NFT
    await db.collection('nfts').doc(id).update({
      ...updateData,
      updatedAt: new Date()
    });
    
    // Fetch updated NFT
    const updatedNFT = await firestoreHelpers.getNFTById(id);
    
    return res.status(200).json({
      success: true,
      data: updatedNFT,
      message: 'NFT updated successfully'
    });
  } catch (error) {
    console.error('Error updating NFT:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update NFT'
    });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    // Check if NFT exists
    const existingNFT = await firestoreHelpers.getNFTById(id);
    if (!existingNFT) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }
    
    // Delete NFT
    await db.collection('nfts').doc(id).delete();
    
    return res.status(200).json({
      success: true,
      data: null,
      message: 'NFT deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting NFT:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete NFT'
    });
  }
}