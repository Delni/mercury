import CURRENCIES from '../../config/currencies.json'

export function currencyIcon (currency) {
  const currencyObj = CURRENCIES.filter(x => x.key === currency)

  // fallback
  if (!currencyObj.length || !currencyObj[0].icon) return 'money-bill'

  return currencyObj[0].icon
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
