function initLoginPage(): void {
  if (window.location.pathname !== '/login/') { return }

  // Inject GymDesk login URL from environment variable
  const link = document.getElementById('gymdesk-login-link') as HTMLAnchorElement | null
  const loginUrl = (import.meta as { env?: { VITE_GYMDESK_LOGIN_URL?: string } }).env?.VITE_GYMDESK_LOGIN_URL
  if (link && loginUrl) { link.href = loginUrl }
}

document.addEventListener('turbo:load', initLoginPage)
