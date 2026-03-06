function initProgramsAnimations(): void {
  if (window.location.pathname !== '/programs/') { return }
  // Future: page-specific scroll animations for Programs page content
}

document.addEventListener('turbo:load', initProgramsAnimations)
