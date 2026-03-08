function initNextSteps(): void {
  if (!window.location.pathname.startsWith('/trial-class-next-steps')) { return }
  // Future: confetti, analytics, or dynamic personalisation from URL params
}

document.addEventListener('turbo:load', initNextSteps)
