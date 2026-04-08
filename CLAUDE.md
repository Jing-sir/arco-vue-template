# 后台模板 AI 协作规则

`AGENTS.md` 与 `CLAUDE.md` 内容完全一致，修改时两份同步。

## 1. 目标

- 以谨慎维护者身份工作，不是代码生成器。
- 优先小步、可回退、低风险改动。
- 先遵守现有仓库架构，再讨论改进。
- 用户未明确要求时，不做大范围重构。

## 2. 项目事实

- Stack: Vue 3 + TypeScript + Vite + Pinia + Vue Router + vue-i18n + Arco Design + Tailwind + SCSS
- 包管理器：`yarn`（不切 npm）
- 路径别名：`@ -> src`
- 入口：`src/main.ts` | 路由初始化：`src/setup/router-setup.ts`
- 请求封装：`src/plugins/http.ts` | API 基类：`src/api/api.ts`
- ESLint：flat config only (`eslint.config.js`)，不重新引入 `.eslintrc.*`

## 3. 工具命令

```
yarn install / yarn typecheck / yarn lint / yarn -s eslint <file>
```

TS/Vue 改动必跑 `yarn typecheck`；lint 配置变动必跑 `yarn lint`。仓库有历史 lint 债，日常优先定向 lint 改动文件。未跑通不得声称已通过。

## 4. 样式规则

- 优先 Tailwind 原子类，Tailwind 能表达时不写独立 `<style>`。
- 本地 CSS 只用于：伪元素、keyframes、复杂媒体查询、第三方内部覆盖（用 `:deep(...)`）。
- active/selected/primary 等状态色用 `--color-primary-6` 等共享 token，不硬编码。

### 表头规则

- `TableSearchWrap` 表头禁止省略号或换行（已由 `.arco-table-th` 全局 `whitespace-nowrap` 保证，勿删）。
- 列宽公式：`width ≥ 汉字数 × 14 + 32`（px），新增/修改列时重新验证。

## 5. 注释规则

- 生成代码默认带解释性注释。逻辑代码注释需说明意图、数据流、关键分支、副作用及原因。UI/布局代码注释说明主要结构和布局目的即可。
- 不写无信息量的注释。

## 6. 目录规则

| 目录 | 职责 |
|---|---|
| `src/components` | 公用 UI 组件（不放整页业务） |
| `src/interface` | 跨文件共用类型（不放页面私有类型） |
| `src/routes` | 路由定义（不放守卫/接口/布局状态） |
| `src/lang` | 所有 i18n 资源 |
| `src/utils` | 通用工具（不放页面私有转换，不在其他目录散落 utils 文件） |
| `src/api` | 后端接口层（按 URL 前缀分组归档） |
| `src/store` | Pinia 跨页面共享状态 |
| `src/filters` | 格式化工具（新增格式化先查这里） |
| `src/directives` | 公用 DOM 指令 |
| `src/use` | 公用 hooks/composables |
| `src/views` | 路由页面，按模块/功能子目录组织 |

### `src/components` 组件清单

- `Approval.vue`：审批流展示（按金额/币种拉取）
- `CodeInput.vue`：6 位分段验证码输入
- `ColorPicker.vue`：主题色选择，依赖 `store/theme.ts`
- `Error.vue`：通用错误页容器
- `GoogleCode.vue`：2FA 验证码弹窗
- `Header.vue`：顶部头、面包屑、用户操作区
- `HelloWorld.vue`：脚手架示例组件，不作为业务模式参考
- `Icon.vue`：iconfont 封装
- `ListApproval.vue`：审批流列表展示
- `Modal/BindGoogle.vue`：绑定 2FA 前密码校验弹窗
- `NotRolePurview.vue`：无权限提示页
- `SideNavigationBar/index.vue`：侧栏菜单入口（依赖 `store/sideBar.ts` 路由树）
- `SideNavigationBar/Item.vue`：侧栏递归节点（内部使用）
- `TableSearchWrap/Index.vue`：搜索+表格+分页通用骨架
- `TableSearchWrap/SearchWrap/Index.vue`：基于 `searchConf` 的高级搜索区
- `TableSearchWrap/components/LabelTagList.vue`：标签列渲染
- `TableSearchWrap/components/PermissionButton.vue`：权限按钮（内部）
- `TableSearchWrap/components/StatusText.vue`：状态文案+颜色映射（内部）
- `TagsView.vue`：访问页签与缓存视图

**`TableSearchWrap` cellPreset 内建类型：**
- `labelTags`：标签列，支持 `renderWhen` + `fallbackTextField` + `fallbackTooltipField` 条件切换
- `statusText`：状态列
- `percentText`：百分比文本（如 `12.5%`）
- `actionButtons`：操作列按钮（via `PermissionButton`）
- 导出由单个 `exportConfig` 对象统一驱动

**组件使用规则：**
- 所有新建/重构搜索列表页必须用 `TableSearchWrap/Index.vue`，不手写搜索+表格+分页骨架。
- 导出用内建 `exportConfig`，不在页面手写导出按钮。
- 操作列优先 `cellPreset.type='actionButtons'`，工具栏按钮优先 `toolbarButtons` 配置。
- 长文本列默认省略+点击 popover（含复制），颜色用主色浅色阶；时间/日期列纯文本，不弹 popover 不复制。
- 标签列（`用户标签`/`标签`/`labelList` 等）统一用 `LabelTagList.vue`。
- 状态列优先 `cellPreset.type='statusText'`（`UserAuthCell.vue` 仅保留兼容）。
- 百分比列优先 `cellPreset.type='percentText'`。
- 能用 `cellPreset` 表达的不新增页面 slot。
- 2FA 流程复用 `GoogleCode.vue` + `Modal/BindGoogle.vue`。
- 不在 SFC 内部用 `defineComponent` 声明嵌套组件；可复用组件需子组件时，建同名目录，只暴露 `index.vue`。

