function initBookTrial(): void {
  if (!window.location.pathname.startsWith('/book-trial')) { return }
  // Future: page-specific animations or analytics events
}

document.addEventListener('turbo:load', initBookTrial)
