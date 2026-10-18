-- Rollback
DROP INDEX IF EXISTS "Cliente_cpf_cnpj_hash_key";
ALTER TABLE "Cliente" DROP COLUMN IF EXISTS "cpf_cnpj_hash";
