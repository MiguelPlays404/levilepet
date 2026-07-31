# Relatório de segurança — Le Ville Pet

Auditoria feita em cima do código real (RLS do Supabase, Edge Functions, front-end,
dependências via `npm audit`, headers HTTP). Nada aqui é teórico — cada item foi
verificado no próprio repositório.

---

## 🔴 Ação sua, urgente (não depende de código)

**Senha da conta admin exposta em texto puro no histórico de migrações.**

Arquivo `supabase/migrations/20260530030351_...sql` criava a conta
`laura78marinho@gmail.com` com a senha `PLACEHOLDER_ROTATE_VIA_ADMIN_UI` escrita
direto no SQL. Isso importa porque, com o repositório público no GitHub, qualquer
pessoa que abrir o histórico de migrações vê essa senha — e o gitleaks que vocês
já rodam no CI **não pega esse tipo de coisa**, porque não é um token/API key de
formato conhecido, é uma senha comum dentro de uma função `crypt()`.

**O que eu já fiz:** adicionei a migração `20260730210000_rotate_bootstrap_admin_password.sql`,
que troca a senha dessa conta por um valor aleatório de 32 bytes que ninguém
conhece, assim que for aplicada no banco. Isso fecha a porta tanto no banco atual
quanto em qualquer ambiente novo criado a partir do zero com essas migrações.

**O que só você pode fazer:** depois de aplicar as migrações, entrar de novo nessa
conta só é possível pelo fluxo "Esqueci minha senha" do Supabase Auth (ou definindo
uma senha nova em Authentication → Users no painel). Se você (ou a Laura) ainda
usava a senha antiga pra logar no dia a dia, troque assim que aplicar — senão o
próximo login vai falhar até o reset.

---

## O que eu corrigi no código (nesta entrega)

