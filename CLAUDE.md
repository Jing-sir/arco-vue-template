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
- Package manager is `yarn`. 包管理器固定为 `yarn`。
- Path alias is `@ -> src`. 路径别名固定为 `@ -> src`。
- Main entry is `src/main.ts`. 应用入口是 `src/main.ts`。
- Router bootstrap is `src/setup/router-setup.ts`. 路由初始化在 `src/setup/router-setup.ts`。
- HTTP wrapper is `src/plugins/http.ts`. 请求封装在 `src/plugins/http.ts`。
- Base API class is `src/api/api.ts`. API 基类在 `src/api/api.ts`。
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

## 4. Directory Rules / 目录总规则

- `src/components`: shared UI components only. 放公用 UI 组件，不放整页业务实现。
- `src/interface`: shared type definitions only. 放公用类型定义，不放页面私有临时类型。
- `src/routes`: route registration only. 只放路由定义与路由拆分，不放业务逻辑。
- `src/lang`: all i18n resources. 放所有国际化语言资源。
- `src/utils`: reusable utilities. 放公用工具能力。
- `src/api`: backend-facing service modules. 放后端接口调用层。
- `src/store`: Pinia shared state. 放跨页面共享状态。
- `src/filters`: existing reusable formatting helpers. 放已有格式化/过滤工具。
- `src/directives`: reusable DOM directives. 放公用指令。
- `src/use`: shared hooks/composables. 放公用 hooks / composables。

## 5. Detailed Folder Usage / 详细目录使用规则

### 5.1 `src/components` / 公用 UI 组件目录

- This folder is for reusable UI building blocks. 这个目录只放可复用 UI 组件。
- Do not place full business pages here. 完整业务页面不要放在这里。
- If a component is only meaningful inside one route and has no reuse potential, keep it near the route until reuse is clear. 只在单一路由内使用且短期无复用价值的组件，不要急着塞进这里。

Current component responsibilities / 当前组件职责:

- `Approval.vue`: transfer/amount-related approval flow visualizer. 用于根据金额和币种拉取并展示审批流。
- `CodeInput.vue`: 6-digit segmented input UI. 用于验证码、口令类 6 位分段输入。
- `ColorPicker.vue`: theme color picker, directly tied to `store/theme.ts`. 用于主题色选择，依赖 `store/theme.ts`。
- `Error.vue`: generic error container page shell. 通用错误页容器。
- `GoogleCode.vue`: 2FA code input modal. 2FA 验证码输入弹窗。
- `Header.vue`: top header, breadcrumb, user dropdown, logout, 2FA entry. 顶部头部、面包屑、用户操作区。
- `HelloWorld.vue`: template/demo component from scaffold; not a business pattern source. 模板示例组件，不应作为业务实现模式来源。
- `Icon.vue`: iconfont wrapper via remote script. 图标字体封装组件。
- `ListApproval.vue`: static approval flow list renderer. 审批流列表展示组件。
- `Modal/BindGoogle.vue`: modal for password verification before 2FA binding. 绑定 2FA 前的密码校验弹窗。
- `NotRolePurview.vue`: no-permission empty state page. 无权限提示页。
- `SideNavigationBar/index.vue`: the single public entry for the sidebar menu, based on filtered route tree from `store/sideBar.ts`. 侧栏菜单唯一公开入口，依据 `store/sideBar.ts` 中过滤后的路由树渲染侧栏。
- `SideNavigationBar/Item.vue`: internal recursive menu node renderer used only by `SideNavigationBar/index.vue`. 仅供 `SideNavigationBar/index.vue` 内部使用的递归侧栏节点组件。
- `TableSearchWrap/Index.vue`: reusable page scaffold for search + table + pagination. 搜索加表格页面通用骨架。
- `TableSearchWrap/SearchWrap/Index.vue`: reusable advanced search form renderer driven by `searchConf`. 基于 `searchConf` 配置的高级搜索区域。
- `TagsView.vue`: visited-page tabs cache UI. 访问页签与缓存视图组件。

Component rules / 组件规则:

