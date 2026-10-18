INSERT INTO "TipoOS" ("nome", "descricao")
VALUES ('Orçamento', 'Ordem de orçamento')
ON CONFLICT ("nome") DO NOTHING;

INSERT INTO "TipoOS" ("nome", "descricao")
VALUES ('Serviço Agendado', 'Serviço agendado sem orçamento')
ON CONFLICT ("nome") DO NOTHING;

INSERT INTO "StatusOS" ("nome", "descricao", "ordem_fluxo", "terminal")
VALUES
  ('Aberta', 'Solicitação aberta', 1, false),
  ('Em Diagnóstico', 'Em análise técnica', 2, false),
  ('Aguardando Aprovação', 'Aguardando aprovação do cliente', 3, false),
  ('Aguardando Peças', 'Aguardando peças para execução', 3, false),
  ('Em Execução', 'Serviço em andamento', 4, false),
  ('Concluída', 'Serviço concluído', 5, true),
  ('Cancelada', 'Serviço cancelado', 5, true)
ON CONFLICT ("nome") DO NOTHING;
