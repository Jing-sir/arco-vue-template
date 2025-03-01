<script setup lang="ts">
import theme from '@/store/theme';

const store = theme();

</script>

<template>
    <a-space>
        <a-color-picker v-model="store.defaultColor" size="mini" show-text disabled-alpha @change="store.upDefaultColor" />
    </a-space>
</template>

<style scoped lang="scss">
.color-block {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    margin-right: 10px;

    &.blue {
        background: #1890ff;
    }

    &.orange {
        background: #ff6900;
    }
}

.color-item {
    cursor: pointer;
    margin-top: 10px;
}
</style>
