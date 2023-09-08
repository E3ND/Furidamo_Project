/*
  Warnings:

  - The `imageName` column on the `Publication` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Publication" DROP COLUMN "imageName",
ADD COLUMN     "imageName" JSONB[] DEFAULT ARRAY[]::JSONB[];
