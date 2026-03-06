function initAboutAnimations(): void {
  if (window.location.pathname !== '/about/') { return }
  // Future: page-specific scroll animations for About page content
}

document.addEventListener('turbo:load', initAboutAnimations)
