<script setup lang="ts">
import type { PropType } from 'vue';

const { t } = useI18n();

interface ApprovalItem {
    user: string;
    checkState: number;
    checkResult: number;
}

const props = defineProps({
    flowArr: {
        type: Array as PropType<ApprovalItem[]>,
        require: true,
        default: () => [],
    },
    sendUser: { // 审核状态
        type: String,
        require: true,
        default: () => '',
    }
});
</script>

<template>
    <div>
        <div class="flex flex-row items-start">
            <div class="flex flex-row text-xs">
                <div class="flex flex-col items-center">
                    <span class="h-[10px] w-[10px] rounded-full bg-[#1677ff]"></span>
                    <span class="mt-1.5 w-10 truncate text-center text-[12px] text-[darkgray]">{{ t('发起') }}</span>
                    <span v-if="props.sendUser" class="mt-1.5 w-10 truncate text-center text-[12px] text-[darkgray]">{{ props.sendUser }}</span>
                </div>
                <div class="mt-1 mx-[6px] h-px w-5 bg-[#1677ff]"></div>
            </div>
            <div
                v-for="(item, i) of props.flowArr"
                :key="i"
                class="flex flex-row text-xs"
            >
                <div class="flex flex-col items-center">
                    <span class="h-[10px] w-[10px] rounded-full bg-[#1677ff]"></span>
                    <a-tooltip placement="topLeft" :title="item.user">
                        <span class="mt-1.5 w-10 truncate text-center text-[12px] text-[darkgray]" :title="item.user">
                            {{ item.user || '--' }}
                        </span>
                    </a-tooltip>
                    <span
                        class="mt-1.5 w-10 truncate text-center text-[12px]"
                        :style="{ color: item.checkState === 1 ? '#11a816' : '#f4064d' }"
                    >
                        {{ item.checkState === 1 ? t('已审核') : t('待审核') }}
                    </span>
                    <span v-if="item.checkResult === 1" class="mt-1.5 w-10 truncate text-center text-[12px] text-[#11a816]">{{ t('通过') }}</span>
                    <span v-if="item.checkResult === 2" class="mt-1.5 w-10 truncate text-center text-[12px] text-[#ef1d09]">{{ t('拒绝') }}</span>
                </div>
                <div class="mt-1 mx-[6px] h-px w-5 bg-[#1677ff]"></div>
            </div>
            <div class="flex flex-row text-xs">
                <div class="flex flex-col items-center">
                    <span class="h-[10px] w-[10px] rounded-full bg-[#1677ff]"></span>
                    <span class="mt-1.5 w-10 truncate text-center text-[12px] text-[darkgray]">{{ t('结束') }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
