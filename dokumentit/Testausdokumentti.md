# JuhaShakki – testausdokumentti

....kattavuusraporttia, testitapauksia ja suorituskykymittauksia täydennetään jahka niistä tulee lisää dokumentoitavaa.

## Testausmenetelmä

Automaattiset testit on toteutettu node.js:n node:test testikehyksellä ja node:assert/strict tarkistuksilla. 

Testien [lataaja](../test/helpers/load-app.js) suorittaa pelin JavaScript-tiedostot eristetyssä node:vm ympäristössä samassa järjestyksessä kuin HTML sivu suorittaisi. Jokainen lataus luo uuden testiympäristön. Käyttöliittymän tarvitsemat elementit korvataan olioilla joiden avulla voidaan tutkia esimerkiksi korostettuja ruutuja ja tilatekstiä.

Worker-vastaukset ja ajastimet ohjataan testeissä käsin, jotta kesken haun tapahtuva uuden pelin aloitus ja myöhästyneet vastaukset voidaan testata toistettavasti. Lisäksi workerin oma skripti suoritetaan erillisessä vm-ympäristössä, jossa se lataa oikeat hakulogiikan tiedostot ilman käyttöliittymää.

Testit tarkistavat sekä yksittäisiä toimintoja että useamman toiminnon yhteistyötä. Ne eivät käytä oikeaa selainta eivätkä testaa sivun ulkoasua tai koko peliketjua pelaajan klikkauksesta tietokoneen vastasiirtoon.

## Mitä on testattu?

Testeissä käytetään tavallista aloitusasemaa, käsin kirjoitettuja lautatilanteita ja yhtä ennalta tunnettua keinotekoista hakupuuta. Laudat ovat 64-alkioisia taulukoita, joissa käyttämättömät ruudut ovat null. Syötteet ovat ennalta määrättyjä, ts. satunnaisuus ei vaikuta tuloksiin.

| Testitiedosto | Testien määrä | Testattavat asiat |
|---|---:|---|
| [moves.test.js](../test/moves.test.js) | 7 | Kuninkaan liikkeet, uhattujen ruutujen välttäminen, aloitusaseman siirrot ja käyttöliittymän kohderuutujen korostus. |
| [minimax.test.js](../test/minimax.test.js) | 6 | Arviointifunktio, syvyysraja, maksimointi ja minimointi, matti ja patti, siirtovalinta sekä alpha–beta-karsinta. |
| [difficulty.test.js](../test/difficulty.test.js) | 2 | Vaikeusasteen näyttäminen ja valitun vaikeuden välittäminen haulle. |
| [worker.test.js](../test/worker.test.js) | 6 | Worker-skriptin hakutulos, vuoron lukitus, ajastimen ja haun peruminen, vanhat vastaukset sekä workerin virheet. |

Seuraavat esimerkit kuvaavat testien syötteitä ja odotettuja tuloksia. Niiden tarkistukset läpäisivät viikolla4 suoritetun testiajon

