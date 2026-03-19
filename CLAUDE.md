# Admin Template AI Rules
# 后台模板 AI 协作规则

Keep `AGENTS.md` and `CLAUDE.md` identical.
请保持 `AGENTS.md` 与 `CLAUDE.md` 内容完全一致。

## 1. Mission / 目标

- Act like a careful maintainer, not a code generator. 以谨慎维护者身份工作，而不是只会吐代码的生成器。
- Prefer small, safe, reversible changes. 优先做小步、可回退、低风险的改动。
- Match the existing repository architecture before proposing improvements. 先遵守现有仓库架构，再讨论改进。
- Do not perform broad refactors unless the user explicitly asks. 用户未明确要求时，不要做大范围重构。

## 2. Project Facts / 项目事实

- Stack: Vue 3, TypeScript, Vite, Pinia, Vue Router, vue-i18n, Arco Design, Tailwind, SCSS.
- 包管理器固定为 `yarn`。
- Path alias is `@ -> src`. 路径别名固定为 `@ -> src`。
- Main entry is `src/main.ts`. 应用入口是 `src/main.ts`。
- Router bootstrap is `src/setup/router-setup.ts`. 路由初始化在 `src/setup/router-setup.ts`。
- HTTP wrapper is `src/plugins/http.ts`. 请求封装在 `src/plugins/http.ts`。
- Base API class is `src/api/api.ts`. API 基类在 `src/api/api.ts`。
- Stores live in `src/store`. 状态管理在 `src/store`。
- Public routes live in `src/routes/constantRoutes.ts`. 公共路由在 `src/routes/constantRoutes.ts`。
- Permission routes live in `src/routes/asyncRoutes.ts`. 权限路由在 `src/routes/asyncRoutes.ts`。
- ESLint uses flat config only: `eslint.config.js`. ESLint 只使用 flat config：`eslint.config.js`。

## 3. Tooling Rules / 工具规则

- Use `yarn`, never switch to `npm` for normal workflow. 日常工作只使用 `yarn`，不要切回 `npm`。
- Use these commands by default:
  - `yarn install`
  - `yarn typecheck`
  - `yarn lint`
  - `yarn -s eslint <file1> <file2>`
- Do not recreate `.eslintrc.*` or `.eslintignore`. 不要重新引入 `.eslintrc.*` 或 `.eslintignore`。
- Keep `package.json` and `yarn.lock` in sync when dependencies change. 修改依赖时，保持 `package.json` 和 `yarn.lock` 同步。

## 4. Architecture Map / 架构地图

- `src/api`: backend-facing service modules. 放后端接口模块。
- `src/plugins/http.ts`: shared axios behavior, headers, token, preprocessing. 负责统一请求头、Token、响应预处理。
- `src/setup`: app bootstrapping such as router and i18n. 放应用初始化逻辑。
- `src/store`: shared cross-page state only. 只放真正跨页面共享的状态。
- `src/use`: reusable composables and feature helpers. 放复用型组合式逻辑。
- `src/components`: reusable UI pieces. 放可复用组件。
- `src/views`: route-level pages only. 只放路由页面层组件。
- `src/lang`: global shared i18n messages. 放全局共享文案。

## 5. File Placement Rules / 文件落位规则

- New API code goes into `src/api`. 新接口代码放在 `src/api`。
- New shared composables go into `src/use`. 新复用逻辑放在 `src/use`。
- New reusable UI goes into `src/components`. 新复用 UI 放在 `src/components`。
- New route pages go into `src/views`. 新页面放在 `src/views`。
- Do not put page-specific business logic into `src/main.ts` or root setup files. 不要把页面业务逻辑塞进 `src/main.ts` 或根级初始化文件。
- Do not move component-local state into Pinia unless it is truly shared across routes or layouts. 不是跨页面共享的状态，不要塞进 Pinia。

## 6. Vue Rules / Vue 规则

- Prefer `<script setup lang="ts">`. 优先使用 `<script setup lang="ts">`。
- Prefer Composition API. 优先使用组合式 API。
- Prefer type-only imports with `import type`. 类型导入优先使用 `import type`。
- Prefer typed `defineProps`, `defineEmits`, and `withDefaults` when useful. 新组件尽量使用带类型的 `defineProps`、`defineEmits`、`withDefaults`。
- Keep route views thin. 路由页面保持轻量。
- Put reusable logic into composables instead of repeating it in multiple views. 多页面复用逻辑优先抽到 composable。
- Prefer existing project patterns over new abstractions. 优先沿用现有项目模式，不要平地起新抽象。

## 7. Component Rules / 组件规则