- All new search/list pages must use `TableSearchWrap/Index.vue` by default, and when an existing search/list page is being refactored or substantially edited, migrate it to `TableSearchWrap/Index.vue` unless a concrete requirement cannot be expressed through `searchConf`, slots, or exposed methods. 所有新建搜索/列表页默认必须使用 `TableSearchWrap/Index.vue`；已有搜索/列表页只要进入重构或较大改动，也应迁移到 `TableSearchWrap/Index.vue`，除非存在明确需求无法通过 `searchConf`、插槽或暴露方法表达。
- Do not hand-write a separate search form + table + pagination scaffold in views when `TableSearchWrap/Index.vue` can cover the page. 只要 `TableSearchWrap/Index.vue` 能覆盖页面需求，就不要在视图层重新手写一套搜索表单 + 表格 + 分页骨架。
- Reuse `Header.vue`, `SideNavigationBar/index.vue`, and `TagsView.vue` when working on layout-level changes. 处理后台骨架布局时，优先沿用这三个组件。
- Reuse `GoogleCode.vue` and `Modal/BindGoogle.vue` for 2FA flows instead of creating parallel modal logic. 2FA 流程优先复用这两个组件。
- If adding a new reusable component, name it by responsibility, not by page position. 新公用组件按职责命名，不按页面位置命名。
- Do not declare nested helper components inside another SFC with `defineComponent`; if recursion or substructure is needed, extract a named sibling component written with `<script setup>`, or keep the logic as pure data transformation. 不要在一个 SFC 内部用 `defineComponent` 再声明嵌套辅助组件；如果需要递归或子结构，请拆成同职责的独立 `<script setup>` 组件，或者退回纯数据转换。
- When a reusable component needs child components, create a folder named after the public component and expose only one public entry file, usually `index.vue`; keep helper files such as `Item.vue` inside that folder as internal implementation details. 当一个可复用组件需要子组件时，使用以公开组件名命名的目录，并只暴露一个公开入口文件，通常是 `index.vue`；`Item.vue` 这类辅助文件应留在目录内部，作为实现细节。

### 5.2 `src/interface` / 公用类型目录

- Put cross-file shared types here. 跨文件复用的类型放这里。
- Do not place one-off local component props or local response types here. 单文件局部 props / 局部返回值类型不要塞到这里。

Current files / 当前文件职责:

- `TableType.ts`:
  - table paging result type
  - search form config types
  - generic table column shape
  - upload file item shape
  - tabs-related types
  - this is the main shared business UI type file
- `StateType.ts`:
  - compatibility re-export for `ColumnType`
  - do not expand it casually unless a compatibility layer is really needed
- `SideNavigationType.ts`:
  - shared sidebar menu node types for `SideNavigationBar/index.vue` and `SideNavigationBar/Item.vue`
  - 侧栏菜单树的共享类型，供 `SideNavigationBar/index.vue` 与 `SideNavigationBar/Item.vue` 复用

Type rules / 类型规则:

- If a type is used by more than one module, move it here. 被多个模块共用的类型再放到这里。
- Prefer extending `TableType.ts` for search/table concerns instead of inventing a second table typing file. 表格与搜索相关类型优先扩展 `TableType.ts`。

### 5.3 `src/routes` / 路由目录

- This directory only defines route trees. 这里只定义路由树。
- Do not place route guards, API calls, or layout state here. 不要在这里写守卫实现、接口调用或布局状态。

Current files / 当前文件职责:

- `constantRoutes.ts`:
  - routes that do not require backend permission gating
  - currently includes login and error/no-permission pages
- `asyncRoutes.ts`:
  - routes that are filtered by backend menu permissions
  - currently includes the home route tree

Route rules / 路由规则:

- Public or unauthenticated routes belong in `constantRoutes.ts`. 公开或免登录路由放 `constantRoutes.ts`。
- Permission-protected routes belong in `asyncRoutes.ts`. 权限控制路由放 `asyncRoutes.ts`。
- Route `meta.title` must store a Chinese i18n key, not final translated text in English. `meta.title` 必须存中文 i18n key。
- Route `meta.role` must stay aligned with backend permission names. `meta.role` 必须和后端权限名保持一致。

### 5.4 `src/lang` / 多语言目录