| Syöte tai tilanne | Tarkistettava tulos |
|---|---|
| Valkoinen kuningas d4:ssä ja musta kuningas h8:ssa, muut ruudut tyhjiä | Valkoisella kuninkaalla on kaikki kahdeksan viereistä ruutua käytettävissä. |
| Valkoinen kuningas a1:ssä ja musta kuningas h8:ssa | Kohteet ovat vain b1, a2 ja b2; siirrot eivät kierrä laudan reunan yli. |
| Erikseen muodostetut sotilaan, ratsun ja kuninkaan uhkaamat ruudut sekä tornin hyökkäyslinjan paljastava liike tai syönti | Kuninkaan siirtyminen uhattuun ruutuun estetään. |
| Tavallinen aloitusasema | Molemmilla väreillä on 20 laillista siirtoa. Siirtojen laskeminen ei muuta lautaa. Arviointifunktion tulos on 0. |
| Valkoinen kuningas a1:ssä, musta kuningas h8:ssa, musta torni a6:ssa ja valkoinen kuningatar a4:ssä | Syvyydellä 0 molempien vuorojen arvio on -400. Syvyydellä 1 mustan minimax-arvo on 500 ja valkoisen -900. Mustan siirtohaku parametrilla 1 valitsee tornin siirron a6–a4 eli kuningattaren syönnin. Alkuperäinen lauta säilyy ennallaan. |
| Musta kuningas a8:ssa, valkoinen kuningatar b7:ssä ja valkoinen kuningas c6:ssa | Mustan matti tunnistetaan: arvot ovat -100000 syvyydellä 0 ja -100002 syvyydellä 2. Väreiltään vaihdetussa asemassa valkoisen matin arvot ovat 100000 ja 100002. |
| Musta kuningas a8:ssa, valkoinen kuningatar c7:ssä ja valkoinen kuningas c6:ssa | Mustan patti tunnistetaan ja tulos on 0 syvyyksillä 0 ja 2. |
| Keinotekoinen hakupuu max(min(3, 5), min(2, 100)) | Tulos on 3. Vain lehdet 3, 5 ja 2 arvioidaan: lehti 100 karsitaan. Vastaluvuilla ja valkoisen vuorolla tulos on -3 ja vastaava karsinta toimii. |
| Aloitusasemassa valitaan e2-sotilas | Käyttöliittymä korostaa e3- ja e4-ruudut. Vastustajan nappulan tai muun tyhjän ruudun valitseminen ei vaihda valintaa. |
| Vaikeusvalinnat easy, normal ja difficult | Workerille lähetetään nykyinen lauta ja vastaavasti syvyys 0, 2 tai 5. Testissä worker korvataan viestit tallentavalla oliolla. Uuden pelin tilatekstin testissä varmistetaan myös valitun vaikeuden näkyminen. |

Arviointifunktion testeissä varmistetaan lisäksi kuningattaren pisteiden etumerkki ja sotilaan, ratsun ja lähetin keskustassa sijaitsemisen hyöty. Sotilaattomalla lähtöasemalla tarkistetaan myös että omat nappulat ja vastustajan kuningattaren uhka estävät kuninkaan siirrot oikein.

## Testien toistaminen

Testit tarvitsevat Node.js:n ja npm:n. Projektin juuressa suoritetaan:

```sh
npm test
```

Yksittäisen testitiedoston voi ajaa esimerkiksi näin:

```sh
node --test test/minimax.test.js
```

Tarkistusajossa 23.11.2026 oli käytössä node.js v22.13.0. Kaikki 21 testiä läpäisivät eikä testejä ohitettu.

## Yksikkötestauksen kattavuusraportti

Pelikoodin rivi-, haara- ja funktiokattavuutta ei ole saatu mitattua luotettavasti. Node.js:n kattavuusajoa kokeiltiin komennolla:

```sh
node --experimental-test-coverage --test test/*.test.js
```

Nykyisellä vm-pohjaisella lataajalla raporttiin tulee vain testitiedostot ja testiapukoodi. public-hakemistoja tiedostoja ei listattu raporttiin. Raportin näyttämä 100%:n rivikattavuus ei siis kuvannut pelin kattavuutta vaan suoritettujen testikoodirivien kattavuutta mistä ei ole tässä hyötyä.

...tähän täytyy kattoa josko löytyy parempaa coveragea

## Testauksen rajaukset ja kehitys

Nykyinen mattitesti tunnistaa jo päättyneen aseman mutta se ei vielä osoita että tekoäly löytää useamman siirron pakotetun matin tai osaa välttää vastustajan mattijatkon. Alpha–beta-karsinnan testi tarkistaa pienen tunnetun puun; laajempaa vertailua tavalliseen minimaxiin ei ole tehty. Tornien, lähettien, ratsujen ja sotilaiden siirtosääntöjen kattavaa erillistestausta sekä sotilaan korotuksen testejä voisi tältä pohjalta lisätä.

Seuraavaksi testausta voisi täydentää tunnetuilla taktisilla asemilla, minimaxin ja alpha–beta-haun tulosten vertailulla sekä selaimessa tehtävällä koko pelivuoron tarkistuksella. 

## Empiirinen testaus ja kuvaajat

Erillisiä suorituskykymittauksia tai niihin perustuvia kuvaajia ei ole vielä tehty. Mittauksiiin on tarkoitus käyttää samoja ennalta valittuja asemia ja hakusyvyyksiä ja verrata minimaxin ja alpha–beta-haun tulosarvoja, tutkittuja solmumääriä ja hakuaikoja.

...tähän mittausympäristö, käytetyt asemat, syvyydet, toistojen määrä ja tulokset.