### `src/interface` 关键文件

- `TableType.ts`：分页结果、搜索配置、列类型、cellPreset 类型、操作按钮类型、上传/tabs 类型——主共享 UI 类型文件
- `StateType.ts`：`ColumnType` 兼容再导出，勿随意扩展
- `SideNavigationType.ts`：侧栏菜单节点共享类型

新类型被多个模块用到才放这里，表格/搜索类型扩展 `TableType.ts`，不另立文件。

### `src/routes` 文件

- `constantRoutes.ts`：免登录路由（登录页、错误页）
- `permissionRoutes.ts`：权限路由（主路由树）
- `asyncRoutes.ts`：兼容再导出，新路由加 `permissionRoutes.ts`
- `meta.title` 存中文 i18n key；`meta.role` 与后端权限名一致。

### `src/utils` 关键文件

- `common.ts`：主工具文件（深拷贝、防抖节流、复制、`formatText` 等）
- `constant.ts`：主常量文件（正则、分页默认值等）
- `table.ts`：列表返回适配（`buildTableFetchResult`，统一 pageNum/pageNo/total* 差异）
- `aesGcm.ts`：当前登录加解密；`aes_128_cbc.ts`：遗留加密（勿新用）
- `allToRaw.ts`：ref/reactive 解包；`copyToClipboard.ts`：底层复制（业务走 `common.ts`）
- `protocol.ts`：内部协议实验，普通功能勿用

### `src/api` 规则

- 按后端 URL 前缀归档（`/sys/...` → `sys.ts`，`/userAsset/...` → `userApi/userAsset.ts`）
- 复用 `Api` 基类，返回类型显式声明，不在组件直接用 `axios`
- 兼容入口（`userApi/index.ts` 等）只做轻量聚合，实现在前缀模块

### `src/store` 关键文件

- `user.ts`：用户信息/账号/密码 IV
- `sideBar.ts`：侧栏折叠、`roleMenu`（后端数据）、`routes`（过滤路由树）——两个字段不合并
- `tagsView.ts`：页签/keep-alive
- `theme.ts`：主题色 → `--color-primary-6`
- 不存页面私有弹窗开关或表单草稿

### `src/filters` 文件

`arraySort` / `dataThousands` / `dateFormat` / `numberOperation` / `stringOperation`——新增格式化先查这里，直接 import 使用。

### `src/use` hooks 清单

`useButtonRole` / `useDateLimit` / `useConfirmAction` / `useFetchTableData` / `useFormHandler` / `useGoogleTitle` / `useKeyDown` / `useModalHandler` / `useOnActivated` / `useTabsRole` / `useUpload` / `useValidatorConf`

确认/破坏性操作（启用/禁用/删除/重置密码等）优先复用 `useConfirmAction`。

### `src/views` 结构

```
src/views/ModuleName/feature-name/Index.vue
                                  components/  ← 页面私有组件
                                  modal/       ← 弹窗/抽屉
```

- 新增/编辑默认用 `Drawer`（宽度 ≤ 50vw），内容过多时才用独立路由页（需注释说明原因）。
- 大改动时迁移到上述目录结构，不继续平铺。

## 7. i18n 规则

- 所有前端静态文案用中文原文作 key：`t('登录')`、`formatText('复制成功')`。
- 非组件模块用 `i18n.global.t(...)` 或 `formatText(...)`。
- 不用英文语义 key（`t('login.title')` ✗）。
- 后端返回文案直接展示，不再包 `t()`。
- 新文案同步维护 `src/lang/zh-CN.json` + `src/lang/en-US.json`。

## 8. TableSearchWrap 跨目录规则

- `searchConf` 用 `computed<SearchOption[]>`，保证语言切换响应。
- `type='select'` 组件自动补 `全部`，页面层不手动前置。
- 空 select 值保持 `null`，不转 `''`（后端契约要求除外，需就近注释）。
- 列表返回适配用 `utils/table.ts`，不在页面内联拼装分页字段。
- 表格 slot 中避免长表达式，下沉到 script 具名 helper。
- API 方法有显式 TS 类型时，以该类型为契约，不做猜测式 payload 解析。
- 兼容兜底只在后端有明确不一致时允许，需就近注释说明接口与原因。
- 同一纯函数逻辑出现两处以上，抽到 `src/utils` 或 `src/use`。

## 9. 改动策略 & 禁止事项

- 优先最小改动；不顺手清理无关区域；架构债务单独说明。
- 不为单个功能发明新架构；不无故大规模移文件；不只为"现代化"重写能工作的组件。
- 不擅自切换 UI 库/路由/store/请求模式。
- 不把仓库原有 lint 债说成本次改动造成的。

## 10. 输出要求

- 总结具体，写清实际运行的验证命令。
- 验证不完整时明确说明；仓库限制导致无法遵守规则时解释原因。
