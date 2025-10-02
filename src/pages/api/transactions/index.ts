/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
import { firestoreHelpers, db } from '@/lib/firebase';
import { ApiResponse, Transaction, CreateTransactionRequest } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock blockchain transaction (Phase 2 implementation)
const mockBlockchainTransaction = async (transactionData: CreateTransactionRequest) => {
  // Simulate blockchain processing delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Generate mock transaction hash
  const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  // Mock gas data
  const gasUsed = Math.floor(Math.random() * 100000) + 21000;
  const gasPrice = Math.floor(Math.random() * 50) + 10; // Gwei

  return {
    txHash,
    gasUsed,
    gasPrice,
    status: 'confirmed' as const
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
    console.error('Transaction API Error:', error);
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
    let transactions: any[];

    if (userId && typeof userId === 'string') {
      transactions = await firestoreHelpers.getTransactionsByUser(userId);
    } else {
      // Get all transactions (with pagination in production)
      const snapshot = await db.collection('transactions')
        .orderBy('createdAt', 'desc')
        .limit(parseInt(limit as string))
        .get();

      transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    return res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query;
  const transactionData: CreateTransactionRequest = req.body;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
  }

  if (!transactionData.type || !transactionData.blockchain) {
    return res.status(400).json({
      success: false,
      error: 'Transaction type and blockchain are required'
    });
  }

  try {
    // Create pending transaction record
    const pendingTxId = await firestoreHelpers.createTransaction({
      userId,
      nftId: transactionData.nftId,
      type: transactionData.type,
      blockchain: transactionData.blockchain,
      fromAddress: transactionData.fromAddress,
      toAddress: transactionData.toAddress,
      amount: transactionData.amount || 0,
      txHash: 'pending',
      status: 'pending'
    });

    // Simulate blockchain transaction
    const blockchainResult = await mockBlockchainTransaction(transactionData);

    // Update transaction with blockchain result
    await db.collection('transactions').doc(pendingTxId).update({
      txHash: blockchainResult.txHash,
      gasUsed: blockchainResult.gasUsed,
      gasPrice: blockchainResult.gasPrice,
      status: blockchainResult.status,
      updatedAt: new Date()
    });

    // If this is a mint transaction, update NFT status
    if (transactionData.type === 'mint' && transactionData.nftId) {
      await db.collection('nfts').doc(transactionData.nftId).update({
        status: 'minted',
        contractAddress: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        tokenId: Math.floor(Math.random() * 10000).toString(),
        updatedAt: new Date()
      });
    }

    // Fetch the completed transaction
    const completedTransaction = await firestoreHelpers.getTransactionById(pendingTxId);

    return res.status(201).json({
      success: true,
      data: completedTransaction,
      message: 'Transaction completed successfully'
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create transaction'
    });
  }
}