# Migração Lovable Cloud → Supabase self-hosted no Dokploy

## Visão geral

Este roteiro substitui o backend **Lovable Cloud** (Supabase gerenciado) por uma instância **Supabase self-hosted** rodando no mesmo Dokploy do seu site.

> ⚠️ **Atenção**: desconectar o Lovable Cloud é irreversível e apaga os dados do Cloud. Faça backup em `/admin/backup` antes de começar.

---

## 1. Subir o Supabase no Dokploy

1. No Dokploy, crie um **novo serviço** via Docker Compose.
2. Faça upload do arquivo `supabase-compose.yml`.
3. Crie um arquivo `.env` no serviço com os valores de `supabase/.env.example`.
4. Crie a rede externa no servidor do Dokploy:
   ```bash
   docker network create supabase-network
   ```
5. Configure os domínios no Dokploy para apontar para o serviço Supabase:
   - `supabase.seu-dominio.com.br` → porta `8000` (Kong)
   - `studio.seu-dominio.com.br` → porta `3001` (Studio)
6. Inicie o serviço e aguarde todos os containers ficarem `healthy`.

### Gerar as chaves JWT/Anon/Service

Você precisa gerar as chaves `ANON_KEY` e `SERVICE_ROLE_KEY` manualmente. Use o helper do Supabase ou qualquer gerador JWT com a chave `JWT_SECRET`:

- `ANON_KEY`: payload `{ "role": "anon" }`
- `SERVICE_ROLE_KEY`: payload `{ "role": "service_role" }`

Atualize o `.env` com os valores gerados e reinicie o serviço.

---

## 2. Configurar o banco no novo Supabase

1. Acesse o Supabase Studio: `https://studio.seu-dominio.com.br/project/default`
2. Crie a role `anon` e `authenticated` (os scripts do Supabase já fazem isso, mas confirme).
3. Copie a estrutura do banco atual:
   - Tabelas: `site_config`, `home_sections`, `nav_items`, `photos`, `videos`, `video_likes`, `albums`, `album_items`, `vagas`, `hotelzinho_content`, `transporte_content`, `conhecer_content`, `guia_articles`, `hoje_no_le_ville`, `user_roles`.
   - Funções: `has_role`, `admin_list_tables`, `auto_publish_scheduled_media`, `update_updated_at_column`.
   - Triggers e policies (RLS) de cada tabela.
   - Bucket `levillepet-media` no Storage.
   - Edge functions: `admin-gate`, `mcp` (se forem usar).

> Dica: exporte o schema do Lovable Cloud via SQL Editor (Dump schema) e aplique no novo banco.

---

## 3. Migrar os dados

1. Acesse `/admin/backup` no site atual e gere o backup `.zip`.
2. O ZIP contém:
   - `data/*.json` → registros de todas as tabelas
   - `storage/levillepet-media/*` → arquivos de mídia
3. Descompacte o backup localmente.
4. Use um script para importar os JSONs para o novo Supabase. Exemplo:
   ```bash
   npx tsx scripts/migrate-to-supabase.ts \
     --url https://supabase.seu-dominio.com.br \
     --anon SUA_ANON_KEY \
     --service SUA_SERVICE_ROLE_KEY \
     --backup ./caminho/do/backup
   ```
5. Faça upload dos arquivos do storage para o bucket `levillepet-media` no novo Supabase.

---

## 4. Reconfigurar o projeto front-end

1. Atualize o `.env` do projeto Lovable:
   ```env
   VITE_SUPABASE_URL=https://supabase.seu-dominio.com.br
   VITE_SUPABASE_PUBLISHABLE_KEY=SUA_ANON_KEY
   VITE_SUPABASE_PROJECT_ID=seu-dominio-no-dokploy
   ```
2. Nos edge functions do projeto, atualize as variáveis de ambiente para apontar para o novo Supabase.
3. Faça commit e push para o GitHub.
4. No Dokploy, faça o **redeploy** do serviço `levillepet`.

