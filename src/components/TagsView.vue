<script setup lang="ts">
import type { RouteLocationNormalizedLoaded } from 'vue-router';
import { storeToRefs } from 'pinia';
import useTagsView from '@/store/tagsView';
import i18n from '@/setup/i18n-setup';

type CachedRouteLocation = {
    fullPath: string;
};

const store = useTagsView();
const route = useRoute();
const router = useRouter();

const { visitedViews: rawVisitedViews } = storeToRefs(store);

const visitedViews = computed(
    () => rawVisitedViews.value as unknown as RouteLocationNormalizedLoaded[],
);

watch(
    () => route.fullPath,
    () => {
        if (route.path.startsWith('/redirect/')) return;
        store.addVisitedView(route);
    },
    { immediate: true },
);

const deleteVisitedView = (index: number, isActive: boolean): void =>
    store.deleteVisitedView(index, isActive);

const handleGoCacheRoute = (targetRoute: CachedRouteLocation): void => {
    router.replace(`${targetRoute.fullPath}#no-refresh`);
};

const handleGoHome = (): void => {
    router.push('/');
};

const formatRouteTitle = (title?: string | (() => string)): string =>
    title ? String(i18n.global.t(String(typeof title === 'function' ? title() : title))) : '';

const normalizeFullPath = (path = ''): string => path.replace(/#no-refresh$/, '');

const isActiveHome = computed(() => route.path === '/');

const isActiveTab = (item: {
    name?: RouteLocationNormalizedLoaded['name'];
    path: string;
    fullPath: string;
}): boolean => {
    if (item.name && route.name === item.name) return true;
    if (route.path === item.path) return true;

    return normalizeFullPath(route.fullPath) === normalizeFullPath(item.fullPath);
};

const getActiveTabStyle = (isActive: boolean): Record<string, string> =>
    isActive
        ? {
            backgroundColor: 'var(--color-primary-6)',
            color: '#ffffff',
        }
        : {};
</script>

<template>
    <div class="w-full overflow-hidden pb-[14px]">
        <div class="flex gap-2 overflow-x-auto rounded-xl bg-[var(--app-tags-track-bg)] p-2">
            <button
                type="button"
                class="group inline-flex min-h-[32px] shrink-0 items-center gap-2 rounded-lg px-[14px] text-[12px] font-semibold text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-tags-hover-bg)] hover:text-[var(--app-text)]"
                :class="isActiveHome ? 'text-white hover:text-white' : ''"
                :style="getActiveTabStyle(isActiveHome)"
                @click="handleGoHome"
            >
                <span class="whitespace-nowrap">{{ formatRouteTitle('首页') }}</span>
            </button>
            <button
                v-for="({ name, path, meta, fullPath }, index) in visitedViews"
                :key="path"
                type="button"
                class="group inline-flex min-h-[32px] shrink-0 items-center gap-2 rounded-lg px-[14px] text-[12px] font-semibold text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-tags-hover-bg)] hover:text-[var(--app-text)]"
                :class="isActiveTab({ name, path, fullPath }) ? 'text-white hover:text-white' : ''"
                :style="getActiveTabStyle(isActiveTab({ name, path, fullPath }))"
                @click="handleGoCacheRoute({ fullPath })"
            >
                <span class="whitespace-nowrap">{{ formatRouteTitle(meta.title) }}</span>
                <span
                    class="inline-flex h-4 w-4 items-center justify-center rounded-full text-xs text-[var(--app-tag-close-text)] opacity-0 transition-all hover:text-[var(--app-tag-close-hover-text)]"
                    :class="
                        isActiveTab({ name, path, fullPath })
                            ? 'opacity-100 text-white/80 hover:text-white'
                            : 'group-hover:opacity-100'
                    "
                    @click.stop="deleteVisitedView(index, $route.path === path)"
                >
                    ×
                </span>
            </button>
        </div>
    </div>
</template>
