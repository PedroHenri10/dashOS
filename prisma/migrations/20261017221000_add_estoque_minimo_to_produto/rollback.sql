-- Rollback
-- Remove estoque_minimo column from Produto table
ALTER TABLE "Produto" DROP COLUMN "estoque_minimo";
