/*
  Warnings:

  - The `videoName` column on the `Publication` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `imageUser` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Publication" DROP COLUMN "videoName",
ADD COLUMN     "videoName" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "imageUser",
ADD COLUMN     "imageName" JSONB[] DEFAULT ARRAY[]::JSONB[];
