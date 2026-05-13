export default defineNuxtRouteMiddleware((to, from) => {
  const studentStore = useStudentStore()

  // Evitar bucle infinito si ya va a la ruta del checklist
  if (to.path === '/metacognition/checklist') {
    return
  }

  // Si el Motor Pedagógico solicitó un checklist, redirigir
  if (studentStore.isChecklistPending) {
    return navigateTo('/metacognition/checklist')
  }
})
