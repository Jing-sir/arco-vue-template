
export function useOnActivated(fn:() => void) {
    const route = useRoute();
    onActivated(() => {
        if (route.hash === '#no-refresh') return; // 不需要刷新
        fn();
    });
}
