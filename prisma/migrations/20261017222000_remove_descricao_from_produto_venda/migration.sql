-- AlterTable
-- Remove redundant and unused descricao column from ProdutoVenda table
-- NOTE: In production, ensure no ad-hoc reporting scripts or external tools depend on this column before executing.
ALTER TABLE "ProdutoVenda" DROP COLUMN "descricao";
