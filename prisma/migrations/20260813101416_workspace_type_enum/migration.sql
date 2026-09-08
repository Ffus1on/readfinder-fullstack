/*
  Warnings:

  - Changed the type of `type` on the `Workspace` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "WorkspaceType" AS ENUM ('individual', 'group');

-- AlterTable
ALTER TABLE "Workspace" ALTER COLUMN "type" SET DATA TYPE "WorkspaceType"
USING "type"::"WorkspaceType";
