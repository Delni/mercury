// Import all necessary CSS


//Bulma
let bulma=document.createElement("link")
bulma.setAttribute("rel","stylesheet")
bulma.setAttribute("href","../node_modules/bulma/css/bulma.css")
document.head.appendChild(bulma)

//FontAwesome
let fontawesome=document.createElement("link")
fontawesome.setAttribute("rel","stylesheet")
fontawesome.setAttribute("href","../assets/font-awesome/css/font-awesome.css")
document.head.appendChild(fontawesome)

const jsonfile = require('jsonfile')

// Personnal CSS
let myCSS = document.createElement("link")
myCSS.setAttribute("rel","stylesheet")
if(jsonfile.readFileSync(__dirname+'/../settings.json').theme === 'light'){
  myCSS.setAttribute("href","../assets/light.css");
} else {
  myCSS.setAttribute("href","../assets/dark.css");
}
document.head.appendChild(myCSS)
