# Arquitetura do Sistema - Velura Code Generator

## 📊 Visão Geral do Fluxo

```
┌─────────────┐
│   Cliente   │ (Browser)
│   Next.js   │
└──────┬──────┘
       │
       │ 1. User types prompt: "make a landing page for a gym"
       ▼
┌──────────────────────────────────────────────────────┐
│  Frontend: src/app/page.tsx                          │
│  ou: src/app/project/[id]/page.tsx                   │
│                                                       │
│  useCodeGenerator hook → CodeGenerationService       │
└──────┬───────────────────────────────────────────────┘
       │
       │ 2. POST /api/generate-code { prompt: "..." }
       ▼
┌──────────────────────────────────────────────────────┐
│  Backend API Route (Next.js Edge Runtime)            │
│  src/app/api/generate-code/route.ts                  │
│                                                       │
│  ├─ Rate Limiting (10 requests/10min)                │
│  ├─ Schema Validation (Zod)                          │
│  └─ Calls DeepSeek API                               │
└──────┬───────────────────────────────────────────────┘
       │
       │ 3. callDeepSeekAPI(prompt)
       ▼
┌──────────────────────────────────────────────────────┐
│  DeepSeek Client                                     │
│  src/features/code-generation/api/deepseek-client.ts │
│                                                       │
│  System Prompt + User Prompt → DeepSeek API          │
└──────┬───────────────────────────────────────────────┘
       │
       │ 4. DeepSeek API Response (may contain markdown/text)
       ▼
┌──────────────────────────────────────────────────────┐
│  JSON Parser & Sanitizer                             │
│  src/features/code-generation/utils/json-parser.ts   │
│                                                       │
│  ├─ sanitizeAIResponse() - Remove markdown/text      │
│  ├─ JSON.parse()                                     │
│  ├─ ensureEssentialFiles() - Add fallbacks           │
│  └─ Returns: Record<string, string>                  │
└──────┬───────────────────────────────────────────────┘
       │
       │ 5. { "index.html": "...", "src/App.tsx": "..." }
       ▼
┌──────────────────────────────────────────────────────┐
│  Frontend State Management                           │
│  useCodeGenerator hook                               │
│                                                       │
│  ├─ Updates files state                              │
│  └─ Triggers IframePreview re-render                 │
└──────┬───────────────────────────────────────────────┘
       │
       │ 6. Files → Preview
       ▼
┌──────────────────────────────────────────────────────┐
│  Preview Component                                   │
│  src/features/code-generation/components/            │
│  IframePreview.tsx                                   │
│                                                       │
│  ├─ Extracts JSX from components                     │
│  ├─ Converts JSX → HTML                              │
│  ├─ Injects Tailwind CSS (inline)                    │
│  └─ Renders in <iframe>                              │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 Histórico de Migrações

### Fase 1: Supabase Edge Functions
**Antes**: A geração estava no Supabase
- Edge Function: `supabase/functions/generate-code/index.ts`
- Cliente chamava: `supabase.functions.invoke('generate-code')`

### Fase 2: Frontend Direto (REMOVIDO)
**Tentativa**: Chamar DeepSeek direto do cliente
- ❌ Problema: Exposição de API Keys
- ❌ Problema: CORS issues

### Fase 3: Next.js API Routes (ATUAL)
**Agora**: Backend próprio no Next.js
- ✅ API Route: `/api/generate-code`
- ✅ Rate Limiting no servidor
- ✅ API Key protegida no servidor
- ✅ Edge Runtime para performance

---

## 📁 Estrutura de Arquivos Chave

```
src/
├── app/
│   ├── api/
│   │   └── generate-code/
│   │       └── route.ts ........................ API Endpoint principal
│   │
│   ├── page.tsx ............................... Home (código antigo com Supabase)
│   └── project/[id]/page.tsx .................. Página de projeto (usa nova API)
│
├── features/code-generation/
│   ├── api/
│   │   └── deepseek-client.ts ................. Chamada à DeepSeek API
│   │
│   ├── components/
│   │   ├── IframePreview.tsx .................. Preview do código gerado
│   │   └── CodeGeneratorForm.tsx .............. Form de input
│   │
│   ├── constants.ts ........................... SYSTEM_PROMPT (regras da IA)
│   │
│   ├── hooks/
│   │   └── useCodeGenerator.ts ................ Hook React para geração
│   │
│   ├── services/
│   │   ├── aiService.ts ....................... Service antigo (Supabase)
│   │   └── code-generation.service.ts ......... Service novo (Next.js API)
│   │
│   └── utils/
│       └── json-parser.ts ..................... Sanitização + Parse
│
└── shared/lib/
    ├── rate-limiter.ts ........................ Rate limiting
    ├── errors.ts .............................. Error classes
    └── supabase/client.ts ..................... Supabase client (legacy)
