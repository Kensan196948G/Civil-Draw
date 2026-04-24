# Contributing to Civil Draw

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20.x LTS |
| npm | 10.x |
| Git | 2.40+ |

```bash
git clone https://github.com/Kensan196948G/Civil-Draw.git
cd Civil-Draw
npm install
npm run dev        # http://localhost:5173
```

## Project Structure

```
src/
  components/      # React UI components
    Canvas/        # Konva-based drawing surface
    LayerPanel/    # Layer CRUD panel
    PropertyPanel/ # Shape property editor
    TemplatePanel/ # Preset template library
    ToolPanel/     # Tool selection + options
    Toolbar/       # File I/O, print, undo/redo
  store/           # Zustand state (layerStore, canvasStore, toolStore)
  types/           # TypeScript types (geometry, layer)
  utils/           # Pure utility functions (no React deps)
docs/              # Architecture + design documents
e2e/               # Playwright end-to-end tests
```

## Branch Strategy

| Branch pattern | Purpose |
|----------------|---------|
| `main` | Protected. CI must pass before merge |
| `feat/m{N}-{issue-id}-{slug}` | Feature / milestone work |
| `fix/{issue-id}-{slug}` | Bug fixes |
| `docs/{issue-id}-{slug}` | Documentation only |

Always branch from `main`. One branch per Issue.

```bash
git checkout main && git pull
git checkout -b feat/m3-myfeature-001
```

## Development Workflow

1. Create a GitHub Issue (P1/P2/P3 label)
2. Create a branch from `main`
3. Implement with tests
4. Run local checks:
   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```
5. Push and open a PR (fill in the template)
6. CI must be green before requesting review
7. Merge after CodeRabbit + reviewer approval

## Testing

### Unit tests (Vitest)

```bash
npm run test           # watch mode
npm run test -- --run  # single run
```

Test files live alongside the code they test: `foo.ts` → `foo.test.ts`.
Every utility function and store action must have unit test coverage.

### E2E tests (Playwright)

```bash
npx playwright test           # headless
npx playwright test --ui      # interactive UI mode
```

E2E tests live in `e2e/`. They cover the golden path of draw → select → delete → undo.

### Writing good tests

- Test **behaviour**, not implementation details.
- Use `beforeEach(() => useLayerStore.getState().clearDocument())` to reset store state.
- For shape assertions, prefer checking specific geometry fields over snapshot comparison.

## Code Style

- **TypeScript strict mode** is enabled. No `any` without explicit justification.
- **No comments** unless the WHY is non-obvious (hidden constraint, workaround, subtle invariant).
- **No `Omit<UnionType, K>`** — use `DistributiveOmit` from `templateCatalog.ts` when omitting fields from a discriminated union.
- Prefer `const` over `let`. Avoid mutation of shape objects; always spread-copy.
- React components: one component per file, named export.
- Zustand selectors: always use fine-grained selectors (`s => s.shapes`) to avoid unnecessary re-renders.

## Coordinate System

All shape coordinates are stored in **world space** (mm, Y-down).

```
worldX = (stageX - panX) / zoom
worldY = (stageY - panY) / zoom
```

When writing shape manipulation code, always work in world space. Convert only at the render boundary (Konva props).

## Adding a New Shape Type

1. Add the type definition to `src/types/geometry.ts` (extend `BaseShape`)
2. Add `union member` to the `Shape` type
3. Handle the new type in every `switch (s.type)` in:
   - `layerStore.ts` (`moveShapes`, `pasteClipboard`, `duplicateSelection`, `insertTemplate`)
   - `shapeTransform.ts` (`transformShape`, `shapeKeyPoints`)
   - `dxfExporter.ts`
   - `dxfImporter.ts` (if it has a DXF equivalent)
   - `ShapeRenderer.tsx`
   - `PropertyPanel.tsx` (`ShapeProps`)
4. Add unit tests

## Adding a Template

Templates live in `src/utils/templateCatalog.ts`.
Each template is a `TemplateDef` with `shapes: ShapeTemplate[]`.
`ShapeTemplate` uses `DistributiveOmit<Shape, 'id' | 'layerId' | 'locked'>` so the discriminated union is preserved.

```typescript
{
  id: 'my-template',
  name: '私のテンプレート',
  category: '仮設',
  description: '説明文',
  shapes: [
    { type: 'rect', x: -50, y: -50, width: 100, height: 100, rotation: 0 },
  ],
}
```

Coordinates are relative to the insertion point (0, 0). `insertTemplate(id, cx, cy)` applies the offset.

## Pull Request Checklist

- [ ] Unit tests added / updated
- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run type-check` passes
- [ ] `npm run test -- --run` passes
- [ ] `npm run build` succeeds
- [ ] PR description includes: changes, test results, impact, known issues

## Issue Labels

| Label | Meaning |
|-------|---------|
| `P1` | Blocking — CI / security / data loss |
| `P2` | Important — quality / UX / test coverage |
| `P3` | Nice to have — minor improvement |
| `M1`–`M3` | Milestone |
| `blocked` | Waiting on external dependency |
