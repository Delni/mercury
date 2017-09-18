// Import all necessary CSS

// Bootstrap
/*let bootstrap = document.createElement("link")
bootstrap.setAttribute("rel","stylesheet")
bootstrap.setAttribute("href","../node_modules/bootstrap/dist/css/bootstrap.min.css")
document.head.appendChild(bootstrap)*/

//Photon
/*let photon = document.createElement("link")
photon.setAttribute("rel","stylesheet")
photon.setAttribute("href","assets/photon/dist/css/photon.min.css")
document.head.appendChild(photon)*/

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

// Personnal CSS
let myCSS = document.createElement("link")
myCSS.setAttribute("rel","stylesheet")
myCSS.setAttribute("href","../assets/master.css")
document.head.appendChild(myCSS)