| # | Onde | O que era o risco | O que fiz |
|---|------|---|---|
| 1 | Migração nova | Senha em texto puro na migração de criação do admin | Nova migração que invalida a senha (ver acima) |
| 2 | `vagas` (RLS) | Policy pública de leitura chamada "active" mas não filtrava `is_active` — vagas encerradas ficavam visíveis via API | Nova migração corrige o `USING` da policy |
| 3 | Edge Function `admin-gate` | CORS aberto (`*`) num endpoint de login/senha | Restrito para `levillepet.com.br` + preview do Lovable + localhost (dev) |
| 4 | `netlify.toml` | Nenhum header de segurança (sem CSP, sem HSTS, sem proteção contra clickjacking) | Adicionei CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` — os domínios da CSP foram levantados direto do código (Supabase, YouTube, Instagram, TikTok, Google Maps, Google Fonts, Unsplash), não é genérico |
| 5 | `index.html` | Script inline no `<head>` obrigaria `'unsafe-inline'` na CSP | Movido para `public/motion-init.js`; CSP `script-src` agora é só `'self'` |
| 6 | `MediaUploader.tsx` | Upload sem limite de tamanho e sem checagem de extensão no cliente | Limite de 100MB + lista de extensões permitidas (imagem/vídeo). A proteção real continua sendo a RLS (só admin escreve no bucket) — isso é uma camada extra |
| 7 | `.gitignore` | `.env` não estava ignorado | Adicionado `.env`/`.env.*` ao `.gitignore` + criado `.env.example` |
| 8 | `.gitleaks.toml` | Não detectava senha em `crypt(...)` | Nova regra customizada `sql-plaintext-password-in-crypt` |
| 9 | `package-lock.json` | Apontava para um espelho npm privado do Lovable (`europe-west4-npm.pkg.dev`) — ninguém fora do sandbox deles conseguiria rodar `npm install` | Regenerado do zero contra o registro público (`registry.npmjs.org`) |
| 10 | Dependências | 20 vulnerabilidades conhecidas (`npm audit`) | Reduzidas para **12** só com a regeneração do lockfile + `npm audit fix` (sem quebrar nada — testei build e testes depois) |
| 11 | `bun.lock` | Mesmo problema do item 9 (espelho privado) | Removido — o `package-lock.json` (npm) é a fonte de verdade agora. Recomendo rodar `bun install` no ambiente de vocês (onde o Bun existe de verdade) pra gerar um `bun.lock` limpo, se quiserem manter os dois |

Testei build (`vite build`), testes (`vitest run`) e lint depois de cada mudança — nada quebrou.

---

## O que fica documentado como risco aceito (não mexi, e por quê)

**12 vulnerabilidades restantes no `npm audit`** — todas exigem upgrade de versão
*major* (breaking change) de ferramentas de build/dev: `vite` (5→8), `eslint` (9→10),
`react-router-dom` (6→7). Eu decidi **não forçar** esses upgrades nesta entrega,
porque:
- A maioria (`esbuild`, `eslint`/`minimatch`/`brace-expansion`) só afeta o
  **servidor de desenvolvimento local** (`npm run dev`), nunca o site publicado —
  ou é ferramenta de lint, que não vai pro navegador do visitante.
- `react-router-dom` 6→7 é o único caso que toca produção (2 CVEs moderados:
  redirecionamento aberto e um problema de hidratação SSR que não se aplica aqui,
  já que o site é 100% client-side). Mas é uma mudança de versão major, com
  potencial de quebrar rotas do site inteiro — e eu não tenho como testar
  visualmente contra o Supabase real de vocês.

**Minha recomendação:** peçam pra alguém do time (ou peçam pra mim numa próxima
conversa, com tempo pra testar) fazer esse upgrade específico do react-router-dom
em um ambiente de staging antes de ir pra produção. Regra de ouro: nunca aceitar
um "conserto automático" de dependência crítica sem testar — inclusive esse é um
princípio que eu seguiria mesmo se vocês pedissem pra forçar.

**`@lovable.dev/mcp-js` → `@hono/node-server` (moderado, sem correção disponível
ainda)** — é uma vulnerabilidade específica de Windows no servidor de dev local
do MCP, não é usada em produção (o Deno da Supabase Edge Function busca sua
própria cópia direto do `npm:` specifier, não usa o `node_modules` do build).
Risco real: baixo. Vou continuar de olho — quando a correção sair upstream, aviso.

---

## O que já estava bem feito (não é "elogio fácil" — é real)

Pra vocês entenderem o tamanho do trabalho que já existia antes de mim:
- RLS já tinha sido corrigida de "qualquer um edita" pra "só admin edita" em
  praticamente todas as tabelas (dava pra ver isso na própria sequência de
  migrações — alguém já fez esse trabalho de reforço).
- `admin-gate` já tinha bloqueio progressivo de tentativas de login (6 → 30s →
  60s → 15min) e log de auditoria — nível de robustez que muita empresa grande
  não tem.
- `service_role` key nunca aparece no front-end, só via variável de ambiente
  na Edge Function — do jeito certo.
- `CodeShield.tsx` já é honesto no próprio comentário: "nenhum site pode impedir
  totalmente o DevTools... a proteção real continua sendo o RLS". Concordo 100%.

---

## Próximos passos recomendados (não fiz agora, mas vale considerar)

1. **Rotacionar a senha do admin** (ver seção urgente no topo) — assim que aplicar as migrações.
2. Configurar no painel do Supabase (Storage → bucket `levillepet-media`) um
   limite de tamanho de arquivo e tipos MIME permitidos **no nível do bucket**
   — meu limite no `MediaUploader.tsx` é só client-side, é bom ter a mesma
   trava no servidor também.
3. Testar o upgrade do `react-router-dom` para a versão 7 em staging.
4. Rodar `bun install` no ambiente de vocês pra recriar o `bun.lock` limpo, se
   quiserem manter os dois gerenciadores de pacote.

---

## Uma observação fora do escopo de segurança

Notei que `src/lib/socialStats.ts` gera números de visualizações/curtidas
**sempre acima de um piso fixo** (1,7 milhão de views, 4,8 milhões de likes),
independente do valor real, pra mostrar na vitrine pública. Isso não é uma
falha de segurança — é uma escolha de produto — mas como estatística inflada
pode esbarrar em publicidade enganosa (CDC), fica registrado aqui só pra vocês
decidirem com essa informação na mão. Não mexi nesse arquivo.