---

## 5. Testar antes de desconectar o Lovable Cloud

- Acesse o site publicado e verifique se tudo carrega.
- Teste login no admin, uploads, backup e exibição de fotos/vídeos.
- Se algo falhar, você ainda pode voltar ao `.env` antigo do Lovable Cloud.

---

## 6. Desconectar o Lovable Cloud

> Só faça isso após confirmar que o novo Supabase está funcionando perfeitamente.

1. Em Lovable, vá em **Cloud → Advanced → Disconnect**.
2. Aviso: isso apaga o banco, storage e functions do Lovable Cloud.
3. O projeto continua usando o seu Supabase self-hosted.

---

## 7. Manutenção futura

- Backups do banco: configure dump automático do PostgreSQL no servidor.
- Storage: mantenha o backup do S3/MinIO.
- Atualizações: acompanhe as releases oficiais do Supabase e atualize as imagens no `supabase-compose.yml`.

---

## Problemas comuns

### Domínio não resolve
- Confirme que o DNS aponta para o servidor do Dokploy e que o Traefik está configurado.

### Kong retorna 404
- Verifique se o `KONG_DECLARATIVE_CONFIG` está mapeado corretamente e se o arquivo `supabase/volumes/kong.yml` existe.

### Storage não sobe
- Confirme as variáveis S3. Se quiser usar storage local, mude `STORAGE_BACKEND` para `file` e remova as variáveis S3.

### Auth não funciona
- Confirme que `JWT_SECRET` usada para gerar `ANON_KEY` e `SERVICE_ROLE_KEY` é exatamente a mesma configurada no `gotrue` e `postgrest`.

## Importar o backup no novo Supabase

1. Gere o backup em `/admin/backup` (baixa um `.zip` com `data/*.json` e `media/`).
2. No seu computador, com o projeto clonado:

```bash
SUPABASE_URL=https://api.seu-dominio.com \
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key \
STORAGE_BUCKET=levillepet-media \
npm run import:backup -- ./backup-levillepet.zip
```

O script importa as tabelas na ordem correta (pais antes dos filhos), usa `upsert` por `id`
(pode rodar de novo sem duplicar) e envia as mídias para o bucket, criando-o se não existir.

## Arquivos de inicialização (criados no projeto)

- `supabase/volumes/kong.yml` — roteamento do gateway (`/auth/v1`, `/rest/v1`, `/storage/v1`, `/realtime/v1`).
- `supabase/volumes/db/init/00-roles.sql` — roles `anon`, `authenticated`, `service_role`, `authenticator` e extensões.
- `supabase/volumes/db/init/01-schema.sql` — todas as tabelas do site, RLS, GRANTs, triggers de `updated_at`,
  a função `auto_publish_scheduled_media()` e o agendamento por `pg_cron`.

Os dois SQL rodam sozinhos na **primeira** subida do container do banco (volume vazio).
Se precisar reexecutar, apague o volume `supabase-db-data` e suba de novo.

## Ordem recomendada

1. `docker network create supabase-network` no servidor.
2. Preencher o `.env` a partir de `supabase/.env.example` (senha forte, `JWT_SECRET` com 32+ caracteres,
   `ANON_KEY` e `SERVICE_ROLE_KEY` gerados a partir desse mesmo `JWT_SECRET`).
3. Subir `supabase-compose.yml` no Dokploy e apontar o domínio da API para a porta do Kong (8000).
4. Criar o usuário admin no Studio e inserir a linha correspondente em `user_roles` com o papel `admin`.
5. Gerar o backup em `/admin/backup` e rodar `npm run import:backup -- backup.zip`.
6. Atualizar `.env` do site com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` novos e refazer o deploy.

> As Edge Functions (`admin-gate`) não fazem parte desta stack. No self-hosted é preciso subir o
> `supabase/edge-runtime` à parte ou substituir a validação do código por uma função no banco.
