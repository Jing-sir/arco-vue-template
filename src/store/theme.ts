import { defineStore } from 'pinia';
import { ref } from 'vue';

export default defineStore('theme', () => {
    const defaultColor = ref('#165DFF');

    const upDefaultColor = (val: string): void => {
        document.documentElement.style.setProperty('--color-primary-6', defaultColor.value);
    };

    return {
        defaultColor,
        upDefaultColor,
    };
});
