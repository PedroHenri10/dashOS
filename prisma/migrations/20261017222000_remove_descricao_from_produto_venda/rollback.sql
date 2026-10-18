-- Rollback
-- Re-add nullable descricao column to ProdutoVenda table
ALTER TABLE "ProdutoVenda" ADD COLUMN "descricao" TEXT;
