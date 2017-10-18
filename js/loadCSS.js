// Import all necessary CSS


//Bulma
const bulma=document.createElement("link")
bulma.setAttribute("rel","stylesheet")
bulma.setAttribute("href","../node_modules/bulma/css/bulma.css")
document.head.appendChild(bulma)

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
themeCSS.setAttribute("rel","stylesheet")
if(jsonfile.readFileSync(__dirname+'/../settings.json').theme === 'light'){
  themeCSS.setAttribute("href","../assets/light.css");
} else {
  themeCSS.setAttribute("href","../assets/dark.css");
}
document.head.appendChild(themeCSS)
