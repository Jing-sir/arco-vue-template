import { defineStore } from 'pinia';
import { ref } from 'vue';

export default defineStore('theme', () => {
    const defaultColor = ref('#EB116F')

    const upDefaultColor = (val: string): void => {
        document.documentElement.style.setProperty('--color-primary-6', val || defaultColor.value);
    };

    return {
        defaultColor,
        upDefaultColor,
    };
});
