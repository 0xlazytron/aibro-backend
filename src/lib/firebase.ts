/* eslint-disable @typescript-eslint/no-explicit-any */
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export const db = admin.firestore();
export const auth = admin.auth();

// Collection references
export const collections = {
  users: 'users',
  nfts: 'nfts',
  transactions: 'transactions',
} as const;

// Helper functions for Firestore operations
export const firestoreHelpers = {
  // Users collection helpers
  async createUser(userData: any) {
    const userRef = db.collection(collections.users).doc();
    await userRef.set({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return userRef.id;
  },

  async getUserById(userId: string) {
    const userDoc = await db.collection(collections.users).doc(userId).get();
    return userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
  },

  async getUserByWallet(walletAddress: string) {
    const snapshot = await db.collection(collections.users)
      .where('walletAddress', '==', walletAddress)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  // NFTs collection helpers
  async createNFT(nftData: any) {
    const nftRef = db.collection(collections.nfts).doc();
    await nftRef.set({
      ...nftData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return nftRef.id;
  },

  async getNFTById(nftId: string) {
    const nftDoc = await db.collection(collections.nfts).doc(nftId).get();
    return nftDoc.exists ? { id: nftDoc.id, ...nftDoc.data() } : null;
  },

  async getNFTsByUser(userId: string) {
    const snapshot = await db.collection(collections.nfts)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Transactions collection helpers
  async createTransaction(transactionData: any) {
    const txRef = db.collection(collections.transactions).doc();
    await txRef.set({
      ...transactionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return txRef.id;
  },

  async getTransactionById(txId: string) {
    const txDoc = await db.collection(collections.transactions).doc(txId).get();
    return txDoc.exists ? { id: txDoc.id, ...txDoc.data() } : null;
  },

  async getTransactionsByUser(userId: string) {
    const snapshot = await db.collection(collections.transactions)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};