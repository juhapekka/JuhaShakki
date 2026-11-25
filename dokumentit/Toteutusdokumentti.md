# JuhaShakki – toteutusdokumentti

Luonnos nykyisestä toteutuksesta
Täydennetään kun on sen aika

## Ohjelman yleisrakenne

JuhaShakki on JavaScriptillä toteutettu selaimessa toimiva shakkipeli. Käyttäjä pelaa valkoisilla ja tietokone mustilla. Työn ydin on tietokoneen siirron valitseva minimax-haku ja sen alpha–beta-karsinta. Peli ei tarvitse palvelinta eikä ulkoisia JavaScript-kirjastoja. Automaattiset testit suoritetaan Node.js:llä.

| Tiedosto | Vastuu |
|---|---|
| [board.js](../public/board.js) | Laudan tilanne, koordinaatit, nappuloiden värit, siirron soveltaminen ja siirtohistorian koodaus |
| [moves.js](../public/moves.js) | Siirtoehdokkaiden listaaminen, hyökkäysten tunnistaminen ja laillisten siirtojen listaus |
| [ai.js](../public/ai.js) | Aseman pisteytys, siirtojen järjestäminen ja alpha–beta karsittu minimax-haku |
| [ai-worker.js](../public/ai-worker.js) | Hakulogiikan lataaminen workeriin ja siirron palauttaminen käyttöliittymälle |
| [ui.js](../public/ui.js) | Laudan piirtäminen, siirtojen korostukset ja vaikeusvalinnan lukeminen |
| [app.js](../public/app.js) | Pelaajan ja tietokoneen vuorot, pelin päättymisen käsittely ja uuden pelin aloittaminen |

Tiedostot suoritetaan HTML:ssä taulukossa nähdyssä järjestyksessä. Ne käyttävät yhteistä globaalia ympäristöä; toteutus ei käytä import/export-moduuleja. Testien [lataaja](../test/helpers/load-app.js) suorittaa samat tiedostot samassa järjestyksessä ja korvaa tarvitut käyttöliittymäelementit pienillä testiolioilla.

Poikkeuksena ai-worker.js käynnistetään Worker-rajapinnalla tietokoneen vuorolla. Se lataa board.js-, moves.js- ja ai.js-tiedostot omaan ympäristöönsä. Pääsäie lähettää laudan ja hakusyvyyden, worker palauttaa siirron. Pelaajan siirrot estetään tietokoneen vuorolla. Uusi peli peruu odottavan ajastimen ja lopettaa käynnissä olevan workerin; vanhan haun vastaukset hylätään.

## Tietorakenteet ja lailliset siirrot

Lauta on 64-alkioinen taulukko. Tyhjän ruudun arvo on null, valkoiset nappulat esitetään isoilla ja mustat pienillä kirjaimilla. Ruudun indeksi on row * 8 + column, joten a1 on 0 ja h8 on 63. Siirto esitetään oliona { from, to }. Siirtohistoriaan lähtö- ja kohderuutu pakataan yhdeksi luvuksi kaavalla (from << 6) | to

generateMoves(..) muodostaa nappulan liikkumissääntöjen mukaiset siirtoehdokkaat. getLegalMoves(..) kokeilee jokaisen ehdokkaan uudella lautakopiolla ja hylkää siirron jos oma kuningas olisi sen jälkeen uhattuna. isSquareAttacked(..) tarkistaa vastustajan hyökkäykset. Sotilaan hyökkäysruudut käsitellään erikseen sen tavallisista etenemissiirroista. Kuningasta ei voi syödä: matti tunnistetaan tilanteesta missä kuningas on uhattu eikä pelaajalla ole yhtään laillista siirtoa. Jos siirtoja ei ole mutta kuningas ei ole uhattu, kyseessä on patti.

## Tekoälyn toiminta

chooseSearchedMove(position, depth) tutkii annetun aseman mustan lailliset siirrot ja palauttaa parhaan siirron. Jokaisen ehdokkaan jälkeen minimaxab(..) tutkii vuorotellen valkoisen ja mustan vastauksia. Musta maksimoi pisteitä ja valkoinen minimoi niitä. Tasapisteissä valitaan ensimmäinen löydetty paras siirto.

Alpha kuvaa mustan tähän mennessä saavuttamaa alarajaa ja beta valkoisen saavuttamaa ylärajaa. Kun alpha >= beta jäljellä olevat siirrot voidaan jättää kyseisessä haarassa tutkimatta. Sisäsolmuissa syönnit järjestetään ennen muita siirtoja jotta hyviä rajoja löytyisi aikaisemmin. Myös juuritason aiemmin löytynyt paras pistemäärä välitetään seuraavan ehdokkaan hakuun alphana. Karsinta säilyttää saman minimax-arvon samalla hakusyvyydellä.

