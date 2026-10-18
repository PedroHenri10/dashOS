-- AlterTable
-- Add estoque_minimo column to Produto table with a safe default value of 0, matching estoque_atual type (INTEGER)
ALTER TABLE "Produto" ADD COLUMN "estoque_minimo" INTEGER NOT NULL DEFAULT 0;
