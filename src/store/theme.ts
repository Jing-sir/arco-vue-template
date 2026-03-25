/**
 * 主题色浏览器缓存 key。
 * 统一放在 store 内部维护，避免组件层重复拼 key 字符串。
 */
const THEME_COLOR_STORAGE_KEY = 'admin-template-theme-color';

/**
 * 主题模式浏览器缓存 key。
 * 只保存用户偏好的模式值，不直接保存当前解析后的 light / dark 结果。
 */
const THEME_MODE_STORAGE_KEY = 'admin-template-theme-mode';

/**
 * 项目默认主题色。
 * 当浏览器缓存不存在或缓存值无效时，统一回退到这个颜色。
 */
const DEFAULT_THEME_COLOR = '#EB116F';

/**
 * 项目默认主题模式。
 * 为了不影响当前已有页面观感，默认仍然保持亮色。
 */
const DEFAULT_THEME_MODE = 'light';

/**
 * 系统颜色模式监听 media query。
 * 当用户选择跟随系统时，后续通过它监听系统主题变化。
 */
const SYSTEM_COLOR_SCHEME_MEDIA = '(prefers-color-scheme: dark)';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedThemeMode = 'light' | 'dark';

/**
 * 校验主题色是否为合法十六进制颜色值。
 * 这里只接受 #RGB / #RRGGBB 两种常见格式，避免把异常字符串写进 CSS 变量。
 */
const isValidHexColor = (value = ''): boolean => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);

/**
 * 校验主题模式是否为项目支持的合法值。
 * 非法值统一回退到默认模式，避免把异常字符串写进缓存或 DOM 属性。
 */
const isValidThemeMode = (value = ''): value is ThemeMode =>
    ['light', 'dark', 'system'].includes(value as ThemeMode);

export default defineStore('theme', () => {
    /**
     * 当前主题模式偏好。
     * 这个值表示用户选择的是亮色、暗色，还是跟随系统。
     */
    const themeMode = ref<ThemeMode>(DEFAULT_THEME_MODE);

    /**
     * 当前实际解析后的主题模式。
     * 例如用户选择 system 时，这里会根据系统状态得到真正生效的 light / dark。
     */
    const resolvedThemeMode = ref<ResolvedThemeMode>(DEFAULT_THEME_MODE);

    /**
     * 当前实际生效的主题色。
     * 页面侧取色器会直接双向绑定到这里。
     */
    const defaultColor = ref(DEFAULT_THEME_COLOR);

    /**
     * 系统主题监听器移除函数。
     * 只在用户选择跟随系统时才真正有意义，但统一在 store 内部维护更稳妥。
     */
    let removeSystemThemeListener: (() => void) | null = null;

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
     * 从浏览器缓存读取主题模式。
     * 如果缓存值不存在或非法，则返回 null，交由初始化逻辑统一回退默认值。
     */
    const getStoredThemeMode = (): ThemeMode | null => {
        if (typeof window === 'undefined') return null;

        const storedThemeMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY)?.trim() ?? '';
        return isValidThemeMode(storedThemeMode) ? storedThemeMode : null;
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
     * 将主题模式写回浏览器缓存。
     * 这样用户刷新页面后仍然能沿用上一次的明暗模式选择。
     */
    const persistThemeMode = (mode: ThemeMode): void => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    };

    /**
     * 根据用户偏好解析当前实际应生效的主题模式。
     * 当用户选择 system 时，解析结果依赖系统当前的 prefers-color-scheme。
     */
    const resolveThemeMode = (mode: ThemeMode): ResolvedThemeMode => {
        if (mode === 'dark') return 'dark';
        if (mode === 'light') return 'light';

        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return DEFAULT_THEME_MODE;
        }

        return window.matchMedia(SYSTEM_COLOR_SCHEME_MEDIA).matches ? 'dark' : 'light';
    };

    /**
     * 清理系统主题监听器。
     * 每次重新初始化主题模式监听前都先调用，避免重复绑定。
     */
    const cleanupSystemThemeListener = (): void => {
        removeSystemThemeListener?.();
        removeSystemThemeListener = null;
    };

    /**
     * 当用户选择跟随系统时，监听系统主题变化。
     * 系统主题切换后，会重新计算解析结果并同步 DOM 属性。
     */
    const bindSystemThemeListener = (): void => {
        cleanupSystemThemeListener();

        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

        const mediaQueryList = window.matchMedia(SYSTEM_COLOR_SCHEME_MEDIA);
        const onSystemThemeChange = (): void => {
            if (themeMode.value !== 'system') return;
            applyThemeMode(themeMode.value);
        };

        if (typeof mediaQueryList.addEventListener === 'function') {
            mediaQueryList.addEventListener('change', onSystemThemeChange);
            removeSystemThemeListener = () => {
                mediaQueryList.removeEventListener('change', onSystemThemeChange);
            };
            return;
        }

        mediaQueryList.addListener(onSystemThemeChange);
        removeSystemThemeListener = () => {
            mediaQueryList.removeListener(onSystemThemeChange);
        };
    };

    /**
     * 将主题模式同步到 DOM。
     *
     * 这里同时维护三类信息：
     * 1. `data-app-theme-mode`：用户显式选择的模式
     * 2. `data-app-theme-resolved`：当前实际生效的 light / dark
     * 3. `arco-theme`：驱动 Arco 进入 dark token 分支
     */
    const applyThemeMode = (mode: ThemeMode): void => {
        if (typeof document === 'undefined') return;

        const nextResolvedThemeMode = resolveThemeMode(mode);
        const { body, documentElement } = document;

        themeMode.value = mode;
        resolvedThemeMode.value = nextResolvedThemeMode;

        body.setAttribute('data-app-theme-mode', mode);
        body.setAttribute('data-app-theme-resolved', nextResolvedThemeMode);

        if (nextResolvedThemeMode === 'dark') {
            body.setAttribute('arco-theme', 'dark');
        } else {
            body.removeAttribute('arco-theme');
        }

        documentElement.style.colorScheme = nextResolvedThemeMode;
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
     * 初始化主题模式。
     *
     * 规则：
     * 1. 浏览器缓存里有合法模式 -> 使用缓存值
     * 2. 浏览器缓存没有或非法 -> 使用默认值
     * 3. 将最终主题模式同步到 DOM，并绑定系统主题监听
     */
    const initThemeMode = (): void => {
        const mode = getStoredThemeMode() ?? DEFAULT_THEME_MODE;

        applyThemeMode(mode);
        bindSystemThemeListener();

        if (!getStoredThemeMode()) {
            persistThemeMode(mode);
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

    /**
     * 更新主题模式。
     *
     * 用户切换模式时，会同时触发：
     * 1. 更新 store 内部状态
     * 2. 重新计算解析后的 light / dark
     * 3. 同步到 DOM 属性和 Arco dark 标记
     * 4. 持久化到浏览器缓存
     */
    const updateThemeMode = (mode: ThemeMode): void => {
        const nextThemeMode = isValidThemeMode(mode) ? mode : DEFAULT_THEME_MODE;

        applyThemeMode(nextThemeMode);
        bindSystemThemeListener();
        persistThemeMode(nextThemeMode);
    };

    return {
        defaultColor,
        themeMode,
        resolvedThemeMode,
        initThemeColor,
        initThemeMode,
        upDefaultColor,
        updateThemeMode,
    };
});
