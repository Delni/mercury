import { translate } from '../filters'

export function currencyTranslation (currencyObj) {
  let name
  if (currencyObj instanceof Object) {
    name = currencyObj.name
  } else {
    name = currencyObj.toString()
  }

  return name.startsWith('$')
    ? translate(name.replace('$', ''))
    : name
}
