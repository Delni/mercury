import { translate } from '../filters'

/**
 * Translates a configuration name to its equivalent.
 * @param obj {string|*} Object (with 'name' as property) or String.
 * @returns {string} The translated string
 */
export function configTranslation (obj) {
  let name
  if (obj instanceof Object) {
    name = obj.name
  } else {
    name = obj.toString()
  }
  return name.startsWith('$')
    ? translate(name.replace('$', ''))
    : name
}