- Reuse existing generic wrappers such as `TableSearchWrap` when building search + table pages. 搜索加表格页面优先复用 `TableSearchWrap`。
- Keep templates declarative. 让模板保持声明式，复杂逻辑尽量放到 `script`。
- Use scoped styles for local component styles. 局部样式优先使用 scoped。
- Avoid adding large page-local helper functions to templates. 不要把大量页面辅助逻辑直接写进模板。
- Use PascalCase component names for imports and local components. 组件命名和引用使用 PascalCase。
- Do not add a second UI system. 不要引入第二套 UI 框架。

## 8. State Rules / 状态管理规则

- Follow the current Pinia setup-store style. 遵循当前 Pinia setup store 风格。
- Current store responsibilities:
  - `src/store/user.ts`: user/account/auth-related state. 用户与登录态相关状态。
  - `src/store/sideBar.ts`: sidebar open state, backend menu data, filtered route tree. 侧边栏状态、权限菜单、过滤后的路由树。
  - `src/store/tagsView.ts`: visited tabs and keep-alive list. 标签页与缓存视图。
  - `src/store/theme.ts`: theme color state. 主题色状态。
- Do not merge unrelated concerns into one store. 不要把无关职责塞进同一个 store。
- Do not collapse `roleMenu` and `routes` back into one field in `sideBar`. 不要再把 `sideBar` 里的 `roleMenu` 和 `routes` 混成一个字段。

## 9. Router And Permission Rules / 路由与权限规则

- Public or unauthenticated routes belong in `constantRoutes`. 公开或免登录路由放在 `constantRoutes`。
- Permission-protected routes belong in `asyncRoutes`. 权限控制路由放在 `asyncRoutes`。
- Permission routes must keep these `meta` fields aligned with backend permissions:
  - `role`
  - `title`
  - `requiresAuth`
- If a route appears in the sidebar, the route tree and backend permission names must stay consistent. 侧边栏可见路由必须与后端权限名保持一致。
- Do not introduce hidden route behavior without checking current sidebar rendering logic. 修改隐藏路由行为前，先确认侧边栏渲染逻辑。

## 10. API Rules / 接口规则

- Create new API modules using backend-path-oriented naming. 新 API 模块按后端路径语义命名。
- Reuse `Api` from `src/api/api.ts` when adding standard service modules. 常规接口模块优先复用 `src/api/api.ts` 中的 `Api` 基类。
- Avoid direct `axios` usage inside views or components. 不要在页面或组件里直接调用 `axios`。
- Always think about the response shape. 新接口要明确返回类型，不要默认 `Promise<any>`。
- If the backend shape is unstable, type the known fields and mark unknown fields explicitly. 如果后端结构不稳定，至少把已知字段写清楚，再显式标注未知部分。

## 11. HTTP Wrapper Rules / HTTP 封装规则

- Respect `src/plugins/http.ts` as the shared HTTP contract. 把 `src/plugins/http.ts` 视为统一请求契约。
- Preserve these response conventions:
  - `code === 200`: return `data`
  - `code === 1000 || code === 1001`: clear `manageToken` and redirect to `/login`
- Do not silently bypass preprocessing. 不要无声绕过响应预处理。
- If raw response access is required, make that choice explicit in code and explain why. 如果必须拿原始响应结构，要显式说明原因。
- Keep token, language, and request headers centralized. Token、语言头、公共请求头应保持集中管理。

## 12. Table And Form Rules / 表格与表单规则

- For searchable list pages, follow the existing search + table pattern unless the user asks for a redesign. 搜索列表页优先沿用现有搜索加表格模式。
- Keep pagination behavior consistent with existing helpers. 分页逻辑尽量沿用已有 helper。
- If adding validation, match the current Arco form usage. 新增表单校验时，遵循当前 Arco 表单写法。
- Do not scatter form-reset and data-normalization logic across many files. 表单重置和数据整理逻辑不要分散在很多文件里。

## 13. Styling Rules / 样式规则

- Primary UI stack is Arco Design + Tailwind utilities + SCSS. 主要 UI 技术栈是 Arco Design + Tailwind + SCSS。
- Reuse existing spacing, header, layout, and admin page patterns. 优先复用已有后台布局、页头、间距与表格风格。
- Avoid visual redesign unless explicitly requested. 用户未要求时，不做视觉重设计。
- Do not introduce CSS-in-JS or another styling system. 不要引入 CSS-in-JS 或第二套样式体系。

## 14. i18n Rules / 国际化规则

- All user-facing copy must default to i18n. 所有面向用户的文案默认必须接入国际化。
- Use Chinese source text as the translation key. 统一使用中文原文作为翻译 key。
- Correct:
  - `t('登录')`
  - `t('请输入密码')`
  - `formatText('复制成功')`
- Incorrect:
  - `t('auth.login')`
  - `t('login.button')`
  - raw text like `登录` directly in templates, messages, modal titles, form rules, or table headers
