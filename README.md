# Velura Code Generator (AI Platform)

[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Edge_Functions-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![DeepSeek](https://img.shields.io/badge/AI-DeepSeek_R1-purple.svg)](https://deepseek.com/)

> **Engine de geração de interfaces React via IA, focado em resolver problemas de latência e timeouts em ambientes Serverless.**

O **Velura Code** é uma Prova de Conceito (POC) de engenharia de software desenhada para contornar um problema real da integração com LLMs modernas: o tempo de resposta. Enquanto o DeepSeek R1 gera código complexo (processo que leva >30s), a arquitetura do Velura mantém a UI responsiva utilizando processamento assíncrono e Edge Functions.

---

## 🏗️ Destaques de Engenharia

Diferente de wrappers simples de API, este projeto foca na robustez da entrega técnica:

* **Arquitetura "AI-Middleware":** Offloading da comunicação com a LLM para **Supabase Edge Functions**, evitando o bloqueio da thread principal do navegador e timeouts de requisições HTTP padrão.
* **Feature-Sliced Design (FSD):** Estrutura de pastas escalável (`features/`, `shared/`, `entities/`) facilitando a manutenção e desacoplamento de módulos.
* **Integridade de Dados:** Validação rigorosa de output da IA com **Zod**. Se a LLM alucinar um JSON inválido, a camada de serviço intercepta e trata o erro antes de quebrar a UI.
* **Feedback Progressivo:** UX otimizada para operações longas, exibindo logs de processamento em tempo real ("Thinking Process") para o usuário.

---

## 📚 Documentação Técnica

Este repositório serve como um laboratório de arquitetura. Detalhes profundos das decisões estão documentados na pasta `/docs`:

* [📐 **Arquitetura do Sistema**](./docs/architecture.md) - Fluxo de dados (Client → Next.js → Supabase → DeepSeek).
* [🧠 **ADRs (Architecture Decision Records)**](./docs/architecture-decisions.md) - Por que migrei de Vite para Next.js? Por que Vitest?
* [🔄 **Estudo de Caso: Refatoração**](./docs/refactor-case-study.md) - Lições aprendidas na migração de SPA para SSR.

---

## 🚀 Como Rodar Localmente

Como este projeto é uma demonstração técnica conectada a serviços cloud (Supabase), siga os passos para configurar o ambiente:

### 1. Instalação
```bash
# Clone o repositório
git clone https://github.com/SEU-USUARIO/velura-platform.git

# Instale as dependências
npm install
```

### 2. Variáveis de Ambiente
Copie o arquivo de exemplo e configure suas chaves:

```bash
cp .env.example .env
```

Preencha as chaves necessárias (obtenha em DeepSeek Platform e Supabase Dashboard):

```env
# Conexão com Supabase (Backend & Auth)
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key_publica
SUPABASE_SERVICE_ROLE_KEY=sua_key_service_role (Opcional, admin)

# Inteligência Artificial
DEEPSEEK_API_KEY=sk-sua-chave-deepseek
```

### 3. Execução
```bash
# Roda o servidor de desenvolvimento (Next.js App Router)
npm run dev

# Roda os testes unitários (Vitest)
npm run test
```

Acesse http://localhost:3000 para ver a aplicação.

## 🛠️ Stack Tecnológica
Core: Next.js 14 (App Router), React, TypeScript.

Estilização: Tailwind CSS + Shadcn/UI.

Backend & Infra: Supabase (Auth, Database, Edge Functions).

AI Engine: DeepSeek API (Model: deepseek-coder/R1).

Qualidade: ESLint, Prettier, Husky, Zod, Vitest.

⚠️ Disclaimer
Este é um projeto de Portfólio de Engenharia. O foco principal é a demonstração de arquitetura de software, padrões de projeto e integração de sistemas complexos. Embora funcional, ele opera em ambiente local (conectado à nuvem) para fins de estudo e análise de código.

Desenvolvido por Gabriel Machado 👨‍💻
