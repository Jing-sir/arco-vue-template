# AI Coding Guidelines - Arco Vue Admin Template

> **通用 AI 编码规范** - 适用于所有 AI 编码助手
>
> **Universal AI Coding Rules** - For all AI coding assistants

---

## 🤖 支持的 AI 工具

此规范文件适用于以下 AI 编码助手：

- ✅ **Cursor** (使用 `.cursorrules`)
- ✅ **Cline/Continue** (使用 `.clinerules`)
- ✅ **GitHub Copilot** (使用 `.github/copilot-instructions.md`)
- ✅ **Windsurf** (使用 `.windsurfrules`)
- ✅ **Claude Code** (读取此文件)
- ✅ **其他工具** (参考本文档)

---

## 📁 文件说明

本项目包含以下 AI 规则文件：

```
.
├── .cursorrules                      # Cursor IDE 专用
├── .clinerules                       # Cline/Continue 专用
├── .windsurfrules                    # Windsurf 专用
├── .github/
│   └── copilot-instructions.md      # GitHub Copilot 专用
└── AI_GUIDELINES.md                 # 通用文档（本文件）
```

**注意**：以上所有文件内容相同，只是文件名不同以适配不同工具。

---

## 🎯 项目核心规则

### ⚠️ 绝对禁止

```typescript
// ❌ 禁止使用 any 类型
const data: any = {};
const result = (item as any).value;

// ❌ 禁止使用 Record<string, any>
const params: Record<string, any> = {};

// ❌ 禁止硬编码中文文本
<button>确认</button>
<p>默认展开</p>

// ❌ 禁止省略函数返回类型
const getData = () => { ... }

// ❌ 禁止直接修改 props
props.data.value = 'new value';
```

### ✅ 必须遵守

```typescript
// ✅ 使用精确的类型定义
interface UserData {
    id: number;
    name: string;
}
const data: UserData = { id: 1, name: 'User' };

// ✅ 使用 unknown 或 SearchParams
const params: Record<string, unknown> = {};
const params: SearchParams = {};

// ✅ 使用 i18n 国际化
<button>{{ t('common.confirm') }}</button>
<p>{{ t('search.defaultExpanded') }}</p>

// ✅ 明确函数返回类型
const getData = (): Promise<UserData> => { ... }
const formatText = (text: string): string => { ... }

// ✅ 通过 emit 通知父组件
emits('update:data', 'new value');
```

---

## 🏗️ 项目技术栈

### 核心框架（必须了解的版本变化）

| 技术 | 版本 | 重要变化 |
|------|------|---------|
| **Vue** | 3.5.30 | 使用 Composition API + `<script setup>` |
| **Vue Router** | 5.0.3 | ⚠️ **移除了默认导出** - 只能使用命名导入 |
| **Pinia** | 3.0.4 | 新的状态管理库（替代 Vuex） |
| **TypeScript** | 5.9.3 | 启用严格模式 |
| **Vite** | 8.0.0 | 最新构建工具 |

### UI 和样式

- **Arco Design Vue** 2.57.0 - `Message.warn()` 改为 `Message.warning()`
- **Tailwind CSS** 3.4.19 - 优先使用工具类
- **LESS** 4.6.4 - 组件样式使用

### 关键依赖

- **vue-i18n** 11.3.0 - 国际化（中英文）
- **axios** 1.13.6 - HTTP 客户端
- **vue-request** 2.0.4 - 数据请求 hook
- **dayjs** 1.11.20 - 日期处理
- **lodash-es** 4.17.23 - 工具函数

---

## 📐 代码规范速查

### Vue 3 组件结构（标准顺序）

```vue
<script setup lang="ts">
// 1. 导入
import { ref, computed } from 'vue';
import type { PropType } from 'vue';

// 2. 类型定义
interface Props { ... }

// 3. Props
const props = defineProps({ ... });

// 4. Emits
const emits = defineEmits<{ ... }>();

// 5. 组合式函数
const { t } = useI18n();

// 6. 响应式状态
const count = ref(0);

// 7. 计算属性
const double = computed(() => count.value * 2);

// 8. 方法
const handleClick = (): void => { ... };

// 9. 生命周期
onMounted(() => { ... });

// 10. Watch
watch(() => props.data, () => { ... });
</script>

<template>
    <div class="component">
        <!-- 使用 Tailwind 工具类 -->
    </div>
</template>

<style scoped lang="scss">
// 复杂样式使用 SCSS
</style>
```

