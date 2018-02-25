// Import all necessary CSS


//Bulma
const bulma=document.createElement("link")
bulma.setAttribute("rel","stylesheet")
bulma.setAttribute("href","../node_modules/bulma/css/bulma.css")
document.head.appendChild(bulma)

//bulmaExtensions
const bulmaExt=document.createElement("link")
bulmaExt.setAttribute("rel","stylesheet")
bulmaExt.setAttribute("href","../node_modules/bulma-extensions/dist/bulma-extensions.min.css")
document.head.appendChild(bulmaExt)

//FontAwesome
const fontawesome=document.createElement("link")
fontawesome.setAttribute("rel","stylesheet")
fontawesome.setAttribute("href","../assets/font-awesome/css/font-awesome.css")
document.head.appendChild(fontawesome)

const jsonfile = require('jsonfile')

// Personnal CSS
const myCSS = document.createElement("link")
myCSS.setAttribute("rel","stylesheet")
myCSS.setAttribute("href","../assets/master.css");
document.head.appendChild(myCSS)

// Theme (Black or white)
const themeCSS = document.createElement("link")
let settings = jsonfile.readFileSync(__dirname+'/../settings.json')
themeCSS.setAttribute("rel","stylesheet")
if(settings.theme === 'light'){
  themeCSS.setAttribute("href","../assets/light.css");
} else {
  themeCSS.setAttribute("href","../assets/dark.css");
}
document.head.appendChild(themeCSS);

const i18njs = require('../assets/i18n.min.js')
const lang = jsonfile.readFileSync(__dirname+'/../lang/'+settings.language+'.json')
i18njs.translator.add(lang)
settings = null;
