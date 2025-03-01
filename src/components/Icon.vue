<script setup lang="ts">
import { Icon } from '@arco-design/web-vue';

const IconFont = Icon.addFromIconFontCn({ src: 'https:////at.alicdn.com/t/c/font_4236741_ak9xwdnyjlk.js' });

const props = defineProps({
    iconType: {
        type: String,
        default: () => ''
    },
});
</script>

<template>
  <IconFont :type="props.iconType" />
</template>

<style scoped lang="scss">

</style>
