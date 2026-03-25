<script setup lang="ts">
import { computed } from 'vue'
import type { RouteMeta, RouteRecordRaw } from 'vue-router'
import Item from '@/components/SideNavigationBar/Item.vue'
import type { SidebarMenuNode } from '@/interface/SideNavigationType'

/**
 * 扩展路由 meta 类型
 * 用于约束侧边栏菜单生成时依赖的字段
 */
type SidebarRouteMeta = RouteMeta & {
    title?: string | (() => string)
    icon?: string
    hidden?: boolean
    isShow?: boolean
    role?: string
}

/**
 * 侧边栏使用的路由类型
 * 这里将 RouteRecordRaw 的 children / meta 做了二次收敛，
 * 方便在菜单构建时有更明确的类型提示
 */
type SidebarRoute = Omit<RouteRecordRaw, 'children' | 'meta'> & {
    meta: SidebarRouteMeta
    children?: SidebarRoute[]
}

const { t } = useI18n()

// 当前路由对象，用于判断菜单选中状态
const currentRoute = useRoute()

// 路由跳转方法
const { push } = useRouter()

// 侧边栏 store
const store = sideBar()

// 从 store 中取出是否折叠、路由列表
const { isSidebar, routes } = storeToRefs(store)

/**
 * 统一格式化菜单标题
 *
 * 兼容两种 title 写法：
 * 1. 普通字符串
 * 2. 返回字符串的函数
 *
 * 最后统一交给 i18n 的 t() 做翻译
 */
const formatRouteTitle = (title?: string | (() => string)): string => {
    if (!title) return ''
    return t(String(typeof title === 'function' ? title() : title))
}

/**
 * 规范化路径
 *
 * 作用：
 * 1. 处理子路由相对路径拼接
 * 2. 处理以 / 开头的绝对路径
 * 3. 避免出现重复的 //
 */
const normalizePath = (parentPath = '', currentPath = ''): string => {
    // 当前路径为空时，直接返回父路径，兜底为根路径
    if (!currentPath) return parentPath || '/'

    // 如果已经是绝对路径，则直接返回
    if (currentPath.startsWith('/')) return currentPath

    // 如果父路径本身就是 /，避免拼接成 //xxx
    const basePath = parentPath === '/' ? '' : parentPath

    return `${basePath}/${currentPath}`.replace(/\/+/g, '/') || '/'
}

/**
 * 将路由树递归转换成侧边栏菜单树
 *
 * 处理逻辑：
 * 1. route.meta.isShow 为 true 时，不在菜单中显示
 * 2. 递归处理 children
 * 3. 生成 SidebarMenuNode
 * 4. 如果存在子菜单，则挂载 children
 */
const buildMenuNode = (route: SidebarRoute, parentPath = ''): SidebarMenuNode | null => {
    // isShow 为 true 的路由不展示
    if (route.meta?.isShow) return null

    // 计算当前路由完整路径
    const currentPath = normalizePath(parentPath, route.path)

    // 递归处理子路由，过滤掉 null
    const children = (route.children ?? [])
        .map((child) => buildMenuNode(child, currentPath))
        .filter((child): child is SidebarMenuNode => Boolean(child))

    // 当前菜单节点基础信息
    const item: SidebarMenuNode = {
        key: currentPath,
        title: formatRouteTitle(route.meta?.title),
        icon: route.meta?.icon ? String(route.meta.icon) : undefined,
        role: route.meta?.role ? String(route.meta.role) : undefined,
    }

    /**
     * 原逻辑保留：
     * 如果当前路由 hidden 且只有一个子节点时，直接返回当前 item
     *
     * 这里是否一定符合你的业务，要看你项目原本的菜单设计。
     * 我先按你现有逻辑保留，不做行为变更。
     */
    if (route.meta?.hidden && children.length === 1) {
        return item
    }

    // 有子菜单则返回树形结构
    if (children.length) {
        return {
            ...item,
            children,
        }
    }

    // 没有子菜单则返回普通菜单项
    return item
}

/**
 * 将菜单树拍平成叶子节点数组
 *
 * 用途：
 * 方便后面根据当前路由路径，匹配真正应该高亮的菜单项
 */
const flattenLeafNodes = (items: SidebarMenuNode[]): SidebarMenuNode[] => {
    return items.flatMap((item) => {
        return item.children?.length ? flattenLeafNodes(item.children) : [item]
    })
}

/**
 * 根据当前路径 / 当前角色，找到应该选中的菜单节点
 *
 * 优先级：
 * 1. 如果当前路由 meta 中有 role，则优先按 role 精确匹配
 * 2. 否则按 path 匹配
 * 3. path 匹配时，优先取最长前缀，避免父级误选中
 */
const findSelectedNode = (
    items: SidebarMenuNode[],
    currentPath: string,
    currentRole: string,
): SidebarMenuNode | null => {
    const leafNodes = flattenLeafNodes(items)

    // 优先根据 role 匹配
    if (currentRole) {
        const matchedByRole = leafNodes.find((item) => item.role === currentRole)
        if (matchedByRole) return matchedByRole
    }

    // 根据路径匹配，优先匹配路径更长的项
    const matchedByPath = leafNodes
        .filter(
            (item) =>
                item.key === currentPath ||
                (item.key !== '/' && currentPath.startsWith(`${item.key}/`)),
        )
        .sort((a, b) => b.key.length - a.key.length)[0]

    return matchedByPath ?? null
}

/**
 * 根据路由配置构建侧边栏菜单
 */
const sidebarMenuItems = computed<SidebarMenuNode[]>(() => {
    return (routes.value as SidebarRoute[])
        .map((route) => buildMenuNode(route))
        .filter((item): item is SidebarMenuNode => Boolean(item))
})