### TypeScript 类型定义

```typescript
// ✅ Props 类型定义
const props = defineProps({
    items: {
        type: Array as PropType<ItemType[]>,
        required: true,
        default: () => [],
    },
    config: {
        type: Object as PropType<ConfigType>,
        required: true,
    },
});

// ✅ Emits 类型定义
const emits = defineEmits<{
    'update:modelValue': [value: string];
    search: [params: SearchParams];
    close: [];
}>();

// ✅ 函数返回类型
const fetchData = async (): Promise<UserData[]> => {
    return await api.getData();
};

// ✅ 组合式函数类型
interface UseTableReturn<T> {
    data: Ref<T[]>;
    loading: Ref<boolean>;
    fetchData: () => Promise<void>;
}

export function useTable<T>(): UseTableReturn<T> {
    // ...
}
```

### Pinia Store 定义

```typescript
import { defineStore } from 'pinia';

interface State {
    user: User | null;
    token: string | null;
}

export const useUserStore = defineStore('user', {
    state: (): State => ({
        user: null,
        token: null,
    }),

    getters: {
        isLoggedIn: (state): boolean => !!state.token,
    },

    actions: {
        async login(data: LoginData): Promise<void> {
            const response = await loginApi(data);
            this.token = response.token;
            this.user = response.user;
        },
    },
});
```

### API 调用规范

```typescript
// src/api/user.ts
import { Api } from './api';

interface LoginParams {
    username: string;
    password: string;
}

interface LoginResponse {
    token: string;
    user: UserInfo;
}

class UserApi extends Api {
    async login(params: LoginParams): Promise<LoginResponse> {
        return this.post<LoginResponse>('/auth/login', params);
    }
}

export const userApi = new UserApi();
```

### 国际化使用

```vue
<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
    <!-- ✅ 使用 i18n -->
    <a-button>{{ t('common.confirm') }}</a-button>

    <!-- ✅ 带参数 -->
    <p>{{ t('user.welcome', { name: userName }) }}</p>

    <!-- ❌ 禁止硬编码 -->
    <a-button>确认</a-button>
</template>
```

---

## 🎨 样式规范

### Tailwind CSS 优先

```vue
<template>
    <!-- ✅ 使用 Tailwind 工具类 -->
    <div class="flex items-center justify-between w-full p-4 bg-white rounded-lg shadow-md">
        <h1 class="text-2xl font-bold text-gray-900">Title</h1>
        <button class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
            Click
        </button>
    </div>
</template>
```

### 复杂样式用 SCSS

```vue
<style scoped lang="scss">
.custom-component {
    background: #fbfbfd;
    @apply rounded-lg; // 可以混用 Tailwind

    &:hover {
        background: #f0f0f0;
    }

    .child-element {
        padding: 1rem;
    }
}

// 深度选择器修改子组件
::v-deep(.arco-button) {
    border-radius: 8px;
}
</style>
```

---

## 🗂️ 项目结构

```
src/
├── api/                    # API 接口定义
│   ├── api.ts             # 基础 API 类
│   ├── user.ts            # 用户 API
│   └── sys.ts             # 系统 API
├── components/            # 公共组件
│   ├── TableSearchWrap/   # 表格搜索组件
│   └── Modal/             # 模态框组件
├── views/                 # 页面组件
│   ├── Home/
│   └── Login/
├── store/                 # Pinia stores
│   ├── user.ts
│   └── sideBar.ts
├── routes/                # 路由定义
│   ├── constantRoutes.ts  # 静态路由
│   └── asyncRoutes.ts     # 动态路由
├── interface/             # TypeScript 类型
│   └── TableType.ts
├── utils/                 # 工具函数
├── use/                   # 组合式函数
├── filters/               # 过滤器/格式化
├── lang/                  # 国际化
│   ├── zh-CN.json
│   └── en-US.json
└── setup/                 # 应用配置
    ├── router-setup.ts
    └── i18n-setup.ts
```

---

## 📛 命名规范

