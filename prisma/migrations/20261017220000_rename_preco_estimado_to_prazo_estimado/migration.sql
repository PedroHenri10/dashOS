-- AlterTable
-- Rename column preco_estimado to prazo_estimado on table TipoServico
-- Preserves DECIMAL(10,2) type, existing records, constraints and indices without data loss
ALTER TABLE "TipoServico" RENAME COLUMN "preco_estimado" TO "prazo_estimado";
