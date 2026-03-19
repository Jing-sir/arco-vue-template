<script setup lang="ts">
import { ref } from 'vue';

const { t } = useI18n();

defineProps<{ msg: string }>();

const count = ref(0);
</script>

<template>
  <h1>{{ msg }}</h1>

  <p>
    {{ t('推荐的 IDE 配置：') }}
    <a href="https://code.visualstudio.com/" target="_blank">VS Code</a>
    +
    <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
  </p>

  <p>{{ t('更多信息请查看 README.md。') }}</p>

  <p>
    <a href="https://vitejs.dev/guide/features.html" target="_blank">
      {{ t('Vite 文档') }}
    </a>
    |
    <a href="https://v3.vuejs.org/" target="_blank">{{ t('Vue 3 文档') }}</a>
  </p>

  <button type="button" @click="count++">{{ t('当前计数：{count}', { count }) }}</button>
  <p>{{ t('编辑 components/HelloWorld.vue 以测试热更新。') }}</p>
</template>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
