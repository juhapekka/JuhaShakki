# JuhaShakki
JuhaShakki on selaimessa pelattava shakkipeli. Pelissä käyttäjä pelaa valkoisilla tietokonetta vastaan. Tietokone valitsee siirtonsa alpha–beta-karsintaa käyttävällä minimax haulla. Asemia arvioidaan materiaalin ja nappuloiden sijainnin perusteella.

Live versio projektin kehityksestä nähtävissä täällä https://juhapekka.github.io/public/

## Käynnistäminen ja pelaaminen

Peli käynnistetään avaamalla public/index.html tiedosto selaimessa. Käyttöliittymässä on vaikeusasteen valinta (helppo/normaali/vaikea), pelin uudelleen käynnistäminen ja itse shakkilauta. Peli aloitetaan tekemällä ensimmäinen siirto valkoisilla nappuloilla. Siirron jälkeen tietokone tekee vastasiirron. Vaikeusastetta voi vaihtaa pelin kuluessa ja se vaikuttaa tietokoneen seuraavaan siirtoon.

## Kehitysympäristön asennus

Projekti tarvitsee Node.js:n. npm tulee Node.js:n mukana eli sitä ei tarvitse asentaa erikseen.

1. Asenna Node.js:n LTS-versio käyttöjärjestelmällesi:
   <https://nodejs.org/>

   - Windows: lataa ja suorita LTS-asennusohjelma.
   - macOS: lataa LTS-asennusohjelma tai asenna Homebrewlla komennolla 'brew install node'.
   - Linux: asenna Node.js jakelusi pakettienhallinnalla tai Node.js:n sivuilta löytyvällä ohjeella.

2. Avaa uusi terminaali ja varmista asennus:
   ```sh
   node --version
   npm --version
   ```
Projektissa ei ole ulkoisia npm riippuvuuksia eli erillistä riippuvuuksien asentamista ei tarvita.

## Testit
Projektissa mukana olevat testit voi ajaa suorittamalla projektin juuressa
   ```sh
   npm run test
   ```

## Dokumentit

- [Määrittelydokumentti](dokumentit/Määrittelydokumentti.md)
- [Toteutusdokumentti](dokumentit/Toteutusdokumentti.md)
- [Testausdokumentti](dokumentit/Testausdokumentti.md)
- [Viikkoraportti 1](dokumentit/Viikkoraportti1.md)
- [Viikkoraportti 2](dokumentit/Viikkoraportti2.md)
- [Viikkoraportti 3](dokumentit/Viikkoraportti3.md)
- [Viikkoraportti 4](dokumentit/Viikkoraportti4.md)

## Nykyinen tila
- toteuttamattomat shakkisäännöt:
  - Linnoitus
  - Ohestalyönti
  - Sotilas korotetaan automaattisesti kuningattareksi
