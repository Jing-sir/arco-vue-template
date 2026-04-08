<script setup lang="ts">
import { IconSearch } from '@arco-design/web-vue/es/icon'
import { computed, ref, watch } from 'vue'
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
const router = useRouter()

// 侧边栏 store
const store = sideBar()

// 从 store 中取出是否折叠、路由列表
const { isSidebar, routes } = storeToRefs(store)

// 侧栏菜单搜索关键字（仅用于当前会话交互，不需要进入全局状态）。
const menuSearchKeyword = ref('')

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
 * 对菜单树做关键词过滤，并保留父链结构。
 *
 * 约束：
 * 1. 命中父节点时保留整个分支，避免用户看不到子菜单入口
 * 2. 仅子节点命中时，也要把父链带出来，保证树结构完整
 */
const filterMenuNodes = (items: SidebarMenuNode[], keyword: string): SidebarMenuNode[] => {
    if (!keyword) return items

    const walk = (item: SidebarMenuNode): SidebarMenuNode | null => {
        const children = (item.children ?? [])
            .map((child) => walk(child))
            .filter((child): child is SidebarMenuNode => child !== null)
        const title = item.title.toLowerCase()
        const matchCurrent = title.includes(keyword)

        if (!matchCurrent && !children.length) return null

        return {
            ...item,
            children: matchCurrent ? item.children : children,
        }
    }

    return items.map((item) => walk(item)).filter((item): item is SidebarMenuNode => item !== null)
}

const normalizedMenuKeyword = computed(() => menuSearchKeyword.value.trim().toLowerCase())
const isSearchingMenu = computed(() => Boolean(normalizedMenuKeyword.value))

const visibleSidebarMenuItems = computed<SidebarMenuNode[]>(() => {
    return filterMenuNodes(sidebarMenuItems.value, normalizedMenuKeyword.value)
})

const getExpandableNodeKeys = (items: SidebarMenuNode[]): string[] =>
    items.flatMap((item) => {
        if (!item.children?.length) return []
        return [item.key, ...getExpandableNodeKeys(item.children)]
    })

// 搜索态下统一展开命中树；非搜索态交给 Arco 的 auto-open-selected 管理。
const searchOpenKeys = computed<string[] | undefined>(() => {
    if (!isSearchingMenu.value) return undefined
    return getExpandableNodeKeys(visibleSidebarMenuItems.value)
})

/**
 * 当前菜单选中的 key
 *
 * Arco Menu 的 selected-keys 需要数组格式
 */
const selectedKeys = computed<string[]>(() => {
    const selectedNode = findSelectedNode(
        visibleSidebarMenuItems.value,
        currentRoute.path,
        String(currentRoute.meta?.role ?? ''),
    )

    return selectedNode ? [selectedNode.key] : []
})

/**
 * 菜单点击跳转
 *
 * 左侧菜单导航是“获取最新数据”语义：
 * - 显式清空 hash，避免沿用 tabbar 的 #no-refresh 标记
 * - 让 useOnActivated 走默认刷新分支，拉取最新列表数据
 */
const handleMenuItemClick = (path: string): void => {
    const normalizedPath = path.replace(/(?:#no-refresh)+$/, '')
    void router.push({
        path: normalizedPath,
        hash: '',
    })
}

watch(
    isSidebar,
    (collapsed) => {
        // 折叠菜单后隐藏搜索框，这里同步清空关键词，避免“看不见输入框但菜单已被过滤”的困惑。
        if (collapsed) {
            menuSearchKeyword.value = ''
        }
    },
    { immediate: true },
)
</script>

<template>
    <div class="flex min-h-full flex-col bg-[var(--app-sidebar-bg)]">
        <!-- 品牌区 -->
        <div
            :class="[
                'mx-3 mb-5 mt-4 grid h-16 items-center overflow-hidden rounded-[10px] bg-[var(--app-sidebar-surface)] transition-all duration-300 ease-out',
                isSidebar
                    ? 'grid-cols-[1fr] justify-items-center p-2 h-[50px] !mx-0'
                    : 'grid-cols-[40px_minmax(0,1fr)] gap-3 px-3',
            ]"
        >
            <!-- 品牌图标：固定尺寸 + object-contain 防止拉伸 -->
            <img src="@/assets/images/logo.png" alt="" class="h-8 w-8 shrink-0 object-contain" />

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
                    {{ t('UPay 管理后台') }}
                </p>
            </div>
        </div>

        <div v-if="!isSidebar" class="mb-3 px-3">
            <a-input
                v-model="menuSearchKeyword"
                allow-clear
                size="small"
                class="side-nav__search-input w-full"
                :placeholder="t('搜索权限菜单')"
            >
                <template #prefix>
                    <IconSearch />
                </template>
            </a-input>
        </div>

        <!-- 菜单区 -->
        <a-menu
            v-if="visibleSidebarMenuItems.length"
            :class="[
                'side-nav__menu flex-1 overflow-y-auto bg-transparent pb-[18px]',
                isSidebar ? 'px-0' : 'px-3',
            ]"
            :selected-keys="selectedKeys"
            :open-keys="searchOpenKeys"
            :collapsed="isSidebar"
            mode="vertical"
            theme="dark"
            :accordion="!isSearchingMenu"
            auto-open-selected
            @menu-item-click="handleMenuItemClick"
        >
            <Item
                v-for="menuItem of visibleSidebarMenuItems"
                :key="menuItem.key"
                :item="menuItem"
            />
        </a-menu>
        <div v-else-if="!isSidebar" class="flex flex-1 items-start justify-center px-3 pt-8">
            <a-empty :description="t('未匹配到权限菜单')" />
        </div>
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
    width: 100% !important;
}

:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-inner) {
    padding-inline: 4px;
}

:deep(.arco-menu-inner) {
    padding: 0 !important;
}

/**
 * 收起态仅修正图标偏移问题：
 * - Arco 默认会给 .arco-icon 设置 margin-right: 100%，导致图标看起来贴边
 * - 同时 title 节点虽然 opacity:0 但仍占位，会继续把图标挤向左侧
 */
:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-has-icon > *:not(.arco-menu-icon)) {
    width: 0 !important;
    max-width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    flex: 0 0 0 !important;
    overflow: hidden !important;
    opacity: 0 !important;
}

:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-item.arco-menu-has-icon),
:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-inline-header.arco-menu-has-icon),
:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-pop-header.arco-menu-has-icon) {
    display: flex;
    align-items: center;
    justify-content: center;
}

:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 0 !important;
}

:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-item .arco-icon),
:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-inline-header .arco-icon),
:deep(.side-nav__menu.arco-menu-collapsed .arco-menu-pop-header .arco-icon) {
    margin-right: 0 !important;
    transform: translateX(0) !important;
}
</style>
