-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "content" DROP NOT NULL;
