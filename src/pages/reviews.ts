function initReviewsAnimations(): void {
  if (window.location.pathname !== '/reviews/') { return }
  // Future: page-specific scroll animations for Reviews page content
}

document.addEventListener('turbo:load', initReviewsAnimations)
