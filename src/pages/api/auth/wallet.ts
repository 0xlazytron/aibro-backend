import type { NextApiRequest, NextApiResponse } from 'next';
import { firestoreHelpers } from '@/lib/firebase';
import { ApiResponse, WalletAuthRequest, WalletAuthResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock wallet authentication (Phase 2 implementation)
// In production, this would verify wallet signatures
const mockWalletAuth = async (walletAddress: string) => {
  // Simulate authentication delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock JWT token
  const token = `mock_jwt_${uuidv4()}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  return { token, expiresAt };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }
  
  try {
    const { walletAddress, signature, message }: WalletAuthRequest = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }
    
    // Validate wallet address format (basic validation)
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }
    
    // Mock authentication (in production, verify signature)
    const authResult = await mockWalletAuth(walletAddress);
    
    // Check if user exists
    let user = await firestoreHelpers.getUserByWallet(walletAddress);
    
    // Create user if doesn't exist
    if (!user) {
      const userId = await firestoreHelpers.createUser({
        walletAddress,
        username: `user_${walletAddress.slice(-6)}`,
        totalNFTs: 0,
        totalTransactions: 0
      });
      
      user = await firestoreHelpers.getUserById(userId);
    }
    
    if (!user) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create or retrieve user'
      });
    }
    
    // Set authentication cookie
    res.setHeader('Set-Cookie', [
      `auth_token=${authResult.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`,
      `wallet_address=${walletAddress}; Path=/; Max-Age=86400; SameSite=Strict`
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        token: authResult.token,
        user,
        expiresAt: authResult.expiresAt
      },
      message: 'Authentication successful'
    });
    
  } catch (error) {
    console.error('Wallet auth error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}