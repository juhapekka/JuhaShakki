# JuhaShakki – määrittelydokumentti

Projektin tarkoituksena on toteuttaa shakkipeli mikä toimii verkkosivuna tavallisessa selaimessa.
## Perustiedot
- Toteutusympäristönä on selain ja node.js kehitys- ja rakennustyökaluina
- Ohjelmointikieli: JavaScript
- Muut kielet, joilla pystyn tarvittaessa vertaisarvioimaan projekteja: c/c++, python, java ja swift
- Opinto-ohjelma: tkt kandi


## Aihe ja ratkaistava ongelma
Työssä tarkoitus toteuttaa selaimessa toimiva shakkipeli. Käyttäjä pelaa aina tietokonetta vastaan. Ohjelman tavoitteena on valita tietokoneelle järkeviä siirtoja ilman ulkoista palvelinta.

Shakkipelissä mahdollisia siirtoja on paljon. Kaikkia tulevia tilanteita ei voi koskaan käydä läpi. Ohjelma arvioi rajatun määrän tulevia asemia ja valitsee parhaan siirron olettaen vastustajan pyrkivän parhaaseen mahdolliseen vastukseen.

## Työn ydin
Työn ydin on tietokonevastustajan toteutus alpha-beta-karsitulla minimax-haulla. Käyttöliittymä, laudan piirtäminen ja siirtojen syöttäminen ovat tarpeellisia, jotta tekoälyä voi käyttää, mutta pääosa työstä kohdistuu siirtojen generointiin, asemien arviointiin, hakupuun läpikäyntiin ja alpha-beta-karsintaan.

Aikataulun salliessa pelin älykkyyttä voi laajentaa tekemällä avauskirja historiallisista pgn peleistä. Avauskirjan siirrot pakataan Huffman-koodauksella ja sitä käytetään ennen alpha-beta-hakua jos pelitilanne vastaa tunnettua avausta.

## Syötteet ja tulosteet
- Pelin pääsyöte on käyttäjän tekemä shakkisiirto selaimen käyttöliittymässä.
- Ohjelma tarkistaa siirron laillisuuden ja päivittää laudan.
- Ohjelma laskee vastustajan vastasiirron.

## Algoritmit ja tietorakenteet
algoritmit:
- laillisten shakkisiirtojen generointi
- minimax-haku
- alpha-beta-rajaus
- mahdollisesti Huffman-koodaus avauskirjan pakkaamiseen + avauskirjan seuraavan siirron valinta

tietorakenteet:
- 64-alkioinen taulukko shakkilaudalle
- rekursiivisesti läpikäytävä hakupuu
  
## Aika- ja tilavaativuudet
Olkoon 'b' keskimääräinen laillisten siirtojen määrä asemassa ja 'd' haun syvyys.

Tavallisen minimax-haun aikavaativuus on O(b^d), koska jokaisessa asemassa käydään läpi sen mahdolliset jatkosiirrot. 
Alpha-beta karsinnan pahin tapaus on edelleen O(b^d), mutta hyvällä siirtojärjestyksellä paras tapaus on O(b^(d/2)). Karsinta jättää tutkimatta haaroja, jotka eivät voi enää vaikuttaa valittavaan siirtoon.

Rekursiivisen haun tilavaativuus on O(d), koska ohjelma säilyttää aktiivisen
hakupolun.
Shakkilaudan koko on kiinteä 8 * 8, joten yksittäisen laudan tallennus vie vakion verran tilaa.

## Lähteet

- Alpha-beta pruning: https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning
- Minimax: https://en.wikipedia.org/wiki/Minimax
- Chess Programming Wiki: https://www.chessprogramming.org/
- PGN Mentor: https://www.pgnmentor.com/
- *An Alternative Efficient Chessboard Representation Based on 4-Bit Piece Coding*: https://doiserbia.nb.rs/img/doi/0354-0243/2012/0354-02431200011V.pdf