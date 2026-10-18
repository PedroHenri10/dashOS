-- Rollback
-- Revert column prazo_estimado to preco_estimado on table TipoServico
ALTER TABLE "TipoServico" RENAME COLUMN "prazo_estimado" TO "preco_estimado";
