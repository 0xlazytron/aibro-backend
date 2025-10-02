// User types
export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  username?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  totalNFTs?: number;
  totalTransactions?: number;
}

export interface CreateUserRequest {
  walletAddress: string;
  email?: string;
  username?: string;
  profileImage?: string;
}

// NFT types
export interface NFT {
  id: string;
  userId: string;
  title: string;
  description: string;
  prompt: string;
  imageUrl: string;
  metadata: NFTMetadata;
  blockchain: string;
  contractAddress?: string;
  tokenId?: string;
  price?: number;
  royalty?: number;
  status: 'draft' | 'minting' | 'minted' | 'listed' | 'sold';
  createdAt: Date;
  updatedAt: Date;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  external_url?: string;
  animation_url?: string;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'boost_number' | 'boost_percentage' | 'number' | 'date';
}

export interface CreateNFTRequest {
  title: string;
  description: string;
  prompt: string;
  blockchain: string;
  price?: number;
  royalty?: number;
  attributes?: NFTAttribute[];
}

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  nftId?: string;
  type: 'mint' | 'transfer' | 'sale' | 'purchase';
  blockchain: string;
  txHash: string;
  fromAddress?: string;
  toAddress?: string;
  amount?: number;
  gasUsed?: number;
  gasPrice?: number;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionRequest {
  nftId?: string;
  type: 'mint' | 'transfer' | 'sale' | 'purchase';
  blockchain: string;
  fromAddress?: string;
  toAddress?: string;
  amount?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// AI Generation types
export interface AIGenerationRequest {
  prompt: string;
  style?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance?: number;
}

export interface AIGenerationResponse {
  imageUrl: string;
  prompt: string;
  seed: number;
  parameters: {
    width: number;
    height: number;
    steps: number;
    guidance: number;
  };
}

// Blockchain types
export interface BlockchainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface WalletAuthRequest {
  walletAddress: string;
  signature?: string;
  message?: string;
}

export interface WalletAuthResponse {
  token: string;
  user: User;
  expiresAt: Date;
}

// Analytics types
export interface AnalyticsData {
  totalMints: number;
  totalRevenue: number;
  totalUsers: number;
  popularPrompts: Array<{
    prompt: string;
    count: number;
  }>;
  recentTransactions: Transaction[];
  blockchainStats: Array<{
    blockchain: string;
    count: number;
    volume: number;
  }>;
}