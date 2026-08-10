# ─────────────────────────────────────────────────────────────
#  Le Ville Pet — container de produção
#  Build multi-estágio: compila o Vite e serve os estáticos no nginx
# ─────────────────────────────────────────────────────────────

# Estágio 1 — build
FROM node:20-alpine AS build
WORKDIR /app

# Instala ferramentas essenciais
RUN apk add --no-cache curl bash

COPY package.json bun.lock* package-lock.json* ./
RUN npm ci

COPY . .

# Variáveis de build injetadas em runtime (não há segredos no build público)
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_PUBLISHABLE_KEY=""
# Se vazias, o vite.config aplica os valores públicos padrão do projeto.
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

RUN npm run build

# Estágio 2 — serve estático
FROM nginx:alpine AS production

# Configuração do nginx com fallback SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Certificados e páginas de erro (opcional)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 7070

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:7070/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
