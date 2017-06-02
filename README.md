# DigitalShootingView (DSV)
Scheibenanzeige für mehrere DSCs. Benötigt einen DSC-Gateway als API,
welcher die Teamsummen bildet und alle sonstigen Events vom DSC weitergibt.
Benötigt keine Schreibrechte auf die einzelnen DSCs, beim verbinden des Sockets werden die aktuellen Daten mitgeschickt.



## Demo
Der DSV kann auch öffentlich am Internet betrieben werden, falls der DSC-Gateway Port öffentlich erreichbar ist (Schreibrechte beim Gateway deaktivieren). [Live Demo](http://live.diana-dettingen.de).

![alt text](https://raw.githubusercontent.com/DigitalShooting/assets/master/DSV_1.png)



## Installation

### Abhängigkeiten
- nodejs (>4)
- npm

### Git
````
# clone
git clone https://github.com/DigitalShooting/DSV.git
cd DSV

# NPM rebuild
npm rebuild

# configure
ls config/

# start
node index.js
````



## Config
Siehe `/config/*`.



## Licence
GNU GENERAL PUBLIC LICENSE Version 3
