# 📚 Documentação Velura

Este diretório contém a documentação técnica do projeto.

## 📂 Arquivos

- **[architecture-decisions.md](architecture-decisions.md)** - ADRs (Architecture Decision Records) com justificativas técnicas
- **[architecture.md](architecture.md)** - Visão geral da arquitetura e fluxo de dados
- **[refactor-case-study.md](refactor-case-study.md)** - Estudo de caso da migração Vite → Next.js

## 🏗️ Arquitetura

O projeto segue **Clean Architecture** com estrutura baseada em **features/domínios**:

```
src/
├── app/              # Next.js App Router
├── features/         # Módulos de negócio
│   ├── auth/
│   ├── code-generation/
│   ├── projects/
│   └── landing-builder/
├── shared/           # Código compartilhado
│   ├── components/ui/
│   ├── hooks/
│   ├── lib/
│   └── styles/
└── types/            # Tipos globais
```

## 📝 Convenções

- **Imports**: Use aliases `@/` configurados no `tsconfig.json`
- **Componentes**: PascalCase para componentes React
- **Hooks**: Sempre começam com `use`
- **Tipos**: Defina tipos locais em cada feature, globais em `src/types`