Hakusyvyys pienenee jokaisella puolisiirrolla. Pelin päättyminen tarkistetaan ennen syvyysrajaa. Mustan matti saa arvon 
```
-100000 - jäljellä oleva syvyys
```

ja valkoisen matti arvon 

```
100000 + jäljellä oleva syvyys
```

Tämä suosii nopeampaa voittoa ja tappion lykkäämistä. Patti saa arvon 0. Muissa asemissa syvyydellä 0 palautetaan heuristinen arvio

Vaikeusasteiden syvyysparametrit ovat helppo 0, normaali 1 ja vaikea 2. Parametri kertoo montako puolisiirtoa tutkitaan mustan ehdotetun siirron jälkeen. Ehdotettu siirto mukaan lukien tarkastelusyvyydet ovat siis 1, 2 ja 3 puolisiirtoa.

### Aseman arviointi

evaluateSituationForBlack(..) laskee mustan materiaalin ja sijaintibonusten summan ja vähentää siitä valkoisen vastaavan summan. [Materiaaliarvot](../public/ai.js#L2) on sotilas 100, ratsu 320, lähetti 330, torni 500 ja kuningatar 900. Kuninkaan materiaalinen arvo on 0 koska pelin päättyminen käsitellään erikseen.

Ruudun [sijaintiarvo lasketaan kaavalla](../public/ai.js#L31)
```
7 - abs(7 - 2 * column) - abs(7 - 2 * row)
```
- Sotilaan bonus on kaksi ja ratsun sekä lähetin kolme kertaa tämä arvo.
- Muille nappuloille ei anneta sijaintibonusta.
- Bonus voi olla reunoilla negatiivinen.
- Arviointi suosii keskustaa, mutta ei huomioi esimerkiksi kuninkaan turvallisuutta tai keskustan rakennetta.

## Aika- ja tilavaativuus

Olkoon b hakupuun haarautumiskerroin ja D koko tarkastelusyvyys puolisiirtoina.

Juurihaku mukaan lukien

```
D = depth + 1
```

Tasaisesti haarautuvan hakupuun mallissa tavallinen minimax tutkii O(b^D) solmue. Alpha–beta-haun pahimman tapauksen solmumäärä on sama, mutta ihanteellisella siirtojärjestyksellä se on noin O(b^(D/2)). Pelkkä syöntien järjestäminen ensin ei takaa ihanteellista järjestystä.

Solmumäärä ei yksin kuvaa koko suoritusaikaa. Jokaisessa solmussa muodostetaan lailliset siirrot, myös syvyysrajalla. Lisäksi sisäsolmujen siirrot järjestetään. Jos tutkittuja solmuja on N, laillisten siirtojen muodostamisen enimmäiskustannus on g ja solmussa on enintään b siirtoa, haun ajan ylärajaa voidaan kuvata muodossa 
```
O(N * (g + b log b))
```
kun lajittelun oletetaan vievän O(b log b) aikaa.
Lauta on kiinteästi 64 ruutua, joten yksittäisen laudan kopiointi ja materiaalin arviointi vievät sen koon suhteen vakioajan.

Hakupuuta ei tallenneta kokonaan. Rekursiopinossa säilyvät kuitenkin lautojen lisäksi kunkin aktiivisen tason lailliset ja järjestetyt siirtolistat. Jos siirtoja on enintään b tasoa kohti, haun lisämuistinkulutus on O(bD) ja pelkän rekursiopinon syvyys O(D). Jos haarautumiskerroin käsitellään vakiona, myös kokonaislisämuisti on O(D). Pelin siirtohistoria kasvaa erikseen suhteessa pelattujen siirtojen määrään.

## Suorituskykyvertailu

...

## Puutteet ja parannusehdotukset

- Tornausta ja ohestalyöntiä ei ole toteutettu sotilas korotetaan automaattisesti kuningattareksi.
- Tasapeleistä tunnistetaan vain patti. Aseman toistumista tai kuollutta asemaa ei tunnisteta.
- Haku on matala ja arviointifunktio yksinkertainen. Syvyys haun takana oleva vastustajan uhka jää huomaamatta.
- Haku suoritetaan workerissa, mutta aikarajaa ei ole toteutettu. Syvyyden kasvattaminen voi pidentää tietokoneen vuoroa huomattavasti, vaikka käyttöliittymä pysyy käytettävissä.
- Laudan piirtäminen laskee valkoisen lailliset siirrot uudelleen jokaiselle piirrettävälle ruudulle, kun nappula on valittuna -> se voitaisiin laskea kerran piirtoa kohti
- Tiedostot jakavat globaalin pelitilan. Nimeämistä, parametrien välitystä ja moduulirajoja voisi yhtenäistää

Määrittelyssä mainittua mahdollista PGN-avauskirjaa ja Huffman-pakkausta ei ole toteutettu, se on lisäominaisuus.

## Kielimallien käyttö

...

## Lähteet

Pitää ottaa tähän määrittelydokumentista

...
