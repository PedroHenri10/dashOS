-- AlterTable
-- Add cpf_cnpj_hash column with unique index for blind search indexing on Cliente
ALTER TABLE "Cliente" ADD COLUMN "cpf_cnpj_hash" TEXT;
CREATE UNIQUE INDEX "Cliente_cpf_cnpj_hash_key" ON "Cliente"("cpf_cnpj_hash");

