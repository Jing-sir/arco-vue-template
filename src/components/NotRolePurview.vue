<template>
  <div class="flex-direction-column flex-align-items-center router-view-wrap">
<!--    <IconFont style="font-size: 150px; margin-top: 100px;" type="icon-meiyouquanxian" />-->
    <a-empty style="margin-top: 140px" :description="t('暂无权限,请咨询管理员')" />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>
