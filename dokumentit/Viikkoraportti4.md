## Viikko 4
- minmax-alpha-beta algoritmi osaa pelata mustilla
- 3 eri vaikeus astetta mitkä käytännössä on suoraan hakysyvyydet
- käyttöliittymään vaikeusasteen valinta ja pelin resetointi
- testejä, käyttöliittymän muutosten takia alkuperäiset testit tarvi päivitystä, lisätty ui-testit ja minimax-alpha-beta-shakkiäly testit
- käytännössä meni sisään viikon värkkäämiset yhdessä kommitissa mutta se oli kokonaisuus
- koodi alkaa olemaan suht-sekavan oloista ja muuttujien/funktioiden nimeäminen pitää yhdistenäistää ja sisennykset korjata; vscode ei pysy perässä jostain syystä. Koko homma pitää seuraavaksi siivota nyt kun peli alustavasti toimii
- Koodin restrukturointia tehty, nyt koodit on jaettu aihepiireittäin omiin tiedostoihinsa
- Paljon lisää koodin uudelleen järjestelyä. Löytyi minmaxista bugi laudan kanssa rekursiosta mikä nyt korjattu.
- README.md päivitys
- toteutusdokumentti luonnos, tästä täytyy täyttää vielä puuttuvat paikat

### Ajankäyttö tällä viikolla
- 10+h tuohon hatusta vetästyyn heuristiikkaan ja siihen toi minimax-alpha-beta-rajaus kiinni
- koodin restrukturointia varmaan 3h edestä.
- lisää koodin restrukturointia varmaan 3h edestä.


## testauksesta
Mietin tuota testauksen vaatimuksia; tässä projektissa on tällä hetkellä 15 automaattista testiä tarkistamaan siirtosääntöjen toimivuutta, arviointifunktiota, minimax + alphbeta hakua ja joitain käyttöliittymän toimintoja

testit näyttää tällä hetkellä tällaisilta
```
$ npm run test

> juhashakki@1.0.0 test
> node --test test/*.test.js

✔ uusi peli näyttää valitun vaikeusasteen statustekstissä (1.389833ms)
✔ tietokone lukee valitun vaikeusateen ja käyttää oikeaa hakusyvyyttä (3.720458ms)
✔ arviointi on mustan näkökulmasta ja suosii keskustaa (1.378584ms)
✔ nolla syvyydellä minimax palauttaa nykyisen aseman arvion (1.609375ms)
✔ musta maksimoi ja valkoinen minimoi pisteitä syömällä vastustajan nappulan (6.1635ms)
✔ minimax tunnistaa matin ja patin hakusyvyyden rajalla (0.844291ms)
✔ siirtohaku valitsee ilmaisen kuningattaren eikä muuta alkuperäistä lautaa (9.983042ms)
✔ alpha-beta karsii turhat haarat molemmilla väreillä muuttamatta tulosta (0.887583ms)
✔ kuningas voi siirtyä kaikkiin kahdeksaan viereiseen ruutuun (2.034042ms)
✔ kuninkaan siirrot ei kierrä laudan reunan yli (0.521875ms)
✔ sotilaattomassa asemassa kuningattaret estävät siirrot vasemmalle (4.950917ms)
✔ kuningas ei voi siirtyä sotilaan, ratsun tai kuninkaan uhkaamaan ruutuun (0.654625ms)
✔ kuninkaan siirron tai syönnin paljastama tornin uhka estää siirron (0.567792ms)
✔ tavallisessa aloitusasemassa on 20 laillista siirtoa molemmille pelaajille (1.899208ms)
✔ klikkaus korostaa valitun valkoisen nappulan lailliset siirrot (26.573583ms)
ℹ tests 15
ℹ suites 0
ℹ pass 15
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 92.447083
```
- [difficulty.test.js](../test/difficulty.test.js)
- [minimax.test.js](../test/minimax.test.js)
- [moves.test.js](../test/moves.test.js)


Mietin että täydenän testausta kattavuusraportilla, tunnetuilla taktisilla asemilla ja vertaamalla minimaxin ja alpha–beta-haun tuloksia, solmumääriä ja hakuaikoja. Olisko tämä tavoitteisiin sopiva painotus?
