import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', () => {
  const sidebarOpen = ref(true)
  const sidebarCollapsed = ref(false)

  const toggleSidebar = () => { sidebarOpen.value = !sidebarOpen.value }
  const toggleSidebarCollapse = () => { sidebarCollapsed.value = !sidebarCollapsed.value }

  // Mantener initTheme vacío para evitar errores en layouts que lo llamen
  const initTheme = () => {}

  return {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar, toggleSidebarCollapse, initTheme,
  }
})
