function initScheduleAnimations(): void {
  if (window.location.pathname !== '/schedule/') { return }
  // Future: page-specific scroll animations for Schedule page content
}

document.addEventListener('turbo:load', initScheduleAnimations)
