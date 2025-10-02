import type { NextApiRequest, NextApiResponse } from 'next';

// Mock storage for shareable NFT data
const mockShareStorage = new Map();

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
    const { nftData, generationId } = req.body;

    if (!nftData || !generationId) {
      return res.status(400).json({ 
        error: 'Missing required fields: nftData, generationId' 
      });
    }

    // Generate a unique share ID
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare shareable data
    const shareableData = {
      id: shareId,
      generationId,
      nftData: {
        imageUrl: nftData.imageUrl,
        prompt: nftData.prompt,
        styleValues: nftData.styleValues,
        metadata: nftData.metadata
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      viewCount: 0,
      isPublic: true
    };

    // Store in mock storage (in production, use Firebase or database)
    mockShareStorage.set(shareId, shareableData);

    // Generate shareable URLs
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5173';
    const shareableLink = `${baseUrl}/share/${shareId}`;
    const embedLink = `${baseUrl}/embed/${shareId}`;

    // Simulate storage delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return res.status(200).json({
      success: true,
      data: {
        shareId,
        shareableLink,
        embedLink,
        expiresAt: shareableData.expiresAt,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareableLink)}`,
        socialSharing: {
          twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out my AI-generated NFT!')}&url=${encodeURIComponent(shareableLink)}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableLink)}`
        }
      }
    });

  } catch (error) {
    console.error('NFT sharing API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to create shareable link' 
    });
  }
}

// Export function to get shared NFT data (for the frontend to fetch)
export async function getSharedNFT(shareId: string) {
  const shareData = mockShareStorage.get(shareId);
  
  if (!shareData) {
    return null;
  }

  // Check if expired
  if (new Date() > new Date(shareData.expiresAt)) {
    mockShareStorage.delete(shareId);
    return null;
  }

  // Increment view count
  shareData.viewCount += 1;
  mockShareStorage.set(shareId, shareData);

  return shareData;
}