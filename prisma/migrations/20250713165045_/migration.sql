/*
  Warnings:

  - The `hashtag` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "hashtag",
ADD COLUMN     "hashtag" JSONB;
