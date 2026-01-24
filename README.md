# Velura AI Platform

Plataforma de geração de Landing Pages utilizando IA (DeepSeek), construída com **Next.js 14**, **Clean Architecture** e **Supabase**.

## 🚀 Como Rodar

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# (Adicione suas credenciais no arquivo .env)

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Testes
npm test
```

## 🔐 Variáveis de Ambiente

O projeto requer as seguintes variáveis de ambiente. Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais:

- **NEXT_PUBLIC_SUPABASE_URL** - URL do projeto Supabase
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Chave anônima do Supabase
- **DEEPSEEK_API_KEY** - Chave da API DeepSeek
- **SUPABASE_URL** - URL do Supabase (server-side)
- **SUPABASE_ANON_KEY** - Chave anônima (server-side)
- **SUPABASE_SERVICE_ROLE_KEY** - Chave de serviço (opcional, apenas admin)

Para obter as credenciais:
- Supabase: https://supabase.com/dashboard/project/_/settings/api
- DeepSeek: https://platform.deepseek.com/api_keys

## 🏗️ Arquitetura e Decisões Técnicas

O projeto foi refatorado de uma estrutura SPA (Vite) para Next.js App Router para aproveitar SSR e Edge Functions.

A estrutura segue o padrão de **Feature-Sliced Design** para escalabilidade:

```
src/
├── features/         # Módulos de negócio (auth, code-generation, projects)
├── shared/           # Componentes UI reutilizáveis (shadcn/ui)
├── app/              # Rotas e API (Next.js)
└── types/            # Tipos globais TypeScript
```

Para detalhes profundos sobre as decisões de arquitetura e o processo de refatoração, veja a pasta [/docs](./docs).

## ✨ Tecnologias

- **Core**: Next.js 14, TypeScript, Tailwind CSS
- **IA**: DeepSeek API (via Edge Functions)
- **Backend**: Supabase (Auth & Database)
- **Qualidade**: ESLint, Prettier, Zod (Validação), Vitest

## 📚 Documentação

- [Decisões de Arquitetura](./docs/architecture-decisions.md) - ADRs e justificativas técnicas
- [Arquitetura do Sistema](./docs/architecture.md) - Fluxo de dados e estrutura
- [Estudo de Caso de Refatoração](./docs/refactor-case-study.md) - Migração Vite → Next.js

---

Desenvolvido como projeto de portfólio focado em Engenharia de Software.