- Shared text should be added to both:
  - `src/lang/zh-CN.json`
  - `src/lang/en-US.json`
- In Vue components, user-facing text must be wrapped with `t('中文文案')`. 在 Vue 组件中，用户文案必须使用 `t('中文文案')` 包裹。
- In non-component modules, use `i18n.global.t(...)` or `formatText(...)`. 在非组件模块中，使用 `i18n.global.t(...)` 或 `formatText(...)`。
- Route titles must store Chinese keys and be rendered through `t(...)`. 路由标题应保存中文 key，并在展示时通过 `t(...)` 渲染。
- New validation messages, `Message.*` prompts, modal titles, form labels, placeholders, empty states, button text, table headers, and dropdown text must all follow this rule. 新增校验提示、`Message.*` 文案、弹窗标题、表单标签、placeholder、空状态、按钮文案、表格表头、下拉菜单文案都必须遵守此规则。
- Do not add new English semantic keys such as `login.title` or `search.reset`. 不要再新增 `login.title`、`search.reset` 这类英文语义 key。
- Do not add new raw user-facing text without translation wrapping, even for temporary code. 即使是临时代码，也不要新增未包裹翻译函数的用户文案。

## 15. Lint And Type Rules / Lint 与类型规则

- Minimum verification for TypeScript or Vue code changes: `yarn typecheck`. 任何 TS / Vue 代码改动，最低验证是 `yarn typecheck`。
- If you touch lint config, formatting behavior, or imports, run `yarn lint`. 修改 lint 配置、格式规则或 import 结构时，要跑 `yarn lint`。
- Because the repository still has lint debt, prefer targeted lint on touched files during normal tasks. 由于仓库还有 lint 历史债务，日常任务优先对改动文件做定向 lint。
- Do not claim lint is clean unless `yarn lint` succeeds in the current turn. 没有在当前回合跑通 `yarn lint`，不要宣称 lint 已清洁。
- Do not claim type safety unless `yarn typecheck` succeeds in the current turn. 没有在当前回合跑通 `yarn typecheck`，不要宣称类型已通过。

## 16. Generated Files / 生成文件规则

- Do not hand-edit generated declaration files unless the task explicitly requires it. 非明确需要时，不手改生成声明文件。
- Especially avoid manual edits to:
  - `src/auto-imports.d.ts`
  - `src/components.d.ts`
- If a plugin regenerates them, mention that in the summary. 如果插件自动改动了这些文件，在总结里说明。

## 17. Safety Rules / 安全规则

- Do not add secrets, tokens, passwords, or real credentials to the repo. 不要向仓库写入密钥、Token、密码或真实账号。
- Do not keep new debug credentials in forms or config. 不要新增默认测试账号密码。
- Do not delete or rewrite large sections of unrelated code to satisfy style preferences. 不要为了风格偏好删除或重写大量无关代码。
- Do not introduce dependency churn without clear need. 没有明确收益时，不要随意引入或替换依赖。

## 18. Change Strategy / 改动策略

- Prefer the smallest change that solves the requested problem. 优先选择能解决问题的最小改动。
- Avoid opportunistic cleanup outside the touched area. 不要顺手清理过多无关区域。
- If you notice broader architecture debt, mention it separately instead of folding it into the same patch. 发现更大范围的架构债务时，单独说明，不要偷渡进当前 patch。
- Preserve existing behavior unless the user asks for behavior changes. 用户未要求时，默认保持现有行为。

## 19. Required Working Sequence / 建议执行顺序

- Read the relevant entry files first. 先读相关入口文件。
- Confirm the current pattern in nearby files. 先确认附近文件的现有写法。
- Make the change using the local project pattern. 按本项目既有模式改动。
- Run the minimum relevant verification. 跑最小必要验证。
- Report what changed, what was verified, and what remains as existing debt. 汇报改了什么、验证了什么、还有哪些属于原有债务。

## 20. What Not To Do / 禁止事项

- Do not invent a new architecture for one feature. 不要为了一个功能发明新架构。
- Do not move many files unless requested. 不要在未要求时大规模移动文件。
- Do not rewrite working components just to modernize style. 不要仅为“更现代”而重写可工作的组件。
- Do not switch UI libraries, router strategy, store pattern, or HTTP pattern on your own. 不要擅自切换 UI、路由、状态管理或请求模式。
- Do not present pre-existing lint debt as if your patch caused it. 不要把仓库原有 lint 债务说成这次改动导致的。

## 21. Output Expectations / 输出要求

- Summaries should be concrete, not vague. 总结要具体，不要空泛。
- Mention exact commands used for verification. 要说明实际运行过的验证命令。
- If verification was partial, say so clearly. 如果验证不完整，要明确说明。
- If a rule could not be followed because of repo reality, explain the constraint. 如果因仓库现状无法完全遵守某条规则，要说清限制原因。
