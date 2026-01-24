# Migration Guide: Vite + Express → Next.js 14

## Package.json Updates Required

### Add New Dependencies
```bash
npm install @t3-oss/env-nextjs server-only
```

### Remove Unused Dependencies
```bash
npm uninstall @vitejs/plugin-react-swc vite lovable-tagger
```

### Update next.config.js
Create/update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    domains: ['images.unsplash.com'],
  },
};

module.exports = nextConfig;
```

## Migration Checklist

- [x] Create feature-based folder structure
- [x] Setup Zod validation for environment variables
- [x] Migrate Express backend to API Routes
- [x] Create Service Layer pattern
- [x] Extract business logic to custom hooks
- [x] Setup comprehensive testing
- [x] Create Docker configuration
- [x] Write technical README
- [ ] Remove legacy Vite artifacts
- [ ] Delete setup-deepseek.bat and .sh files
- [ ] Remove velura-backend/ folder (deprecated)

## Files to Delete

```bash
rm setup-deepseek.bat
rm setup-deepseek.sh
rm DEBUG_STATUS.md
rm DEPLOY_SUCCESS.md
rm SETUP_EDGE_FUNCTION.md
rm -rf velura-backend/
```

## Environment Variables Migration

Old `.env` (Express):
```
VITE_BACKEND_URL=http://localhost:3000/generate
```

New `.env` (Next.js):
```
DEEPSEEK_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Usage Changes

### Old Pattern (aiGenerator.ts)
```typescript
import { generateLandingPage } from "@/utils/aiGenerator";

const files = await generateLandingPage(prompt);
```

### New Pattern (Feature-based)
```typescript
import { useCodeGenerator } from "@/features/code-generation";

const { generateCode, isGenerating } = useCodeGenerator();
const files = await generateCode(prompt);
```

## Testing

Run tests to ensure migration:
```bash
npm test
npm run test:coverage
```

Expected coverage:
- Hooks: 95%+
- Utils: 100%
- Components: 80%+