```

---

## 🛠️ Pontos de Atenção

### ⚠️ Código Duplicado (A Limpar)

1. **aiService.ts** (Legacy - usa Supabase Edge Function)
   - Ainda está sendo usado em `page.tsx` (home)
   - ⚠️ Deve ser substituído por `code-generation.service.ts`

2. **Workspace.tsx**
   - Ainda chama `supabase.functions.invoke('generate-code')`
   - ⚠️ Deve usar o novo endpoint `/api/generate-code`

### ✅ Fluxo Recomendado (Atual)

```typescript
// Frontend (useCodeGenerator.ts)
import { CodeGenerationService } from '../services/code-generation.service';

const files = await CodeGenerationService.generateCode(prompt);
```

```typescript
// Service (code-generation.service.ts)
static async generateCode(prompt: string) {
  const response = await fetch('/api/generate-code', {
    method: 'POST',
    body: JSON.stringify({ prompt })
  });
  
  return response.json().files;
}
```

```typescript
// API Route (route.ts)
const content = await callDeepSeekAPI(prompt);
const files = parseCodeFiles(content);
return Response.json({ files });
```

---

## 🎯 Arquivos Essenciais Garantidos

O sistema **sempre** garante estes arquivos:

```json
{
  "index.html": "Com Tailwind CDN",
  "src/main.tsx": "Entry point React",
  "src/App.tsx": "Componente principal",
  "vite.config.ts": "Config Vite",
  "tsconfig.json": "Config TypeScript",
  "tailwind.config.js": "Config Tailwind",
  "postcss.config.js": "Config PostCSS"
}
```

Se a IA esquecer algum, `ensureEssentialFiles()` adiciona automaticamente.

---

## 🐛 Problemas Resolvidos

### 1. ✅ Tela Branca no Preview
**Causa**: Faltava `index.html` ou `src/main.tsx`
**Solução**: `ensureEssentialFiles()` adiciona fallbacks

### 2. ✅ Tailwind não funciona
**Causa**: Preview não tem build process (PostCSS)
**Solução**: Usar Tailwind CDN no `index.html`

### 3. ✅ JSON com markdown
**Causa**: IA retorna ```json ... ```
**Solução**: `sanitizeAIResponse()` remove markdown

### 4. ✅ GET /src/main.tsx 404
**Causa**: index.html não tinha `<script src="/src/main.tsx">`
**Solução**: Template correto no `ESSENTIAL_FILES`

---

## 🔐 Segurança

- **API Key**: Protegida no servidor (`.env`)
- **Rate Limiting**: 10 requests / 10 minutos por IP
- **Edge Runtime**: Isolado e performático
- **Input Validation**: Zod schema

---

## 📌 Próximos Passos (Recomendado)

1. **Migrar page.tsx** para usar novo endpoint
2. **Remover aiService.ts** (legacy Supabase)
3. **Atualizar Workspace.tsx** para usar `/api/generate-code`
4. **Adicionar testes** para `sanitizeAIResponse()`
5. **Implementar streaming** para preview em tempo real
