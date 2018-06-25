![icon](/img/256x256.png)

# Mercury
Current version packed : `v1.1.2`  
The budget planner of the 21st century  

:construction: Please be aware that Mercury is in constant development, you may encounter unknown bug :construction:

If you like my work, please [donate for coffee](http://ko-fi.com/delnim) ! :coffee:

---

*Mercury* offer basic budget planner functionality, such as managing account, add / edit / delete operation... I always wanted a tool as MSMoney or [HomeBank](http://homebank.free.fr), but with improved and modern UI. HomeBank was the software I used to use, and many features come from there.  
This application is built on top of [Electron](electron.atom.io)

Developped with ♥ for you

Supported languages : `English`,`Français`  
*Send an e-mail if you want to help to translate in your language!*

---
# Previews
| Dark UI (default) | White UI     |
| :------------- | :------------- |
| ![mainView](/img/mainViewDark.png) | ![mainView](/img/mainViewLight.png)       |
| ![mainView](/img/accountViewDark.png) | ![mainView](/img/accountViewLight.png) |


# Features
 * Create or delete any account
 * Create / Edit / Delete any operation
 * Create / Edit / Delete recurring operation
 * Filter operation with easy-to-access basic filters
 * Manage your outcome with reports over time / categories
 * Manage beneficiaries and categories in the settings
 * `MacOS` TouchBar integration
 * Choose your (theme) side
 * Translated in English & French


 *Next to come : advanced filters, TouchBar improvements, ...*
## Roadmap : 
 * [ ] Add "*latest*" checker
 * [ ] Add transaction binding from other currency ([issue#3](https://github.com/Delni/mercury/issues/3))
 * [ ] Add data encryption ([issue#8](https://github.com/Delni/mercury/issues/8))
 * [ ] Add webDav / cloud sync ([issue#8](https://github.com/Delni/mercury/issues/8))
 * [ ] More translations !

# How to use
Clone the GitHub repository. You need [Node.js](https://nodesjs.org) and [npm](https://npmjs.com) installed on your system. Go to terminal:

```
# Clone the repository
$ git clone https://github.com/Delni/mercury.git

# Go to directory
$ cd mercury

# Install dependencies
$ yarn

# Start the app
$ yarn run dev
```

# Downloads
[Go to downloads page](https://github.com/Delni/mercury/releases)  
Download for MacOS & Windows

*Linux coming soon (as soon as tested)*  
*Not available at the moment.*

# Contribute
If the application has any kind of bugs, feel free to open an issue. We will look into it & come up with a solution. Create a new pull request if you have fixed any kind of bugs.

The request would be merged if it fixes the bug & does not disturb the whole application in any way.

## :warning: Huge change ahead
The current work is to migrate Mercury from a JQuery-based interface to Vue.js for better scalability, maintainability, testing, etc. If you have already worked or forked this repo, find v1 under the branch `legacy/v1`

# Third-party

  * [ElectronJS](https://electron.atom.io)
  * [NodeJS](https://nodesjs.org)
  * [MomentJS](http://momentjs.com/)
  * [Font Awesome](http://fontawesome.io/)
  * [Bulma](http://bulma.io/)
  * [typehead.js](https://github.com/twitter/typeahead.js/)
  * [ChartJS](http://www.chartjs.org/)
  * [sql.js](https://github.com/kripken/sql.js)
  * [i18njs](http://i18njs.com/)

# License

```
MIT License

Copyright (c) 2018 Nicolas Delauney

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
