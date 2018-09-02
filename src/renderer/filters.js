import jsonfile from 'jsonfile'
import i18njs from 'i18njs'
import Vue from 'vue'
import moment from 'moment'
import path from 'path'

const decimalSeperator = 1.1.toLocaleString().substring(1, 2)
let globSettings = jsonfile.readFileSync(path.join(__static, 'settings.json'))
const lang = jsonfile.readFileSync(`${__static}/lang/${globSettings.language}_.json`)
i18njs.add(globSettings.language, '', lang)
i18njs.setLang(globSettings.language)

Vue.filter('translate', (value, option) => {
  return translate(value, option)
})
Vue.filter('date', (value) => {
  let formattedMoment = moment(value).format(globSettings.dateFormat)
  return formattedMoment
})

Vue.filter('format', (value) => {
  // try parse float if possible
  if (typeof value === 'string' || value instanceof String) {
    value = parseLocalizedString(value)
  }
  return format(value)
})

export function translate (value, option) {
  if (!value) return ''
  value = value.toString()
  if (i18njs.has('.RENDERER.' + value)) return i18njs.get('.RENDERER.' + value, option)
  if (i18njs.has('.COMMON.' + value)) return i18njs.get('.COMMON.' + value, option)
  return i18njs.get(value, option)
}

export function parseLocalizedString (str) {
  // fix decimal delimiter
  str = decimalSeperator === ','
    ? str.replace(',', '.')
    : str
  return parseFloat(str)
}

export function format (value) {
  if ((typeof value === 'number' || value instanceof Number) && !isNaN(value)) {
    // format if number and not NaN
    return value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
  } else {
    return value
  }
}