- This folder stores all translations. 这个目录存放所有多语言资源。
- Keep both language files updated together. 两个语言文件必须同步维护。

Current files / 当前文件职责:

- `zh-CN.json`: source of truth for Chinese-key-based translations. 中文语言包，也是中文 key 策略的基准文件。
- `en-US.json`: English mapping for the same Chinese keys. 同一批中文 key 的英文映射。
- `README.md`: folder note only. 目录说明文件。

Hard i18n rule / 强制国际化规则:

- All user-facing copy must default to i18n. 所有面向用户的文案默认必须国际化。
- Use Chinese source text as the translation key. 统一使用中文原文作为翻译 key。
- Correct:
  - `t('登录')`
  - `t('请输入密码')`
  - `formatText('复制成功')`
- Incorrect:
  - `t('auth.login')`
  - `t('login.button')`
  - raw text like `登录` directly in templates, messages, modal titles, form rules, table headers, or route rendering
- In Vue components, user-facing text must be wrapped with `t('中文文案')`. 组件中的用户文案必须使用 `t('中文文案')`。
- In non-component modules, use `i18n.global.t(...)` or `formatText(...)`. 非组件模块中使用 `i18n.global.t(...)` 或 `formatText(...)`。
- Route titles must store Chinese keys and be rendered through `t(...)`. 路由标题存中文 key，展示时再翻译。

### 5.5 `src/utils` / 工具目录

- This folder stores generic utilities. 这里放通用工具能力。
- Prefer adding generic, cross-feature code here. 只把跨功能可复用的通用能力放这里。
- Do not place page-specific business transforms here. 页面私有业务转换不要放这里。

Critical file rules / 关键文件规则:

- `common.ts`:
  - this is the primary shared utility file
  - place generic reusable functions here
  - examples already here: deep copy, event listeners, random string, flatten/tree transforms, debounce, throttle, copy helpers, i18n helper `formatText`
  - if a helper is generic and reused, it belongs here
  - do not add backend-specific request logic here
- `constant.ts`:
  - this is the primary shared constant file
  - place static constants here: regexes, numeric boundaries, default paging config
  - do not put business enums here unless they are truly app-wide constants

Other utility files / 其它工具文件职责:

- `aesGcm.ts`: current AES-GCM crypto helpers used by login/security flows. 当前登录/安全相关加解密工具。
- `aes_128_cbc.ts`: older crypto helper set; treat as legacy unless the task explicitly requires it. 较旧的加密辅助，默认视为遗留实现。
- `allToRaw.ts`: unwrap refs/reactive values into raw values for generic form/table helpers. 给通用 hooks 做 reactive/ref 解包。
- `copyToClipboard.ts`: low-level copy implementation; prefer calling higher-level helpers from `common.ts` when possible. 底层复制实现，业务侧优先走 `common.ts` 中更高层的能力。
- `protocol.ts`: internal protocol experiment/utility; do not casually reuse for normal web features. 内部协议试验类能力，普通页面功能不要滥用。
- `global.d.ts` and `globals.d.ts`: global utility type declarations. 全局类型工具声明，除非做类型层建设，否则不要轻易改。

### 5.6 `src/api` / 接口目录

- This folder stores backend service modules only. 这里只放后端接口调用层。
- File naming should follow backend URL segments. 文件命名应跟随后台接口 URL 片段。
- Example:
  - `/sys/...` -> `sys.ts`
  - `/sys/permission/...` -> `permission.ts`

Current files / 当前文件职责:

- `api.ts`:
  - base `Api` class
  - shared base URL behavior
  - default starting point for normal API modules
- `sys.ts`:
  - auth/user/system endpoints
  - login, user info, pwd IV, menu list, logout, cipher verification
- `permission.ts`:
  - permission tree and home menu queries
- `fetchTest.ts`:
  - business list request example for table pages
  - currently includes redemption list request
- `examine.ts`:
  - approval-flow-related API

API rules / 接口规则:

