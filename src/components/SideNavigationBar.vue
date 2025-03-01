<script setup lang="ts">
import '@iconfu/svg-inject';


const hasRoute = useRoute();
const selectedKeys = ref<string[]>(['/']);
const isShowSidebar = ref<boolean>(true);

const store = sideBar();
const { push } = useRouter();
const { routes, roleMenu, isSidebar } = storeToRefs(store);

const openKeys = computed(() => routes.value?.map(({ path }) => path));

const isShowChild = (children = []) => !children.length; // 判断子路由的item还是menu的显示
const hasOneShowingChild = (children = [], item: any) => children.length === 1 && item.meta.hidden; // 根路由不显示子路由
const handleClickItem = (parentPath = '', childPath = ''): void => { // 根据菜单切换路由
    push(childPath ? `${parentPath}/${childPath}` : parentPath);
};

// const fetchSidebarList: ComputedRef<RouteRecordRaw[]> = computed(() => );

watch(() => hasRoute.path,
    (o: string, n?: string) => {
        if (o !== n) {
            selectedKeys.value = [String(o === '/' ? '/' : o.split('/').pop())];
        }
    }, { deep: true, immediate: true }); // 监听路由重置selectedKeys
</script>

<template>
    <div>
        <div class="is-flex flex-direction-column align-items-center logo-wrap">
        </div>
        <a-menu
            v-model:openKeys="openKeys"
            v-model:selectedKeys="selectedKeys"
            mode="inline"
            theme="dark">
            <template v-for="item of routes" :key="item.path">
                <a-menu-item
                    v-if="hasOneShowingChild(item?.children, item)"
                    :key="item.path">
                    <div class="display-flex flex-align-items-center" @click="handleClickItem(item?.path)">
                        <Icon v-if="item.meta.icon" :icon-type="item.meta.icon" class="icon-size"/>
                        <!--            <img v-if="item.meta.icon" class="icon-svg" onload="SVGInject(this)" :src="require(`../assets/images/icon-${item.meta.icon}.svg`)">-->
                        <span class="title">{{ item.meta?.title }}</span>
                    </div>
                </a-menu-item>
                <a-sub-menu v-if="!hasOneShowingChild(item?.children, item) && !item.meta?.isShow" :key="item.path">
                    <template #title>
                        <div class="display-flex flex-align-items-center">
                            <Icon v-if="item.meta.icon" :icon-type="item.meta.icon" class="icon-size"/>
                            <!--              <img v-if="item.meta.icon" class="icon-svg" onload="SVGInject(this)" :src="require(`../assets/images/icon-${item.meta.icon}.svg`)">-->
                            <span class="title">{{ item.meta?.title }}</span>
                        </div>
                    </template>
                    <div v-for="childItem of item.children" :key="childItem.path">
                        <template v-if="isShowChild(childItem?.children) && !childItem.meta.isShow">
                            <a-menu-item :key="childItem.path">
                                <div class="display-flex flex-align-items-center" @click.stop="handleClickItem(item.path, childItem.path)">
                                    <Icon v-if="childItem.meta.icon" :icon-type="childItem.meta.icon" class="icon-size"/>
                                    <span class="title">{{ childItem.meta.title }}</span>
                                </div>
                            </a-menu-item>
                        </template>
                        <a-sub-menu v-if="!isShowChild(childItem.children)" :key="childItem.path">
                            <template #title>
                                <Icon v-if="childItem.meta.icon" :icon-type="childItem.meta.icon" class="icon-size"/>
                                <span class="title">{{ childItem.meta.title }}</span>
                            </template>
                            <a-menu-item
                                v-for="child of childItem.children"
                                :key="child.path">
                                <div @click.stop="handleClickItem(childItem.path, child.path)">
                                    <Icon v-if="child.meta.icon" :icon-type="child.meta.icon" class="icon-size"/>
                                    <span class="title">{{ child.meta.title }}</span>
                                </div>
                            </a-menu-item>
                        </a-sub-menu>
                    </div>
                </a-sub-menu>
            </template>
        </a-menu>
    </div>
</template>

<style lang="scss" scoped>
.logo-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 0 6px 0;

    img {
        width: 50px;
        margin-right: 8px;
    }

    span {
        font-size: 18px;
        color: #fff;
        text-align: center;
    }
}

.icon-svg {
    width: 16px;
    margin-right: 5px;
}

.icon-size {
    font-size: 16px;
}
</style>
