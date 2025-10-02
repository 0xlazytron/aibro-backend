import type { NextApiRequest, NextApiResponse } from 'next';

// Mock storage for draft NFT data
const mockDraftStorage = new Map();

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

  if (req.method === 'POST') {
    return handleSaveDraft(req, res);
  } else if (req.method === 'GET') {
    return handleGetDrafts(req, res);
  } else if (req.method === 'DELETE') {
    return handleDeleteDraft(req, res);
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}

async function handleSaveDraft(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { nftData, walletAddress } = req.body;

    if (!nftData || !walletAddress) {
      return res.status(400).json({
        error: 'Missing required fields: nftData, walletAddress'
      });
    }

    // Generate a unique draft ID
    const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare draft data
    const draftData = {
      id: draftId,
      walletAddress,
      nftData: {
        name: nftData.name || 'Untitled NFT',
        description: nftData.description || '',
        imageUrl: nftData.imageUrl,
        prompt: nftData.prompt,
        styleValues: nftData.styleValues,
        royaltyPercent: nftData.royaltyPercent || 0,
        maxSupply: nftData.maxSupply || 1,
        blockchain: nftData.blockchain || 'eth'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };

    // Store in mock storage
    mockDraftStorage.set(draftId, draftData);

    // Simulate storage delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return res.status(200).json({
      success: true,
      data: {
        draftId,
        message: 'Draft saved successfully',
        savedAt: draftData.createdAt
      }
    });

  } catch (error) {
    console.error('Save draft API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save draft'
    });
  }
}

async function handleGetDrafts(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({
        error: 'walletAddress query parameter is required'
      });
    }

    // Filter drafts by wallet address
    const userDrafts = Array.from(mockDraftStorage.values())
      .filter(draft => draft.walletAddress === walletAddress)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return res.status(200).json({
      success: true,
      data: {
        drafts: userDrafts,
        count: userDrafts.length
      }
    });

  } catch (error) {
    console.error('Get drafts API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve drafts'
    });
  }
}

async function handleDeleteDraft(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { draftId } = req.query;

    if (!draftId) {
      return res.status(400).json({
        error: 'draftId query parameter is required'
      });
    }

    const draft = mockDraftStorage.get(draftId);

    if (!draft) {
      return res.status(404).json({
        error: 'Draft not found'
      });
    }

    // Delete the draft
    mockDraftStorage.delete(draftId);

    return res.status(200).json({
      success: true,
      data: {
        message: 'Draft deleted successfully',
        draftId
      }
    });

  } catch (error) {
    console.error('Delete draft API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete draft'
    });
  }
}