- Reuse `Api` from `api.ts` unless a module truly needs a special base path pattern. 一般接口模块优先复用 `api.ts` 的 `Api` 基类。
- Keep API return types explicit. 接口返回类型要明确。
- Avoid direct `axios` usage in components or views. 不要在页面和组件里直接用 `axios`。
- Use `src/plugins/http.ts` preprocessing contract unless there is a documented reason not to. 默认走 `src/plugins/http.ts` 的响应预处理契约。

### 5.7 `src/store` / 状态管理目录

- Put only shared Pinia state here. 这里只放共享 Pinia 状态。
- Follow the current setup-store style. 遵循当前 setup store 风格。

Current files / 当前文件职责:

- `Index.ts`: creates the Pinia instance. Pinia 实例入口。
- `user.ts`:
  - user info
  - account field
  - password IV
- `sideBar.ts`:
  - sidebar collapse state
  - raw backend permission/menu data in `roleMenu`
  - filtered route tree in `routes`
  - sidebar route fetching and permission redirect
- `tagsView.ts`:
  - visited tabs list
  - keep-alive related page tracking
- `theme.ts`:
  - theme color state
  - updates CSS custom property `--color-primary-6`

Store rules / store 规则:

- Do not merge `roleMenu` and `routes` in `sideBar.ts`. 不要把 `sideBar.ts` 里的 `roleMenu` 和 `routes` 混成一个字段。
- Do not add page-local modal open state or form draft state here unless it is reused globally. 页面私有弹窗开关、局部表单草稿不要塞进 store。

### 5.8 `src/filters` / 过滤与格式化目录

- This folder already contains reusable formatting helpers. 这里已经有一批公用格式化方法。
- Check here before adding new formatting helpers elsewhere. 新增格式化方法前先看这里。
- These files are legacy Vue-filter-style plugins, but the exported functions can also be imported directly. 这些文件保留了旧式 filter 插件安装方式，但导出的函数也可以直接 import 使用。

Current files / 当前文件职责:

- `arraySort.ts`: deep-path-aware array sort helper. 数组排序工具。
- `dataThousands.ts`: thousands separator formatter. 千分位格式化。
- `dateFormat.ts`: timestamp to string formatter. 时间格式化。
- `numberOperation.ts`: numeric precision helper like `toFixed`. 数字精度处理。
- `stringOperation.ts`: string masking/interception helper. 字符串截断/脱敏。

Filter rules / filter 规则:

- Reuse these helpers before creating duplicate formatters in `utils` or `use`. 优先复用，不要在 `utils` 或 `use` 里重复写同类格式化。
- If the new function is formatting-oriented, it usually belongs here. 偏格式化的工具一般优先放这里。

### 5.9 `src/directives` / 指令目录

- This folder stores shared DOM-level directives. 这里只放可复用的 DOM 指令。
- Add a directive only when a composable or normal component prop cannot express the behavior cleanly. 只有当 composable 或普通 props 无法优雅表达时，才新增指令。

Current files / 当前文件职责:

- `onlyNumber.ts`:
  - directive that constrains numeric input behavior
  - useful for inputs that need numeric typing behavior without native input-number styling
- `whenEmpty.ts`:
  - default-empty display directive
  - writes `--` when bound value is empty

Directive rules / 指令规则:

- Keep directives generic. 保持指令通用，不要写成某个页面的私有行为。
- Prefer putting directive registration logic close to app startup or plugin installation patterns already used. 注册方式遵循现有模式。

### 5.10 `src/use` / hooks 目录

- This folder stores shared hooks/composables only. 这里只放公用 hooks / composables。
- Before writing new helper logic inside a component, check whether it belongs here. 在组件里新增帮助逻辑前，先判断是否应抽到这里。

Current files / 当前文件职责:

