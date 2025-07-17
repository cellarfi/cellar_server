# Token Call Infrastructure Implementation

## Overview

We've implemented a comprehensive token call system that reuses and extends our existing post infrastructure while maintaining clean separation from the fundraising system.

## Architecture Decision: Separate `token_meta` Table

**Why not reuse `funding_meta`?**
- **Clean separation**: Token calls and fundraising serve different purposes
- **Specific fields**: Token calls need launch dates, price targets, social links, etc.
- **Type safety**: Dedicated validation for each use case
- **Scalability**: Easy to extend with token-specific features
- **Performance**: Optimized indexes and queries for each use case

## Database Schema

### New `token_meta` Table
```sql
model TokenMeta {
  id               String   @id @default(cuid())
  post_id          String   @unique
  token_name       String
  token_symbol     String
  token_address    String
  chain_type       String
  launch_date      DateTime?
  initial_price    Decimal?
  target_price     Decimal?
  market_cap       Decimal?
  website          String?
  twitter          String?
  telegram         String?
  discord          String?
  description      String?
  logo_url         String?
  is_launched      Boolean @default(false)
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
  
  post Post @relation(fields: [post_id], references: [id], onDelete: Cascade)
}
```

### Updated `Post` Model
- Added `token_meta` relation for TOKEN_CALL posts
- Maintains existing `funding_meta` for DONATION posts
- `post_type` enum distinguishes between REGULAR, TOKEN_CALL, DONATION

## Implementation Components

### 1. **TokenMetaModel** (`src/models/tokenMeta.model.ts`)
Comprehensive CRUD operations for token metadata:
- `createTokenMeta()` - Create token metadata
- `getTokenCalls()` - Get all token calls
- `getTokenCallsByChain()` - Filter by blockchain
- `getTokenCallsByStatus()` - Filter by launch status
- `searchTokenCalls()` - Search by name/symbol
- `markTokenAsLaunched()` - Update launch status
- `getTrendingTokenCalls()` - Most liked token calls

### 2. **Enhanced DTOs** (`src/utils/dto/socialfi.dto.ts`)
```typescript
// Token Call Creation
interface CreateTokenCallDto {
  content: string
  token_name: string
  token_symbol: string
  token_address: string
  chain_type: string
  launch_date?: string
  initial_price?: number
  target_price?: number
  market_cap?: number
  website?: string
  twitter?: string
  telegram?: string
  discord?: string
  description?: string
  logo_url?: string
  is_launched?: boolean
}

// Token Call Updates
interface UpdateTokenCallDto {
  post_id: string
  // ... optional fields for updates
}
```

### 3. **Updated PostController** (`src/controllers/postController.ts`)
New methods for token call management:
- `createTokenCall()` - Create token call posts
- `getTokenCalls()` - Get token calls with filtering
- `getTrendingTokenCalls()` - Most popular token calls
- `updateTokenCall()` - Update token metadata
- `markTokenAsLaunched()` - Mark tokens as launched
- `searchTokenCalls()` - Search functionality
- `getTokenCallByAddress()` - Get by contract address

### 4. **Enhanced Routes** (`src/routes/posts.route.ts`)
```typescript
// Public routes
router.get('/token-calls', getTokenCalls)
router.get('/token-calls/trending', getTrendingTokenCalls)
router.get('/token-calls/search', searchTokenCalls)
router.get('/token-calls/address/:token_address', getTokenCallByAddress)

// Protected routes
router.post('/token-calls', createTokenCall)
router.patch('/token-calls', updateTokenCall)
router.patch('/token-calls/launch', markTokenAsLaunched)
```

## API Examples

### Create Token Call
```bash
POST /api/posts/token-calls
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "🚀 New DeFi token launching soon! $NEWTOKEN",
  "token_name": "New Token",
  "token_symbol": "NEWTOKEN",
  "token_address": "0x123...abc",
  "chain_type": "solana",
  "target_price": 1.0,
  "website": "https://newtoken.com",
  "twitter": "@newtoken",
  "description": "Revolutionary DeFi protocol"
}
```

### Get Token Calls
```bash
# All token calls
GET /api/posts/token-calls

# Filter by chain
GET /api/posts/token-calls?chain_type=solana

# Filter by launch status
GET /api/posts/token-calls?is_launched=false

# Trending token calls
GET /api/posts/token-calls/trending?limit=10
```

### Search Token Calls
```bash
GET /api/posts/token-calls/search?query=defi
```

### Update Token Call
```bash
PATCH /api/posts/token-calls
Authorization: Bearer <token>
Content-Type: application/json

{
  "post_id": "post_123",
  "target_price": 2.0,
  "is_launched": true
}
```

### Mark as Launched
```bash
PATCH /api/posts/token-calls/launch
Authorization: Bearer <token>
Content-Type: application/json

{
  "post_id": "post_123",
  "initial_price": 0.5,
  "launch_date": "2024-01-15T10:00:00Z"
}
```

## Key Features

### 1. **Comprehensive Metadata**
- Token contract details (name, symbol, address)
- Financial data (prices, market cap)
- Social links (website, Twitter, Telegram, Discord)
- Launch tracking (dates, status)

### 2. **Advanced Querying**
- Filter by blockchain network
- Filter by launch status
- Search by token name/symbol
- Trending based on likes
- User-specific token calls

### 3. **Launch Tracking**
- Pre-launch vs launched tokens
- Launch date tracking
- Initial price recording
- Status management

### 4. **Integration with Social Features**
- Likes and comments on token calls
- User profiles and following
- Social discovery and trending

## Data Flow

1. **Token Call Creation**:
   ```
   User → Controller → PostModel (create post) → TokenMetaModel (create metadata) → Response
   ```

2. **Token Call Query**:
   ```
   Request → Controller → TokenMetaModel (with post relations) → Response
   ```

3. **Launch Update**:
   ```
   User → Controller → Verification → TokenMetaModel.markAsLaunched() → Response
   ```

## Benefits of This Architecture

### ✅ **Clean Separation**
- Token calls and fundraising don't interfere
- Specific validation for each use case
- Clear data models

### ✅ **Optimized Performance**
- Dedicated indexes for token queries
- Efficient filtering and searching
- Minimal data fetching

### ✅ **Extensibility**
- Easy to add token-specific features
- Can integrate with DeFi protocols
- Supports multiple blockchains

### ✅ **Type Safety**
- Dedicated DTOs for validation
- Clear interfaces for each operation
- Compile-time error checking

## Next Steps

1. **Run Prisma Generation**: `npx prisma generate` to update client
2. **Database Migration**: `npx prisma db push` to create tables
3. **Testing**: Test all endpoints with sample data
4. **Integration**: Connect with existing social features
5. **Enhancement**: Add real-time price tracking integration

## Migration from Shared Table

If you were to use a shared metadata table instead:

### Pros:
- Single table to maintain
- Unified metadata querying

### Cons:
- Mixed concerns in one table
- Complex validation logic
- Performance overhead
- Less type safety
- Harder to optimize

The separate table approach provides better maintainability, performance, and extensibility for your token call infrastructure. 