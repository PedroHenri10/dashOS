/*
  Warnings:

  - A unique constraint covering the columns `[serie_imei]` on the table `Equipamento` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cod_etiqueta]` on the table `Equipamento` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nome]` on the table `TipoServico` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Equipamento_serie_imei_key" ON "Equipamento"("serie_imei");

-- CreateIndex
CREATE UNIQUE INDEX "Equipamento_cod_etiqueta_key" ON "Equipamento"("cod_etiqueta");

-- CreateIndex
CREATE UNIQUE INDEX "TipoServico_nome_key" ON "TipoServico"("nome");