- `useButtonRole.ts`: checks button permission based on route name + button role suffix. 按钮权限判断。
- `useDateLimit.ts`: date-range defaults and disabled-date rules. 日期范围限制。
- `useFetchTableData.ts`: generic list-fetch hook with pagination and loading state. 通用表格拉取 hook。
- `useFormHandler.ts`: form state/reset/validate helper wrapper. 表单状态与校验封装。
- `useGoogleTitle.ts`: enable/disable title helper for 2FA-related UI. 启用/禁用标题辅助。
- `useKeyDown.ts`: enter-key submit binding helper. 键盘回车提交 helper。
- `useModalHandler.ts`: generic modal open/close/title/lifecycle helper. 弹窗控制通用 hook。
- `useOnActivated.ts`: keep-alive activation hook with `#no-refresh` support. keep-alive 激活逻辑。
- `useTableConf.ts`: pagination config and search throttling helper. 分页配置与搜索节流。
- `useTabsRole.ts`: tab-level permission filtering helper. tabs 权限过滤。
- `useUpload.ts`: upload precheck helper. 上传前校验 helper。
- `useValidatorConf.ts`: common validator functions. 公用校验器。

Hook rules / hook 规则:

- If logic is reused or strongly reusable, move it here. 逻辑可复用时就抽到这里。
- If logic is tied to forms, tables, permissions, uploads, modal lifecycle, or activated behavior, check this folder before writing new code. 表单、表格、权限、上传、弹窗生命周期、activated 行为都要先看这里。
- Prefer extending an existing hook before creating a near-duplicate one. 优先扩展已有 hook，不要轻易新建近似重复的 hook。

### 5.11 `src/views` / 页面目录

- Route-level pages should be organized by module and feature folder, not as a flat list once the feature has subparts. 路由页面应按模块和功能目录组织；一旦某个功能开始拆分子结构，就不要继续平铺在同级目录。
- For a large module such as `SystemManage`, keep the module as the top-level folder and place each list/detail feature in its own subfolder. 对于 `SystemManage` 这类大模块，保留模块一级目录，并把每个列表页/详情页放进各自独立的子目录。
- Use `Index.vue` as the single route entry file inside a feature folder. 功能目录内部统一使用 `Index.vue` 作为单一页面入口。
- Put route-private reusable pieces in a local `components/` folder. 页面私有但可复用的小组件放在当前功能目录下的 `components/` 中。
- Put add/edit/detail dialogs, drawers, and other overlay UIs in a local `modal/` folder. 新增/编辑/详情弹窗、抽屉等浮层 UI 统一放在当前功能目录下的 `modal/` 中。
- Keep the feature folder as the only public entry for that route; files in `components/` and `modal/` are internal implementation details. 功能目录本身是该路由的唯一公开入口；`components/` 和 `modal/` 内的文件都视为内部实现细节。
- For create/edit flows, default to a `Drawer`-based interaction instead of opening a new route page. 新增/编辑流程默认优先使用 `Drawer` 交互，而不是新开独立路由页面。
- Only use a dedicated route page for create/edit when the content is unusually large, multi-step, or clearly unsuitable for an overlay. 只有当内容特别多、步骤明显分段、或显然不适合浮层承载时，才使用独立路由页做新增/编辑。
- Drawer width must stay within 50% of the viewport width on desktop layouts; do not create oversized drawers that occupy most of the screen. 桌面端 `Drawer` 宽度不得超过视口宽度的 50%，不要把抽屉做成接近整屏的大面板。
- If a feature still needs a route page for create/edit, document the reason in code comments or task summary so the exception is explicit. 如果某个新增/编辑功能仍然需要独立页面，请在代码注释或任务总结中明确写出原因，保证这是有意识的例外。
- Example structure:
  - `src/views/SystemManage/operation-log/Index.vue`
  - `src/views/SystemManage/operation-log/components/...`
  - `src/views/SystemManage/operation-log/modal/...`
  - `src/views/SystemManage/role-permissions/Index.vue`
  - `src/views/SystemManage/account-manage/Index.vue`
- Do not create new flat files like `src/views/SystemManage/Foo.vue` for features that already need child components or modals. 对于已经需要子组件或弹窗的功能，不要再新建类似 `src/views/SystemManage/Foo.vue` 这种平铺文件。
- When touching an existing flat page substantially, prefer migrating it into the feature-folder structure above instead of adding more sibling files next to it. 当一个现有平铺页面进入较大改动时，优先迁移到上述功能目录结构，而不是继续在旁边堆更多同级文件。

## 6. Cross-Cutting Rules / 跨目录规则

