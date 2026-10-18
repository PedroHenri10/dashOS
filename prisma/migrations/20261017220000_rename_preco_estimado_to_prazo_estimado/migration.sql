-- AlterTable
-- Rename column preco_estimado to prazo_estimado on table TipoServico and alter type to DATE
ALTER TABLE "TipoServico" RENAME COLUMN "preco_estimado" TO "prazo_estimado";
ALTER TABLE "TipoServico" ALTER COLUMN "prazo_estimado" TYPE DATE USING ("prazo_estimado"::text::date);
