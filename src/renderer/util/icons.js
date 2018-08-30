export function currencyIcon (currency) {
  switch (currency) {
    case 'eur':
      return 'euro-sign'
    default:
      return 'dollar-sign'
  }
}

export function stateIcon (state) {
  switch (state) {
    case 'fa-check-circle':
      return 'check-circle'
    case 'fa-circle':
      return 'circle'
    default:
      return ['far', 'circle']
  }
}
