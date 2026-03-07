function initContactAnimations(): void {
  if (window.location.pathname !== '/contact/') { return }
  // Future: page-specific animations for Contact page
}

document.addEventListener('turbo:load', initContactAnimations)
