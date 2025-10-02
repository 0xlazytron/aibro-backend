import type { GetServerSideProps } from 'next/types';

interface ApiDocsProps {
  baseUrl: string;
}

export default function ApiDocs({ baseUrl }: ApiDocsProps) {
  const endpoints = [
    {
      method: 'POST',
      path: '/api/auth/wallet',
      description: 'Authenticate user with wallet address',
      body: { walletAddress: 'string' }
    },
    {
      method: 'GET',
      path: '/api/nfts',
      description: 'Get all NFTs or filter by user',
      query: { userId: 'string (optional)', page: 'number (optional)', limit: 'number (optional)' }
    },
    {
      method: 'POST',
      path: '/api/nfts',
      description: 'Create new NFT with AI generation',
      body: { prompt: 'string', userId: 'string', style: 'string (optional)' }
    },
    {
      method: 'GET',
      path: '/api/nfts/[id]',
      description: 'Get specific NFT by ID'
    },
    {
      method: 'PUT',
      path: '/api/nfts/[id]',
      description: 'Update NFT metadata',
      body: { name: 'string (optional)', description: 'string (optional)' }
    },
    {
      method: 'DELETE',
      path: '/api/nfts/[id]',
      description: 'Delete NFT'
    },
    {
      method: 'GET',
      path: '/api/transactions',
      description: 'Get all transactions or filter by user',
      query: { userId: 'string (optional)', page: 'number (optional)', limit: 'number (optional)' }
    },
    {
      method: 'POST',
      path: '/api/transactions',
      description: 'Create new transaction',
      body: { userId: 'string', nftId: 'string', type: 'mint|transfer|sale', blockchain: 'string', amount: 'number (optional)' }
    },
    {
      method: 'GET',
      path: '/api/analytics',
      description: 'Get platform analytics and statistics'
    }
  ];

  return (
    <div className="api-docs">
      <h1>🤖 AI Bro Backend API</h1>
      <p>Welcome to the AI Bro Web3 Creator Platform Backend API documentation.</p>

      <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px', margin: '2rem 0' }}>
        <h3>🚀 Base URL</h3>
        <code>{baseUrl}</code>
      </div>

      <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '8px', margin: '2rem 0' }}>
        <h3>⚠️ Demo Mode</h3>
        <p>This backend is currently running in demo mode with mocked AI generation and blockchain transactions.</p>
        <ul>
          <li>AI image generation returns sample images</li>
          <li>Wallet authentication is simulated</li>
          <li>Blockchain transactions are mocked</li>
          <li>Analytics data includes demo statistics</li>
        </ul>
      </div>

      <h2>📋 API Endpoints</h2>

      {endpoints.map((endpoint, index) => (
        <div key={index} className="endpoint">
          <div>
            <span className={`method ${endpoint.method.toLowerCase()}`}>
              {endpoint.method}
            </span>
            <code>{endpoint.path}</code>
          </div>
          <p>{endpoint.description}</p>

          {endpoint.body && (
            <div>
              <strong>Request Body:</strong>
              <div className="code-block">
                {JSON.stringify(endpoint.body, null, 2)}
              </div>
            </div>
          )}

          {endpoint.query && (
            <div>
              <strong>Query Parameters:</strong>
              <div className="code-block">
                {JSON.stringify(endpoint.query, null, 2)}
              </div>
            </div>
          )}
        </div>
      ))}

      <h2>🔧 Environment Setup</h2>
      <div className="code-block">
        {`# Copy environment variables
cp .env.example .env.local

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start`}
      </div>

      <h2>🔥 Firebase Collections</h2>
      <div className="endpoint">
        <h3>Users Collection</h3>
        <div className="code-block">
          {JSON.stringify({
            id: 'string',
            walletAddress: 'string',
            username: 'string',
            email: 'string (optional)',
            avatar: 'string (optional)',
            createdAt: 'timestamp',
            updatedAt: 'timestamp'
          }, null, 2)}
        </div>
      </div>

      <div className="endpoint">
        <h3>NFTs Collection</h3>
        <div className="code-block">
          {JSON.stringify({
            id: 'string',
            userId: 'string',
            name: 'string',
            description: 'string',
            prompt: 'string',
            imageUrl: 'string',
            metadata: 'object',
            status: 'generating|ready|minted|failed',
            blockchain: 'string (optional)',
            tokenId: 'string (optional)',
            contractAddress: 'string (optional)',
            createdAt: 'timestamp',
            updatedAt: 'timestamp'
          }, null, 2)}
        </div>
      </div>

      <div className="endpoint">
        <h3>Transactions Collection</h3>
        <div className="code-block">
          {JSON.stringify({
            id: 'string',
            userId: 'string',
            nftId: 'string',
            type: 'mint|transfer|sale',
            blockchain: 'string',
            txHash: 'string',
            amount: 'number (optional)',
            gasUsed: 'number',
            gasPrice: 'number',
            status: 'pending|confirmed|failed',
            createdAt: 'timestamp',
            updatedAt: 'timestamp'
          }, null, 2)}
        </div>
      </div>

      <footer style={{ marginTop: '4rem', padding: '2rem', textAlign: 'center', borderTop: '1px solid #eee' }}>
        <p>🚀 AI Bro Web3 Creator Platform Backend v1.0.0</p>
        <p>Built with Next.js, Firebase, and TypeScript</p>
      </footer>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  return {
    props: {
      baseUrl
    }
  };
};