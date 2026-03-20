<script setup lang="ts">
import Item from '@/components/SideNavigationBar/Item.vue'
import type { SidebarMenuNode } from '@/interface/SideNavigationType'
import { computed } from 'vue'
import type { RouteMeta, RouteRecordRaw } from 'vue-router'

type SidebarRouteMeta = RouteMeta & {
    title?: string | (() => string)
    icon?: string
    hidden?: boolean
    isShow?: boolean
    role?: string
}

type SidebarRoute = Omit<RouteRecordRaw, 'children' | 'meta'> & {
    meta: SidebarRouteMeta
    children?: SidebarRoute[]
}

const { t } = useI18n()

const currentRoute = useRoute()
const { push } = useRouter()

const store = sideBar()
const { isSidebar, routes } = storeToRefs(store)

const formatRouteTitle = (title?: string | (() => string)): string =>
    title ? t(String(typeof title === 'function' ? title() : title)) : ''

const normalizePath = (parentPath = '', currentPath = ''): string => {
    if (!currentPath) return parentPath || '/'
    if (currentPath.startsWith('/')) return currentPath

    const basePath = parentPath === '/' ? '' : parentPath
    return `${basePath}/${currentPath}`.replace(/\/+/g, '/') || '/'
}

const buildMenuNode = (route: SidebarRoute, parentPath = ''): SidebarMenuNode | null => {
    if (route.meta?.isShow) return null

    const currentPath = normalizePath(parentPath, route.path)
    const children = (route.children ?? [])
        .map((child) => buildMenuNode(child, currentPath))
        .filter((child): child is SidebarMenuNode => Boolean(child))

    const item: SidebarMenuNode = {
        key: currentPath,
        title: formatRouteTitle(route.meta?.title),
        icon: route.meta?.icon ? String(route.meta.icon) : undefined,
        role: route.meta?.role ? String(route.meta.role) : undefined,
    }

    if (route.meta?.hidden && children.length === 1) {
        return item
    }

    if (children.length) {
        return {
            ...item,
            children,
        }
    }

    return item
}

const flattenLeafNodes = (items: SidebarMenuNode[]): SidebarMenuNode[] =>
    items.flatMap((item) => (item.children?.length ? flattenLeafNodes(item.children) : [item]))

const findSelectedNode = (items: SidebarMenuNode[], currentPath: string, currentRole: string) => {
    const leafNodes = flattenLeafNodes(items)

    if (currentRole) {
        const matchedByRole = leafNodes.find((item) => item.role === currentRole)
        if (matchedByRole) return matchedByRole
    }

    const matchedByPath = leafNodes
        .filter(
            (item) =>
                item.key === currentPath ||
                (item.key !== '/' && currentPath.startsWith(`${item.key}/`)),
        )
        .sort((a, b) => b.key.length - a.key.length)[0]

    return matchedByPath ?? null
}

const sidebarMenuItems = computed(() =>
    (routes.value as SidebarRoute[])
        .map((route) => buildMenuNode(route))
        .filter((item): item is SidebarMenuNode => Boolean(item)),
)

const selectedKeys = computed(() => {
    const selectedNode = findSelectedNode(
        sidebarMenuItems.value,
        currentRoute.path,
        String(currentRoute.meta?.role ?? ''),
    )

    return selectedNode ? [selectedNode.key] : []
})

const handleMenuItemClick = (path: string): void => {
    push(path)
}
</script>

<template>
    <div class="flex h-full min-h-full flex-col">
        <div class="shrink-0 py-1.5"></div>
        <a-menu
            class="min-h-0 flex-1 overflow-y-auto"
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