| 类型 | 命名方式 | 示例 |
|------|---------|------|
| 组件文件 | PascalCase 或 Index.vue | `UserProfile.vue`, `Modal/Index.vue` |
| 组合式函数 | use + PascalCase | `useTableData.ts`, `useModal.ts` |
| 工具函数 | camelCase | `common.ts`, `dateFormat.ts` |
| Store 文件 | camelCase | `user.ts`, `sideBar.ts` |
| 类型文件 | PascalCase | `TableType.ts`, `UserType.ts` |
| 常量 | UPPER_SNAKE_CASE | `MAX_COUNT`, `API_BASE_URL` |
| 变量/函数 | camelCase | `userData`, `fetchData()` |
| 组件名 | PascalCase | `<UserProfile>`, `<TableSearchWrap>` |

---

## ⚡ 性能优化

### 组件懒加载

```typescript
// ✅ 路由懒加载
const routes = [
    {
        path: '/user',
        component: () => import('@/views/User/Index.vue'),
    },
];

// ✅ 组件懒加载
const HeavyComponent = defineAsyncComponent(() =>
    import('@/components/HeavyComponent.vue')
);
```

### 计算属性缓存

```typescript
// ✅ 使用 computed 缓存
const filtered = computed(() =>
    items.value.filter(i => i.active)
);

// ❌ 不要在方法中重复计算
const getFiltered = () =>
    items.value.filter(i => i.active);
```

### 列表渲染

```vue
<!-- ✅ 使用唯一 key -->
<div v-for="item in items" :key="item.id">
    {{ item.name }}
</div>

<!-- ❌ 避免使用 index -->
<div v-for="(item, index) in items" :key="index">
    {{ item.name }}
</div>
```

---

## 🔧 关键 API 变化

### Vue Router 5

```typescript
// ❌ Vue Router 4
import VueRouter from 'vue-router';

// ✅ Vue Router 5 - 只支持命名导入
import { createRouter, createWebHistory } from 'vue-router';
```

### Arco Design 组件

```typescript
// ❌ 旧版本
Message.warn('警告');

// ✅ 新版本
Message.warning('警告');
```

---

## 📝 Git 提交规范

```bash
# 类型
feat:     # 新功能
fix:      # Bug 修复
refactor: # 重构
style:    # 格式化
docs:     # 文档
chore:    # 构建/工具
perf:     # 性能优化
test:     # 测试

# 示例
feat: 添加用户管理模块
fix: 修复登录页面样式问题
refactor: 重构表格组件类型定义
```

---

## 🚫 禁止模式总结

### 绝对不要

1. ❌ 使用 `any` 类型
2. ❌ 硬编码文本
3. ❌ 直接修改 props
4. ❌ 在 computed 中修改状态
5. ❌ 省略函数返回类型
6. ❌ 在模板中写复杂表达式
7. ❌ 使用 index 作为列表 key
8. ❌ 不处理异步错误

### 必须做

1. ✅ 使用精确类型或泛型
2. ✅ 使用 i18n 国际化
3. ✅ 使用 emit 通知父组件
4. ✅ 使用类型守卫
5. ✅ 明确返回类型
6. ✅ 提取计算属性
7. ✅ 使用唯一 ID 作为 key
8. ✅ 使用 try-catch 处理错误

---

## 📚 更多资源

- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Arco Design Vue](https://arco.design/vue)
- [Pinia 文档](https://pinia.vuejs.org/)
- [Vite 文档](https://vitejs.dev/)

---

## 🎯 快速检查清单

在提交代码前，请确保：

- [ ] 没有使用 `any` 类型
- [ ] 所有函数都有返回类型
- [ ] 没有硬编码的中文文本
- [ ] Props 和 Emits 都有类型定义
- [ ] 使用了 Tailwind CSS 工具类
- [ ] 代码通过了 `npm run typecheck`
- [ ] 没有 ESLint 警告
- [ ] 使用了合适的组合式函数
- [ ] 遵循了文件命名规范
- [ ] Git 提交信息符合规范

---

**记住：类型安全是第一优先级！禁止使用 `any` 类型！**

---

*此文档与以下文件内容保持同步：*
- `.cursorrules`
- `.clinerules`
- `.windsurfrules`
- `.github/copilot-instructions.md`