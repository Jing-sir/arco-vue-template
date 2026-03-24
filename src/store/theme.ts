/**
 * 主题色浏览器缓存 key。
 * 统一放在 store 内部维护，避免组件层重复拼 key 字符串。
 */
const THEME_COLOR_STORAGE_KEY = 'admin-template-theme-color';

/**
 * 项目默认主题色。
 * 当浏览器缓存不存在或缓存值无效时，统一回退到这个颜色。
 */
const DEFAULT_THEME_COLOR = '#EB116F';

/**
 * 校验主题色是否为合法十六进制颜色值。
 * 这里只接受 #RGB / #RRGGBB 两种常见格式，避免把异常字符串写进 CSS 变量。
 */
const isValidHexColor = (value = ''): boolean => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);

export default defineStore('theme', () => {
    /**
     * 当前实际生效的主题色。
     * 页面侧取色器会直接双向绑定到这里。
     */
    const defaultColor = ref(DEFAULT_THEME_COLOR);

    /**
     * 将主题色写入根节点 CSS 变量。
     * 所有依赖 `--color-primary-6` 的地方都会立即响应。
     */
    const applyThemeColor = (color: string): void => {
        document.documentElement.style.setProperty('--color-primary-6', color);
    };

    /**
     * 从浏览器缓存读取主题色。
     * 如果缓存值不存在或格式非法，则返回 null，交由初始化逻辑统一回退默认值。
     */
    const getStoredThemeColor = (): string | null => {
        if (typeof window === 'undefined') return null;

        const storedColor = window.localStorage.getItem(THEME_COLOR_STORAGE_KEY)?.trim() ?? '';
        return isValidHexColor(storedColor) ? storedColor : null;
    };

    /**
     * 将主题色写回浏览器缓存。
     * 这样用户刷新页面后仍然能沿用上一次选择。
     */
    const persistThemeColor = (color: string): void => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(THEME_COLOR_STORAGE_KEY, color);
    };

    /**
     * 初始化主题色。
     *
     * 规则：
     * 1. 浏览器缓存里有合法主题色 -> 使用缓存值
     * 2. 浏览器缓存没有或非法 -> 使用默认值
     * 3. 无论哪种情况，都把最终值同步到 CSS 变量
     */
    const initThemeColor = (): void => {
        const themeColor = getStoredThemeColor() ?? DEFAULT_THEME_COLOR;

        defaultColor.value = themeColor;
        applyThemeColor(themeColor);

        // 浏览器里没有值时，把默认值也补写进去，保证后续读取来源一致。
        if (!getStoredThemeColor()) {
            persistThemeColor(themeColor);
        }
    };

    /**
     * 更新主题色。
     *
     * 用户在颜色选择器确认后，会同时触发：
     * 1. 更新 store 内部状态
     * 2. 写入根节点 CSS 变量
     * 3. 持久化到浏览器缓存
     */
    const upDefaultColor = (val: string): void => {
        const nextColor = isValidHexColor(val) ? val : DEFAULT_THEME_COLOR;

        defaultColor.value = nextColor;
        applyThemeColor(nextColor);
        persistThemeColor(nextColor);
    };

    return {
        defaultColor,
        initThemeColor,
        upDefaultColor,
    };
});
