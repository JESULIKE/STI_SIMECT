export const useAuth = () => {
  const { loggedIn, user, session, fetch: refreshSession, clear } = useUserSession()

  const logout = async () => {
    await clear()
    await navigateTo('/auth/login')
  }

  const isRole = (role: string) => user.value?.role === role

  return {
    loggedIn: readonly(loggedIn),
    user: readonly(user),
    session: readonly(session),
    refreshSession,
    logout,
    isRole,
  }
}
