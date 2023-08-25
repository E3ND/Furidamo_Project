/*
  Warnings:

  - The `like` column on the `Comment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deslike` column on the `Comment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `like` column on the `Publication` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deslike` column on the `Publication` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "like",
ADD COLUMN     "like" JSONB[] DEFAULT ARRAY[]::JSONB[],
DROP COLUMN "deslike",
ADD COLUMN     "deslike" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- AlterTable
ALTER TABLE "Publication" DROP COLUMN "like",
ADD COLUMN     "like" JSONB[] DEFAULT ARRAY[]::JSONB[],
DROP COLUMN "deslike",
ADD COLUMN     "deslike" JSONB[] DEFAULT ARRAY[]::JSONB[];
