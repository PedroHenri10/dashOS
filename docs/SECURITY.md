# Segurança Operacional

## Secrets no ambiente

Use `.env` apenas localmente e configure secrets por variáveis protegidas no ambiente de deploy. O arquivo `.env` está no `.gitignore`; `.env.example` contém apenas placeholders.

Se um secret real foi exposto, considere-o comprometido e faça a rotação no provedor antes de limpar o histórico.

## Procurar secrets no Git

```powershell
git log --all --full-history -- .env
git log --all -S"admin123" --oneline
git log --all -G"JWT_SECRET|DATABASE_URL|BEGIN .* PRIVATE KEY" --oneline -- .
```

Também revise arquivos alterados antes de publicar:

```powershell
git diff --cached
git grep -n -I -E "(password|senha|secret|api[_-]?key|BEGIN .* PRIVATE KEY)"
```

## Remover secrets já commitados

Remover o arquivo no commit atual não apaga cópias antigas. Para reescrever o histórico, prefira `git filter-repo` ou BFG Repo-Cleaner. Faça um backup e combine a operação com todos os colaboradores.

Exemplo com `git filter-repo`:

```powershell
git clone --mirror URL_DO_REPOSITORIO
cd repositorio.git
git filter-repo --path .env --invert-paths
git push --force --mirror
```

Para substituir um valor que apareceu em arquivos históricos:

```powershell
git filter-repo --replace-text replacements.txt
```

O arquivo `replacements.txt` deve conter o secret a substituir e o texto seguro, conforme a sintaxe da ferramenta.

Depois da limpeza:

1. Revogue e gere novamente todos os secrets expostos.
2. Avise os colaboradores para clonarem novamente ou sincronizarem com cuidado.
3. Verifique o histórico com `git log --all -S"VALOR_EXPOSTO"`.
4. Instale secret scanning/pre-commit no CI.
5. Nunca faça commit de `.env`, tokens, senhas ou chaves privadas.

A limpeza do histórico altera hashes de commits e pode exigir atualização forçada do repositório remoto. Não execute `push --force` sem confirmar o repositório e a equipe envolvidos.
