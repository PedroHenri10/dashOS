-- Rollback
-- Revert column prazo_estimado to preco_estimado on table TipoServico and restore type to DECIMAL(10,2)
ALTER TABLE "TipoServico" ALTER COLUMN "prazo_estimado" TYPE DECIMAL(10,2) USING NULL;
ALTER TABLE "TipoServico" RENAME COLUMN "prazo_estimado" TO "preco_estimado";
