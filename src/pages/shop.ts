function initShopAnimations(): void {
  if (window.location.pathname !== '/shop/') { return }
  // Future: page-specific scroll animations for Shop page content
}

document.addEventListener('turbo:load', initShopAnimations)
