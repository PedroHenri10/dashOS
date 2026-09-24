# DashOS API

API backend do DashOS, executada com Fastify, TypeScript, Prisma e PostgreSQL.

## Requisitos

- Node.js 20 ou superior
- npm
- PostgreSQL/Neon configurado em `DATABASE_URL`
- Docker Desktop com WSL 2, caso use Docker

## Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"
JWT_SECRET="uma-chave-secreta"
PORT=3333
NODE_ENV=development
```

Não versionar o arquivo `.env`.

## Executar localmente

Instale as dependências:

```bash
npm install
```

Gere o Prisma Client e aplique as migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

Inicie a API em modo de desenvolvimento:

```bash
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3333
```

Verifique o funcionamento:

```http
GET /health
```

## Executar com Docker

Com o Docker Desktop aberto e o engine Linux funcionando:

```bash
docker compose up --build
```

O Compose gera o Prisma Client, aplica as migrations e inicia a API na porta definida em `PORT`.

Para parar os containers:

```bash
docker compose down
```

## Comandos disponíveis

```bash
npm run dev       # desenvolvimento com watch
npm run build     # compila TypeScript para dist
npm start         # executa a versão compilada
npm test          # executa os testes
npm run coverage  # executa testes com cobertura
```

## Autenticação

Faça login para obter um token:

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "SEU_EMAIL",
  "senha": "SUA_SENHA"
}
```

Use as credenciais do administrador configurado no seu ambiente. Não reutilize credenciais de teste em ambientes de cliente.

Envie o token nas rotas protegidas:

```text
Authorization: Bearer SEU_TOKEN
```

Renove o token:

```http
POST /auth/refresh
Content-Type: application/json
```

```json
{
  "refreshToken": "SEU_REFRESH_TOKEN"
}
```

Consulte o usuário autenticado:

```http
GET /auth/me
```

## Endpoints disponíveis

Todas as rotas abaixo, exceto login, refresh e health, exigem autenticação.

### Usuários

Operações exigem perfil `Administrador`.

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/usuarios` | Lista usuários com filtros e paginação |
| GET | `/usuarios/perfis` | Lista perfis |
| GET | `/usuarios/:id` | Busca usuário por ID |
| POST | `/usuarios` | Cria usuário; sem `perfil_id`, usa `Técnico` |
| PUT | `/usuarios/:id` | Atualiza usuário |
| DELETE | `/usuarios/:id` | Desativa usuário |

### Clientes

As rotas de clientes exigem autenticação. Atualmente, as operações de escrita não exigem perfil de administrador.

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/clientes` | Lista clientes com filtros e paginação |
| GET | `/clientes/:id` | Busca cliente por ID |
| POST | `/clientes` | Cria cliente |
| PUT | `/clientes/:id` | Atualiza cliente |
| DELETE | `/clientes/:id` | Desativa cliente |
| PATCH | `/clientes/:id/reativar` | Reativa cliente |

Filtros disponíveis em `GET /clientes`:

```text
busca, tipo=PF|PJ, ativo=true|false, pagina, limite
```

### Fornecedores

Consultas exigem autenticação. Criação, atualização, desativação e reativação exigem administrador.

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/fornecedores` | Lista fornecedores com filtros e paginação |
| GET | `/fornecedores/:id` | Busca fornecedor por ID |
| POST | `/fornecedores` | Cria fornecedor |
| PUT | `/fornecedores/:id` | Atualiza fornecedor |
| DELETE | `/fornecedores/:id` | Desativa fornecedor |
| PATCH | `/fornecedores/:id/reativar` | Reativa fornecedor |

Filtros disponíveis em `GET /fornecedores`:

```text
busca, ativo=true|false, pagina, limite
```

### Equipamentos

Consultas e listagem de tipos exigem autenticação. Alterações exigem administrador.

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/equipamentos/tipos` | Lista tipos de equipamento |
| POST | `/equipamentos/tipos` | Cria tipo de equipamento |
| GET | `/equipamentos` | Lista equipamentos com filtros e paginação |
| GET | `/equipamentos/:id` | Busca equipamento por ID |
| POST | `/equipamentos` | Cria equipamento |
| PUT | `/equipamentos/:id` | Atualiza equipamento |
| DELETE | `/equipamentos/:id` | Desativa equipamento |
| PATCH | `/equipamentos/:id/reativar` | Reativa equipamento |

Filtros disponíveis em `GET /equipamentos`:

```text
busca, tipo_id, cliente_id, ativo=true|false, pagina, limite
```

### Serviços

O módulo representa o catálogo de tipos de serviço. Consultas exigem autenticação; alterações exigem administrador.

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/servicos` | Lista tipos de serviço com filtros e paginação |
| GET | `/servicos/:id` | Busca tipo de serviço por ID |
| POST | `/servicos` | Cria tipo de serviço |
| PUT | `/servicos/:id` | Atualiza tipo de serviço |
| DELETE | `/servicos/:id` | Desativa tipo de serviço |
| PATCH | `/servicos/:id/reativar` | Reativa tipo de serviço |

Filtros disponíveis em `GET /servicos`:

```text
busca, ativo=true|false, pagina, limite
```

## Respostas e erros

As respostas de sucesso usam o formato da operação. Desativações retornam `204 No Content`.

Erros seguem o formato:

```json
{
  "status": 400,
  "code": 1006,
  "message": "Dados inválidos.",
  "timestamp": "2026-09-23T00:00:00.000Z",
  "path": "/clientes"
}
```

IDs devem ser inteiros positivos. Paginação aceita inteiros positivos e limite máximo de 100.

Registros desativados usam soft delete: continuam no banco com `ativo: false` e podem ser reativados quando o endpoint existir.
