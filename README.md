# 🤖 AI Bro Backend

Backend API for the AI Bro Web3 Creator Platform - A comprehensive NFT generation and management system with AI-powered image creation and blockchain integration.

## 🚀 Features

- **Firebase Integration**: User management, NFT storage, and transaction tracking
- **AI Image Generation**: Mock Stable Diffusion API for demo purposes
- **Wallet Authentication**: Simulated Web3 wallet login system
- **Blockchain Mocking**: Fake transaction processing for multiple chains
- **Analytics Dashboard**: Real-time platform statistics and insights
- **RESTful API**: Complete CRUD operations for all resources

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth + Custom Wallet Auth
- **Deployment**: Vercel
- **API**: RESTful endpoints with proper error handling

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled
- Vercel account for deployment

## ⚡ Quick Start

### 1. Environment Setup

```bash
# Clone and navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your Firebase credentials:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# API Keys (for future real integrations)
OPENAI_API_KEY=your-openai-key
STABLE_DIFFUSION_API_KEY=your-sd-key

# Development
NODE_ENV=development
CORS_ALLOWED_ORIGINS=http://localhost:8080,https://aibro-kappa.vercel.app
```

### 3. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Create a service account and download the JSON key
4. Extract the required fields for your `.env.local`

### 4. Development

```bash
# Start development server
npm run dev

# Server runs on http://localhost:3000
# API documentation available at http://localhost:3000
```

### 5. Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Deployment

### Vercel Deployment

1. **Connect Repository**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Environment Variables**:
   Add all environment variables in Vercel dashboard:
   - Project Settings → Environment Variables
   - Add each variable from `.env.example`

3. **Custom Domain** (Optional):
   - Add your domain in Vercel dashboard
   - Update CORS origins in environment variables

## 📚 API Documentation

### Authentication

```bash
# Wallet Authentication
POST /api/auth/wallet
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96DfbF31d2"
}
```

### NFT Management

```bash
# Create NFT
POST /api/nfts
{
  "prompt": "Cyberpunk robot warrior",
  "userId": "user123",
  "style": "digital-art"
}

# Get NFTs
GET /api/nfts?userId=user123&page=1&limit=10

# Get specific NFT
GET /api/nfts/nft123

# Update NFT
PUT /api/nfts/nft123
{
  "name": "Updated NFT Name",
  "description": "New description"
}

# Delete NFT
DELETE /api/nfts/nft123
```

### Transactions

```bash
# Create Transaction
POST /api/transactions
{
  "userId": "user123",
  "nftId": "nft123",
  "type": "mint",
  "blockchain": "ethereum",
  "amount": 0.05
}

# Get Transactions
GET /api/transactions?userId=user123
```

### Analytics

```bash
# Get Platform Analytics
GET /api/analytics
```

## 🗄️ Database Schema

### Users Collection
```typescript
interface User {
  id: string;
  walletAddress: string;
  username?: string;
  email?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### NFTs Collection
```typescript
interface NFT {
  id: string;
  userId: string;
  name: string;
  description: string;
  prompt: string;
  imageUrl: string;
  metadata: object;
  status: 'generating' | 'ready' | 'minted' | 'failed';
  blockchain?: string;
  tokenId?: string;
  contractAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Transactions Collection
```typescript
interface Transaction {
  id: string;
  userId: string;
  nftId: string;
  type: 'mint' | 'transfer' | 'sale';
  blockchain: string;
  txHash: string;
  amount?: number;
  gasUsed: number;
  gasPrice: number;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎭 Demo Mode Features

### Mock AI Generation
- Returns sample images instead of calling real AI APIs
- Simulates processing time with delays
- Provides realistic metadata and responses

### Fake Wallet Authentication
- Accepts any valid Ethereum address format
- Sets authentication cookies
- Creates user records automatically

### Mock Blockchain Transactions
- Generates realistic transaction hashes
- Simulates gas usage and pricing
- Supports multiple blockchain networks

### Live Analytics
- Real-time platform statistics
- Popular prompt tracking
- Revenue and user metrics
- Blockchain distribution data

## 🔧 Configuration

### CORS Setup
Update `CORS_ALLOWED_ORIGINS` in environment variables:
```env
CORS_ALLOWED_ORIGINS=http://localhost:8080,https://your-frontend-domain.com
```

### Firebase Security Rules
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // NFTs are readable by all, writable by owner
    match /nfts/{nftId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Transactions are readable by owner
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🚀 Performance Optimization

- **API Caching**: Implement Redis for frequently accessed data
- **Image Optimization**: Use Next.js Image component and CDN
- **Database Indexing**: Create indexes for common query patterns
- **Rate Limiting**: Implement API rate limiting for production

## 🔒 Security Best Practices

- Environment variables are never committed to repository
- Firebase Admin SDK uses service account authentication
- API endpoints include proper input validation
- CORS is configured for specific origins only
- Authentication tokens are httpOnly cookies

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Error**:
   - Verify service account credentials
   - Check project ID and database URL
   - Ensure Firestore is enabled

2. **CORS Errors**:
   - Update `CORS_ALLOWED_ORIGINS` environment variable
   - Check frontend domain configuration

3. **Build Errors**:
   - Run `npm run type-check` to identify TypeScript issues
   - Ensure all environment variables are set

## 📈 Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Firebase Console**: Database usage and performance
- **API Logs**: Check Vercel function logs for errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for the AI Bro Web3 Creator Platform**