- `components` may depend on `use`, `store`, `interface`, `filters`, `utils`, and `api`, but should not become a dumping ground for raw backend logic. `components` 可以依赖这些目录，但不能沦为后端逻辑堆放区。
- `views` should compose existing `components` and `use` modules instead of rewriting their logic. `views` 应组合现有组件和 hooks，而不是重复实现。
- `api` should never import UI components. `api` 绝不能反向依赖 UI 组件。
- `utils/common.ts` is the first place to look for generic functions. 公用函数优先看 `utils/common.ts`。
- `utils/constant.ts` is the first place to look for shared constants or regexes. 公用常量和正则优先看 `utils/constant.ts`。

## 7. i18n Rules / 国际化规则

- All user-facing copy must default to i18n. 所有面向用户的文案默认必须国际化。
- Use Chinese source text as the translation key. 统一使用中文原文作为翻译 key。
- Shared text must be added to both:
  - `src/lang/zh-CN.json`
  - `src/lang/en-US.json`
- In Vue components, user-facing text must be wrapped with `t('中文文案')`. 组件中的用户文案必须使用 `t('中文文案')`。
- In non-component modules, use `i18n.global.t(...)` or `formatText(...)`. 非组件模块中使用 `i18n.global.t(...)` 或 `formatText(...)`。
- Route titles must store Chinese keys and be rendered through `t(...)`. 路由标题存中文 key，展示时再翻译。
- New validation messages, `Message.*` prompts, modal titles, form labels, placeholders, empty states, button text, table headers, and dropdown text must all follow this rule. 新增校验提示、`Message.*` 文案、弹窗标题、表单标签、placeholder、空状态、按钮文案、表格表头、下拉菜单文案都必须遵守此规则。
- Do not add new English semantic keys such as `login.title` or `search.reset`. 不要再新增英文语义 key。
- Do not add raw user-facing text without translation wrapping, even for temporary code. 即使是临时代码，也不要新增未包裹翻译函数的用户文案。

## 8. Verification Rules / 验证规则

- Minimum verification for TypeScript or Vue changes: `yarn typecheck`. TS / Vue 改动最低要跑 `yarn typecheck`。
- If you touch lint config, imports, or formatting behavior, run `yarn lint`. 修改 lint 配置、imports 或格式规则时要跑 `yarn lint`。
- Because the repository still has lint debt, prefer targeted lint on touched files during normal tasks. 仓库仍有 lint 历史债务，日常任务优先对改动文件做定向 lint。
- Do not claim lint is clean unless `yarn lint` succeeds in the current turn. 没有在当前回合跑通 `yarn lint`，不要宣称 lint 已清洁。
- Do not claim type safety unless `yarn typecheck` succeeds in the current turn. 没有在当前回合跑通 `yarn typecheck`，不要宣称类型已通过。

## 9. Editing Strategy / 改动策略

- Prefer the smallest change that solves the requested problem. 优先最小改动。
- Avoid opportunistic cleanup outside the touched area. 不要顺手扩散清理无关区域。
- If broader architecture debt is discovered, mention it separately instead of folding it into the same patch. 更大范围的架构债务要单独说明，不要偷渡进当前 patch。
- Preserve existing behavior unless the user asks for behavior changes. 用户未要求时，默认保持现有行为。

## 10. What Not To Do / 禁止事项

- Do not invent a new architecture for one feature. 不要为了单个功能发明新架构。
- Do not move many files unless requested. 不要在未要求时大规模移动文件。
- Do not rewrite working components just to modernize style. 不要只为“更现代”而重写能工作的组件。
- Do not switch UI libraries, router strategy, store pattern, or HTTP pattern on your own. 不要擅自切换 UI、路由、store 或请求模式。
- Do not present pre-existing lint debt as if your patch caused it. 不要把仓库原有 lint 债务说成你这次改动造成的。

## 11. Output Expectations / 输出要求

- Summaries should be concrete, not vague. 总结必须具体。
- Mention exact commands used for verification. 要写清实际跑过的验证命令。
- If verification was partial, say so clearly. 验证不完整时要明确说明。
- If repo reality prevents full compliance with a rule, explain the constraint. 如果仓库现实限制导致无法完全遵守规则，要解释原因。
