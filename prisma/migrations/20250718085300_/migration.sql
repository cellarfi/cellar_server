-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ACTIVE', 'SIGNED_OUT', 'REVOKED');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('REGULAR', 'TOKEN_CALL', 'DONATION');

-- CreateEnum
CREATE TYPE "FundraisingStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "tag_name" TEXT NOT NULL,
    "profile_picture_url" TEXT,
    "about" TEXT,
    "referral_code" TEXT NOT NULL,
    "referred_by" TEXT,
    "tag_name_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "chain_type" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "expo_push_token" VARCHAR(500) NOT NULL,
    "platform" TEXT NOT NULL,
    "device_name" TEXT,
    "os_version" TEXT,
    "app_version" TEXT,
    "device_model" TEXT,
    "agent" TEXT,
    "ip_address" TEXT,
    "country" TEXT,
    "city" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_seen_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address_book" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT,
    "network" TEXT NOT NULL DEFAULT 'solana',
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "address_book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "user_id" TEXT,
    "post_type" "PostType" NOT NULL DEFAULT 'REGULAR',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funding_meta" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "target_amount" DECIMAL(18,8) NOT NULL,
    "current_amount" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "wallet_address" TEXT NOT NULL,
    "chain_type" TEXT NOT NULL,
    "token_symbol" TEXT,
    "token_address" TEXT,
    "deadline" TIMESTAMPTZ,
    "status" "FundraisingStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "funding_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_meta" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "token_name" TEXT NOT NULL,
    "token_symbol" TEXT NOT NULL,
    "token_address" TEXT NOT NULL,
    "logo_url" TEXT,
    "chain_type" TEXT NOT NULL,
    "launch_date" TIMESTAMPTZ,
    "initial_price" DECIMAL(18,8),
    "target_price" DECIMAL(18,8),
    "market_cap" DECIMAL(18,2),
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "token_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "donor_user_id" TEXT,
    "amount" DECIMAL(18,8) NOT NULL,
    "token_symbol" TEXT NOT NULL DEFAULT 'SOL',
    "transaction_id" TEXT,
    "wallet_address" TEXT NOT NULL,
    "message" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_likes" (
    "id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "comment_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tips" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tipper_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follower" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "follower_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Follower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "followers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "follower_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "followers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_tag_name_key" ON "users"("tag_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- CreateIndex
CREATE INDEX "users_id_tag_name_display_name_idx" ON "users"("id", "tag_name", "display_name");

-- CreateIndex
CREATE INDEX "users_referral_code_idx" ON "users"("referral_code");

-- CreateIndex
CREATE INDEX "users_referred_by_idx" ON "users"("referred_by");

-- CreateIndex
CREATE INDEX "wallets_user_id_chain_type_idx" ON "wallets"("user_id", "chain_type");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_chain_type_address_key" ON "wallets"("user_id", "chain_type", "address");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_device_id_key" ON "sessions"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_expo_push_token_key" ON "sessions"("expo_push_token");

-- CreateIndex
CREATE INDEX "sessions_user_id_device_id_status_idx" ON "sessions"("user_id", "device_id", "status");

-- CreateIndex
CREATE INDEX "sessions_user_id_status_last_seen_at_idx" ON "sessions"("user_id", "status", "last_seen_at");

-- CreateIndex
CREATE INDEX "address_book_user_id_name_idx" ON "address_book"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "address_book_user_id_address_name_key" ON "address_book"("user_id", "address", "name");

-- CreateIndex
CREATE UNIQUE INDEX "funding_meta_post_id_key" ON "funding_meta"("post_id");

-- CreateIndex
CREATE INDEX "funding_meta_post_id_idx" ON "funding_meta"("post_id");

-- CreateIndex
CREATE INDEX "funding_meta_status_idx" ON "funding_meta"("status");

-- CreateIndex
CREATE UNIQUE INDEX "token_meta_post_id_key" ON "token_meta"("post_id");

-- CreateIndex
CREATE INDEX "token_meta_post_id_idx" ON "token_meta"("post_id");

-- CreateIndex
CREATE INDEX "token_meta_token_address_idx" ON "token_meta"("token_address");

-- CreateIndex
CREATE INDEX "token_meta_chain_type_idx" ON "token_meta"("chain_type");

-- CreateIndex
CREATE INDEX "donations_post_id_idx" ON "donations"("post_id");

-- CreateIndex
CREATE INDEX "donations_donor_user_id_idx" ON "donations"("donor_user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_fkey" FOREIGN KEY ("referred_by") REFERENCES "users"("referral_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address_book" ADD CONSTRAINT "address_book_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding_meta" ADD CONSTRAINT "funding_meta_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_meta" ADD CONSTRAINT "token_meta_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donor_user_id_fkey" FOREIGN KEY ("donor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tips" ADD CONSTRAINT "tips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tips" ADD CONSTRAINT "tips_tipper_id_fkey" FOREIGN KEY ("tipper_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follower" ADD CONSTRAINT "Follower_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
