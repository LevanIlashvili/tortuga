# Tortuga - Real Estate Tokenization Platform

A decentralized platform for fractional real estate investment using Hedera Hashgraph, enabling transparent, secure, and efficient property tokenization and trading.

## Important Links

- **Pitch Deck**: [View on DocSend](https://docsend.com/view/6ubwequmbg4zkg2s)
- **Certificate**: [View on Google Drive](https://drive.google.com/file/d/1697Qg4Ejd_tA18BhkffvDBG9cp78ulyb/view?usp=sharing)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Architecture](#project-architecture)
3. [Hedera Services Integration](#hedera-services-integration)
4. [High-Level Design](#high-level-design)
5. [Token Flow](#token-flow)
6. [Technology Stack](#technology-stack)
7. [Security Considerations](#security-considerations)
8. [Getting Started](#getting-started)

---

## Project Overview

Tortuga transforms traditional real estate investment by leveraging blockchain technology to:

- **Tokenize Real Estate Assets**: Convert physical properties into fungible tokens on Hedera
- **Enable Fractional Ownership**: Allow investors to purchase fractions of high-value properties
- **Provide Liquidity**: Create a secondary market for traditionally illiquid assets
- **Ensure Transparency**: All transactions and ownership records on a public ledger
- **Streamline Compliance**: Built-in KYC/AML verification for regulatory compliance

### Key Features

- 🏢 **Property Tokenization**: Create HTS tokens representing real estate ownership
- 💰 **USDC Payments**: Stable, fiat-backed cryptocurrency for investments
- 🔐 **KYC Verification**: Compliant investor onboarding
- 📊 **Portfolio Management**: Real-time tracking of investments and returns
- 👔 **Admin Dashboard**: Property and order management interface
- 🔗 **HashPack Integration**: Seamless wallet connectivity

---

## Project Architecture

### System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Next.js Web App]
        WALLET[HashPack Wallet]
    end

    subgraph "Application Layer"
        API[Next.js API Routes]
        AUTH[Authentication Service]
        KYC[KYC Service]
        ORDER[Order Processing]
        MONITOR[Payment Monitor]
    end

    subgraph "Blockchain Layer"
        HEDERA[Hedera Network]
        HTS[Token Service]
        HCS[Consensus Service]
        TREASURY[Treasury Account]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL)]
        PRISMA[Prisma ORM]
    end

    WEB <-->|API Calls| API
    WEB <-->|Sign Tx| WALLET
    WALLET <-->|Submit Tx| HEDERA

    API --> AUTH
    API --> KYC
    API --> ORDER

    ORDER --> MONITOR
    MONITOR <-->|Verify Payment| HEDERA
    MONITOR -->|Mint Tokens| HTS

    API <--> PRISMA
    PRISMA <--> DB

    HTS -.->|Token Transfers| TREASURY
    ORDER -.->|Payment Verification| HCS

    style HEDERA fill:#00a3e0
    style HTS fill:#00a3e0
    style HCS fill:#00a3e0
```

### Monorepo Structure

```
tortuga-hedera/
├── apps/
│   ├── web/                    # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/            # App router pages
│   │   │   │   ├── properties/ # Property browsing & details
│   │   │   │   ├── portfolio/  # User portfolio
│   │   │   │   ├── admin/      # Admin dashboard
│   │   │   │   ├── kyc/        # KYC application
│   │   │   │   └── api/        # API routes
│   │   │   ├── components/     # Shared UI components
│   │   │   └── lib/            # Utility functions
│   │   └── public/             # Static assets
│   │
├── packages/
│   ├── database/               # Prisma schema & client
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database schema
│   │   └── src/                # Database utilities
│   │
│   └── hedera/                 # Hedera SDK wrapper
│       └── src/
│           ├── token.ts        # HTS operations
│           ├── payment.ts      # Payment verification
│           └── client.ts       # Hedera client setup
│
├── scripts/
│   └── monitor-payments.ts     # Background payment monitor
│
└── pnpm-workspace.yaml         # Workspace configuration
```

### Database Schema

```mermaid
erDiagram
    User ||--o{ Wallet : has
    User ||--o{ Order : places
    User ||--o| KycApplication : submits
    User ||--o{ UserPropertyBalance : owns
    User ||--o{ Session : has

    Property ||--o{ Order : receives
    Property ||--o| HederaToken : tokenized_as
    Property ||--o{ UserPropertyBalance : distributed_to
    Property ||--o{ PropertyImage : has

    Order }o--|| HederaToken : involves

    User {
        string id PK
        string email UK
        enum role
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Wallet {
        string id PK
        string accountId UK
        string publicKey
        string userId FK
        datetime createdAt
    }

    Property {
        string id PK
        string name
        text description
        string location
        enum propertyType
        decimal totalValue
        decimal bondYield
        int tokenSupply
        int tokensSold
        decimal tokenPrice
        enum status
        datetime maturityDate
    }

    HederaToken {
        string id PK
        string tokenId UK
        string tokenName
        string tokenSymbol
        string treasuryAccountId
        int decimals
        string propertyId FK
    }

    Order {
        string id PK
        string orderNumber UK
        enum status
        int tokenQuantity
        decimal tokenPrice
        decimal totalAmount
        decimal usdcAmount
        string paymentMemo UK
        datetime completedAt
        string hederaTokenMintTx
        string userId FK
        string propertyId FK
    }

    KycApplication {
        string id PK
        enum status
        string fullName
        date dateOfBirth
        string nationality
        text address
        string idDocumentUrl
        datetime reviewedAt
        string userId FK
    }

    UserPropertyBalance {
        string id PK
        int tokenBalance
        string userId FK
        string propertyId FK
    }
```

---

## Hedera Services Integration

### 1. Hedera Token Service (HTS)

**Purpose**: Tokenize real estate properties as fungible tokens

**Implementation**:

```typescript
// packages/hedera/src/token.ts

export async function createPropertyToken(params: {
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: number;
  treasuryAccountId: string;
  adminKey: PrivateKey;
}) {
  const client = createHederaClient();

  const tokenCreateTx = new TokenCreateTransaction()
    .setTokenName(params.tokenName)
    .setTokenSymbol(params.tokenSymbol)
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(0)
    .setInitialSupply(params.tokenSupply)
    .setTreasuryAccountId(params.treasuryAccountId)
    .setAdminKey(params.adminKey)
    .setSupplyKey(params.adminKey)
    .setFreezeDefault(false);

  const txResponse = await tokenCreateTx.execute(client);
  const receipt = await txResponse.getReceipt(client);

  return {
    tokenId: receipt.tokenId?.toString(),
    transactionId: txResponse.transactionId.toString()
  };
}
```

**Usage**:
- Create unique tokens for each property
- Tokens represent fractional ownership
- Non-divisible (0 decimals) for whole-unit ownership
- Treasury account holds unsold tokens

**Example**:
- Property: "Marina Bay Luxury Residences"
- Token: `0.0.5001234` (MARINA)
- Supply: 15,000 tokens @ $1,000 each
- Total Value: $15,000,000

### 2. USDC Token Transfers

**Purpose**: Accept stable cryptocurrency payments for property investments

**Token**: `0.0.456858` (USDC on Hedera Mainnet)

**Implementation**:

```typescript
// apps/web/src/app/api/orders/create/route.ts

export async function POST(request: NextRequest) {
  const { propertyId, tokensAmount } = await request.json();

  // Calculate USDC amount (6 decimals)
  const usdcAmount = tokenPrice * tokensAmount;
  const usdcWithDecimals = Math.floor(usdcAmount * 1_000_000);

  // Create order with payment memo
  const order = await prisma.order.create({
    data: {
      userId,
      propertyId,
      tokenQuantity: tokensAmount,
      usdcAmount,
      paymentMemo: `TORTUGA-${propertyId}-${timestamp}`,
      status: 'PENDING_PAYMENT'
    }
  });

  return {
    paymentDetails: {
      treasuryAccount: '0.0.10075374',
      usdcAmount,
      memo: order.paymentMemo
    }
  };
}
```

**Payment Flow**:
1. User initiates purchase
2. System generates unique payment memo
3. User sends USDC to treasury account with memo
4. Background monitor verifies payment
5. System mints property tokens to user

### 3. Hedera Consensus Service (HCS)

**Purpose**: Immutable audit trail for property transactions

**Implementation**:

```typescript
// packages/hedera/src/consensus.ts

export async function logPropertyTransaction(params: {
  topicId: string;
  orderId: string;
  propertyId: string;
  userId: string;
  tokenAmount: number;
  usdcAmount: number;
  timestamp: Date;
}) {
  const client = createHederaClient();

  const message = JSON.stringify({
    type: 'PROPERTY_PURCHASE',
    orderId: params.orderId,
    propertyId: params.propertyId,
    userId: params.userId,
    tokenAmount: params.tokenAmount,
    usdcAmount: params.usdcAmount,
    timestamp: params.timestamp.toISOString()
  });

  const submitTx = new TopicMessageSubmitTransaction()
    .setTopicId(params.topicId)
    .setMessage(message);

  const txResponse = await submitTx.execute(client);
  const receipt = await txResponse.getReceipt(client);

  return {
    sequenceNumber: receipt.topicSequenceNumber,
    transactionId: txResponse.transactionId.toString()
  };
}
```

**Benefits**:
- Tamper-proof transaction history
- Regulatory compliance audit trail
- Transparent ownership records
- Dispute resolution evidence

### 4. HashPack Wallet Integration

**Purpose**: User-friendly wallet connectivity and transaction signing

**Implementation**:

```typescript
// apps/web/src/app/_components/auth-provider.tsx

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hashconnect, setHashconnect] = useState<HashConnect | null>(null);

  useEffect(() => {
    initializeHashConnect();
  }, []);

  const initializeHashConnect = async () => {
    const hc = new HashConnect(
      LedgerId.MAINNET,
      projectId,
      {
        name: 'Tortuga',
        description: 'Real Estate Tokenization Platform',
        icons: ['https://tortuga.estate/icon.png']
      }
    );

    // Listen for pairing events
    hc.pairingEvent.on(async (pairingData) => {
      const accountId = pairingData.accountIds[0];
      // Create user session
      await createUserSession(accountId);
    });

    await hc.init();
    setHashconnect(hc);
  };

  return (
    <AuthContext.Provider value={{ hashconnect, connect, disconnect }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Features**:
- One-click wallet connection
- Secure transaction signing
- Multi-account support
- Real-time balance updates

---

## High-Level Design

### System Components

```mermaid
flowchart TB
    subgraph "Frontend - Next.js 15"
        UI[User Interface]
        ADMIN_UI[Admin Interface]
        WALLET_CONN[Wallet Connector]
    end

    subgraph "API Layer - Next.js API Routes"
        PROPERTY_API[Property API]
        ORDER_API[Order API]
        AUTH_API[Auth API]
        KYC_API[KYC API]
        ADMIN_API[Admin API]
    end

    subgraph "Business Logic"
        AUTH_SVC[Authentication]
        KYC_SVC[KYC Processing]
        ORDER_SVC[Order Processing]
        TOKEN_SVC[Token Operations]
        PAYMENT_SVC[Payment Verification]
    end

    subgraph "Background Services"
        MONITOR[Payment Monitor]
        SCHEDULER[Task Scheduler]
    end

    subgraph "External Services"
        HEDERA_SDK[Hedera SDK]
        DB[PostgreSQL]
        S3[AWS S3]
    end

    UI --> PROPERTY_API
    UI --> ORDER_API
    UI --> WALLET_CONN
    ADMIN_UI --> ADMIN_API

    PROPERTY_API --> DB
    ORDER_API --> ORDER_SVC
    AUTH_API --> AUTH_SVC
    KYC_API --> KYC_SVC
    KYC_API --> S3

    ORDER_SVC --> PAYMENT_SVC
    ORDER_SVC --> DB

    TOKEN_SVC --> HEDERA_SDK
    PAYMENT_SVC --> HEDERA_SDK

    MONITOR --> PAYMENT_SVC
    MONITOR --> TOKEN_SVC
    MONITOR --> DB

    WALLET_CONN -.->|Sign Tx| HEDERA_SDK

    style HEDERA_SDK fill:#00a3e0
    style MONITOR fill:#ff6b6b
```

### Authentication & Authorization Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Web App
    participant HashPack as HashPack Wallet
    participant API as Auth API
    participant Hedera as Hedera Network
    participant DB as Database

    User->>UI: Click "Connect Wallet"
    UI->>HashPack: Initialize Connection
    HashPack->>User: Request Approval
    User->>HashPack: Approve Connection

    HashPack->>API: Send Account ID
    API->>DB: Check if user exists

    alt User exists
        DB-->>API: Return user data
    else New user
        API->>DB: Create new user
        DB-->>API: Return new user data
    end

    API->>API: Create JWT session
    API-->>UI: Return session token
    UI-->>User: Connected (show account)

    Note over User,DB: Subsequent requests include JWT in headers

    User->>UI: Access protected resource
    UI->>API: Request + JWT
    API->>API: Verify JWT
    API->>DB: Fetch user data
    DB-->>API: User data
    API-->>UI: Protected resource
    UI-->>User: Display data
```

### KYC Verification Flow

```mermaid
sequenceDiagram
    actor Investor
    participant UI as Web App
    participant API as KYC API
    participant S3 as AWS S3
    participant DB as Database
    actor Admin

    Investor->>UI: Submit KYC Application
    UI->>UI: Validate form data

    UI->>S3: Upload ID document
    S3-->>UI: Document URL

    UI->>S3: Upload proof of address
    S3-->>UI: Document URL

    UI->>S3: Upload selfie
    S3-->>UI: Document URL

    UI->>API: Submit KYC Application
    API->>DB: Create KYC record (PENDING)
    DB-->>API: Application ID
    API-->>UI: Success response
    UI-->>Investor: Application submitted

    Note over Admin,DB: Manual review process

    Admin->>UI: Review application
    UI->>API: Fetch KYC details
    API->>DB: Get application
    DB-->>API: Application data
    API-->>UI: Display application

    Admin->>UI: Approve/Reject
    UI->>API: Update status
    API->>DB: Update KYC status
    DB-->>API: Success
    API-->>UI: Updated

    UI->>Investor: Email notification
    Investor->>UI: Check status
    UI-->>Investor: KYC Approved ✓
```

---

## Token Flow

### Property Tokenization Flow

```mermaid
flowchart TD
    START([Admin Creates Property]) --> INPUT[Enter Property Details]
    INPUT --> VALIDATE{Valid Data?}

    VALIDATE -->|No| INPUT
    VALIDATE -->|Yes| SAVE_DB[Save to Database]

    SAVE_DB --> TOKEN_PARAMS[Generate Token Parameters]
    TOKEN_PARAMS --> |Name, Symbol, Supply| HTS_CREATE[Create HTS Token]

    HTS_CREATE --> HEDERA[Submit to Hedera Network]
    HEDERA --> CONSENSUS[Consensus & Validation]
    CONSENSUS --> TOKEN_ID[Receive Token ID]

    TOKEN_ID --> UPDATE_DB[Update Property Record]
    UPDATE_DB --> TREASURY[Tokens in Treasury Account]

    TREASURY --> READY[Property Listed for Investment]
    READY --> END([Investors Can Purchase])

    style HEDERA fill:#00a3e0
    style CONSENSUS fill:#00a3e0
    style TOKEN_ID fill:#4caf50
    style READY fill:#4caf50
```

### Investment & Token Distribution Flow

```mermaid
sequenceDiagram
    actor Investor
    participant UI as Web App
    participant API as Order API
    participant HashPack as HashPack Wallet
    participant Hedera as Hedera Network
    participant Monitor as Payment Monitor
    participant TokenSvc as Token Service
    participant DB as Database

    Investor->>UI: Select property & token amount
    UI->>API: Create order
    API->>DB: Create order (PENDING)
    DB-->>API: Order + Payment Memo
    API-->>UI: Payment details

    UI-->>Investor: Show payment instructions
    Investor->>HashPack: Initiate USDC transfer
    HashPack->>Investor: Review transaction
    Investor->>HashPack: Approve & sign

    HashPack->>Hedera: Submit USDC transfer
    Note over Hedera: To: Treasury (0.0.10075374)<br/>Memo: TORTUGA-{property}-{timestamp}
    Hedera-->>HashPack: Transaction confirmed
    HashPack-->>Investor: Payment sent ✓

    loop Every 30 seconds
        Monitor->>DB: Get pending orders
        DB-->>Monitor: Pending orders list
        Monitor->>Hedera: Query transactions by memo
        Hedera-->>Monitor: Transaction details

        alt Payment found
            Monitor->>Monitor: Verify amount & sender
            Monitor->>DB: Update order (PAYMENT_RECEIVED)

            Monitor->>TokenSvc: Mint tokens to investor
            TokenSvc->>Hedera: Transfer from treasury
            Hedera-->>TokenSvc: Transfer confirmed

            TokenSvc-->>Monitor: Tokens transferred
            Monitor->>DB: Update order (COMPLETED)
            Monitor->>DB: Update balances

            Monitor-->>Investor: Email: Purchase complete
        end
    end

    Investor->>UI: Check portfolio
    UI->>DB: Get user balances
    DB-->>UI: Token holdings
    UI-->>Investor: Display portfolio
```

### Complete End-to-End Token Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PropertyCreation: Admin creates property

    PropertyCreation --> TokenDeployment: Deploy HTS token
    TokenDeployment --> InTreasury: Tokens in treasury account

    InTreasury --> ListedForSale: Property listed
    ListedForSale --> PendingPayment: Investor initiates purchase

    PendingPayment --> PaymentReceived: USDC payment verified
    PaymentReceived --> TokenMinting: Mint tokens to investor

    TokenMinting --> InvestorWallet: Tokens in investor wallet
    InvestorWallet --> SecondaryMarket: Can trade on secondary market

    SecondaryMarket --> InvestorWallet: Hold tokens
    InvestorWallet --> Maturity: Hold until maturity

    Maturity --> Redemption: Redeem for fiat + yields
    Redemption --> [*]

    note right of TokenDeployment
        Token created on Hedera
        Symbol: e.g., MARINA
        Supply: e.g., 15,000
        Decimals: 0
    end note

    note right of PaymentReceived
        Payment verified via memo
        Amount matched
        Transaction confirmed
    end note

    note right of TokenMinting
        Transfer from treasury
        Update balances
        Record on-chain
    end note
```

### Token Transfer Mechanism

```mermaid
flowchart LR
    subgraph "Before Purchase"
        TREASURY[Treasury Account<br/>0.0.10075374<br/>Balance: 15,000 MARINA]
        INVESTOR1[Investor Wallet<br/>Balance: 0 MARINA]
    end

    subgraph "Payment Verification"
        USDC_TX[USDC Transfer<br/>$10,000<br/>Memo: TORTUGA-marina-123]
        VERIFY[Verify Payment]
    end

    subgraph "Token Minting"
        MINT_TX[Transfer Transaction<br/>From: Treasury<br/>To: Investor<br/>Amount: 10 MARINA]
        HEDERA_NET[Hedera Network]
    end

    subgraph "After Purchase"
        TREASURY2[Treasury Account<br/>Balance: 14,990 MARINA]
        INVESTOR2[Investor Wallet<br/>Balance: 10 MARINA]
    end

    TREASURY --> USDC_TX
    INVESTOR1 --> USDC_TX
    USDC_TX --> VERIFY
    VERIFY -->|Confirmed| MINT_TX
    MINT_TX --> HEDERA_NET
    HEDERA_NET --> TREASURY2
    HEDERA_NET --> INVESTOR2

    style HEDERA_NET fill:#00a3e0
    style VERIFY fill:#4caf50
    style MINT_TX fill:#ff9800
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Hooks
- **Wallet Integration**: HashConnect (HashPack)
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT + Database Sessions
- **File Storage**: AWS S3
- **Background Jobs**: Custom payment monitor

### Blockchain
- **Network**: Hedera Hashgraph Mainnet
- **SDK**: @hashgraph/sdk
- **Wallet**: HashPack (via HashConnect)
- **Services**:
  - Hedera Token Service (HTS)
  - Hedera Consensus Service (HCS)
  - Crypto Transfer Service

### DevOps
- **Monorepo**: Turborepo + pnpm workspaces
- **Package Manager**: pnpm
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (Frontend), AWS (Backend services)

---

## Security Considerations

### Smart Contract Security
- **No Smart Contracts**: Hedera Token Service provides native token functionality
- **Key Management**: Multi-signature treasury account
- **Token Supply**: Fixed supply prevents inflation attacks
- **Freeze Protection**: Tokens cannot be frozen by default

### Payment Security
- **Memo Verification**: Unique payment memos prevent double-spending
- **Amount Validation**: Exact USDC amount verification
- **Sender Verification**: Confirm payment from authenticated user
- **Idempotency**: Orders processed exactly once

### Data Security
- **Encryption at Rest**: Database encryption enabled
- **Encryption in Transit**: HTTPS/TLS for all connections
- **Secrets Management**: Environment variables, never committed
- **File Security**: S3 bucket policies and signed URLs

### Authentication Security
- **JWT Tokens**: Short-lived access tokens
- **Session Management**: Database-backed sessions for admin
- **Wallet Signatures**: Cryptographic proof of ownership
- **CSRF Protection**: Next.js built-in protections

### Compliance
- **KYC/AML**: Document verification before investment
- **Audit Trail**: Immutable HCS records
- **Data Privacy**: GDPR-compliant data handling
- **Access Control**: Role-based permissions (Admin/Investor)

---

## Getting Started

### Prerequisites

```bash
# Node.js 18+
node --version

# pnpm
npm install -g pnpm

# PostgreSQL 14+
psql --version

# Hedera Account (Testnet or Mainnet)
# - Get from https://portal.hedera.com
```

### Environment Setup

```bash
# Clone repository
git clone https://github.com/yourusername/tortuga-hedera.git
cd tortuga-hedera

# Install dependencies
pnpm install

# Configure environment variables
cp apps/web/.env.example apps/web/.env

# Edit .env with your credentials:
# - DATABASE_URL
# - HEDERA_OPERATOR_ID
# - HEDERA_OPERATOR_KEY
# - HEDERA_NETWORK
# - JWT_SECRET
# - AWS_* credentials
```

### Database Setup

```bash
# Run migrations
cd packages/database
pnpm db:migrate

# Seed database (optional)
pnpm db:seed
```

### Run Development Server

```bash
# From root directory
pnpm dev

# Web app: http://localhost:3000
# API: http://localhost:3000/api
```

### Deploy Property Token

```bash
# Run admin setup
cd apps/web
pnpm setup:admin

# Create property via admin UI:
# http://localhost:3000/admin/properties/create
```

### Start Payment Monitor

```bash
# In separate terminal
pnpm monitor:payments

# Monitors pending orders every 30 seconds
# Verifies USDC payments
# Mints tokens to investors
```

---

## Architecture Decisions

### Why Hedera?

1. **Performance**: 10,000+ TPS vs. Ethereum's ~15 TPS
2. **Cost**: $0.0001 per transaction vs. Ethereum's $50-200 gas fees
3. **Finality**: 3-5 seconds vs. Ethereum's 10-15 minutes
4. **Carbon Negative**: Environmentally sustainable
5. **Native Token Service**: No smart contract vulnerabilities
6. **Regulatory Compliance**: Governed by established enterprises

### Why Next.js?

- **Full-Stack**: API routes eliminate separate backend
- **Performance**: Server-side rendering + caching
- **Developer Experience**: File-based routing, TypeScript support
- **Deployment**: Vercel integration for instant deploys
- **SEO**: Server components for search optimization

### Why PostgreSQL?

- **ACID Compliance**: Critical for financial transactions
- **Complex Queries**: Advanced filtering and analytics
- **JSON Support**: Flexible schema for blockchain data
- **Scalability**: Proven performance at scale
- **Prisma Integration**: Type-safe database access

---

## Contact

- **Website**: https://tortuga.estate
- **Email**: levan@tortuga.estate
- **Twitter**: [@tortuga_estate](https://x.com/tortuga_estate)

---

**Built with ❤️ using Hedera Hashgraph**