/**
 * 当前菜单选中的 key
 *
 * Arco Menu 的 selected-keys 需要数组格式
 */
const selectedKeys = computed<string[]>(() => {
    const selectedNode = findSelectedNode(
        sidebarMenuItems.value,
        currentRoute.path,
        String(currentRoute.meta?.role ?? ''),
    )

    return selectedNode ? [selectedNode.key] : []
})

/**
 * 菜单点击跳转
 */
const handleMenuItemClick = (path: string): void => {
    push(path)
}
</script>

<template>
    <div class="flex min-h-full flex-col bg-[var(--app-sidebar-bg)]">
        <!-- 品牌区 -->
        <div
            :class="[
                'mx-[14px] mb-5 mt-4 grid h-16 overflow-hidden rounded-[10px] bg-[var(--app-sidebar-surface)] transition-all duration-300 ease-out',
                isSidebar
                    ? 'grid-cols-[1fr] px-2'
                    : 'grid-cols-[40px_minmax(0,1fr)] gap-3 px-3',
            ]"
        >
            <!-- 品牌图标 -->
            <div
                class="relative flex h-10 w-10 shrink-0 items-center justify-center self-center justify-self-center rounded-[10px] bg-[var(--color-primary-6)] before:absolute before:left-[10px] before:top-[10px] before:h-2 before:w-5 before:rounded-full before:bg-white/90 before:content-[''] after:absolute after:left-[10px] after:top-[22px] after:h-2 after:w-3 after:rounded-full after:bg-white/90 after:content-['']"
            />

            <!-- 品牌文案 -->
            <div
                :class="[
                    'min-w-0 self-center overflow-hidden transition-all duration-200 ease-out',
                    isSidebar
                        ? 'w-0 translate-x-1 opacity-0 pointer-events-none'
                        : 'w-full translate-x-0 opacity-100 delay-75',
                ]"
            >
                <p class="m-0 text-sm font-bold tracking-[0.01em] text-[var(--app-sidebar-text)]">
                    {{ t('管理后台') }}
                </p>
                <p class="m-0 mt-[2px] text-[11px] tracking-[0.04em] text-[var(--app-sidebar-text-muted)]">
                    {{ t('权限与运营控制台') }}
                </p>
            </div>
        </div>

        <!-- 菜单区 -->
        <a-menu
            :class="[
                'side-nav__menu flex-1 overflow-y-auto bg-transparent pb-[18px]',
                isSidebar ? 'px-2' : 'px-3',
            ]"
            :selected-keys="selectedKeys"
            :collapsed="isSidebar"
            mode="vertical"
            theme="dark"
            accordion
            auto-open-selected
            @menu-item-click="handleMenuItemClick"
        >
            <Item v-for="menuItem of sidebarMenuItems" :key="menuItem.key" :item="menuItem" />
        </a-menu>
    </div>
</template>

<style scoped lang="scss">
/**
 * 这里保留少量 deep 样式，用于覆盖 Arco Menu 内部生成的节点样式
 * 这部分很难完全用 Tailwind 替代，属于组件库二次定制的正常写法
 */

:deep(.side-nav__menu.arco-menu-dark),
:deep(.side-nav__menu .arco-menu-inner) {
    background: transparent;
}

:deep(.side-nav__menu .arco-menu-item),
:deep(.side-nav__menu .arco-menu-inline-header) {
    min-height: 44px;
    margin-bottom: 6px;
    border-radius: 8px;
    color: var(--app-sidebar-text-muted);
    transition:
        background-color 0.2s ease,
        color 0.2s ease;
}

:deep(.side-nav__menu .arco-menu-item:hover),
:deep(.side-nav__menu .arco-menu-inline-header:hover) {
    color: var(--app-sidebar-text);
    background: var(--app-sidebar-surface);
}

:deep(.side-nav__menu .arco-menu-selected),
:deep(.side-nav__menu .arco-menu-selected:hover),
:deep(.side-nav__menu .arco-menu-selected-label) {
    color: var(--app-sidebar-text);
    background: var(--color-primary-6) !important;
}

/**
 * 父级菜单在“选中但仍有子级高亮”时，视觉层级应该比叶子菜单更轻。
 * 这里单独把 inline-header 的选中态降成浅一档的主题色，
 * 避免父子同时高亮时看起来像两个同权重的“当前页面”。
 */
:deep(.side-nav__menu .arco-menu-inline-header.arco-menu-selected),
:deep(.side-nav__menu .arco-menu-inline-header.arco-menu-selected:hover) {
    color: var(--color-primary-6);
    background: var(--app-sidebar-surface-strong) !important;
    box-shadow: inset 2px 0 0 0 var(--color-primary-6);
}

:deep(.side-nav__menu .arco-menu-inline-header.arco-menu-selected .arco-menu-icon),
:deep(.side-nav__menu .arco-menu-inline-header.arco-menu-selected .arco-menu-title) {
    color: inherit;
}

:deep(.side-nav__menu .arco-menu-icon) {
    font-size: 18px;
}

:deep(.side-nav__menu.arco-menu-collapsed) {
    width: 100%;
}

:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-inner) {
    padding-inline: 0;
}

:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-item),
:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-inline-header) {
    width: 100%;
    margin-inline: 0;
    padding-inline: 0 !important;
    justify-content: center;
}

:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-item-content),
:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-inline-header-content) {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
}

:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 0;
}

:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-item .arco-icon),
:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-inline-header .arco-icon),
:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-pop-header .arco-icon) {
    margin-right: 0 !important;
}
</style>
