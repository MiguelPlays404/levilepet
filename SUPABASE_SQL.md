# SQL — Rodar no Supabase SQL Editor

## 1. Tabela `hoje_no_le_ville`

```sql
CREATE TABLE IF NOT EXISTS hoje_no_le_ville (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text,
  description     text,
  media_url       text NOT NULL,
  media_type      text NOT NULL DEFAULT 'image',  -- 'image' ou 'video'
  orientation     text NOT NULL DEFAULT 'horizontal', -- 'horizontal' ou 'vertical'
  published_at    timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz,                    -- NULL = nunca expira
  is_active       boolean NOT NULL DEFAULT true,
  display_order   integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Índice para a query de filtragem por tempo (performance)
CREATE INDEX idx_hoje_le_ville_schedule
  ON hoje_no_le_ville (published_at, expires_at)
  WHERE is_active = true;

-- RLS: leitura pública, escrita só autenticado
ALTER TABLE hoje_no_le_ville ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública hoje_no_le_ville"
  ON hoje_no_le_ville FOR SELECT
  USING (true);

CREATE POLICY "Escrita autenticada hoje_no_le_ville"
  ON hoje_no_le_ville FOR ALL
  USING (auth.role() = 'authenticated');
```

## 2. Coluna `orientation` na tabela `videos` (existente)

```sql
ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS orientation text NOT NULL DEFAULT 'horizontal';
```

## 3. Coluna `orientation` na tabela `photos` (existente, para futuro)

```sql
ALTER TABLE photos
  ADD COLUMN IF NOT EXISTS orientation text NOT NULL DEFAULT 'horizontal';
```
