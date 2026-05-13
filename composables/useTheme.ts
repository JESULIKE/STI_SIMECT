export const useTheme = () => {
  const uiStore = useUIStore()

  const isDark = computed(() => uiStore.isDark)
  const toggleTheme = () => uiStore.toggleDark()
  const setDark = (value: boolean) => uiStore.setDark(value)

  return { isDark: readonly(isDark), toggleTheme, setDark }
}
