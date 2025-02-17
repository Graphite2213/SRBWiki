Zdravo! Ovo je malo manje formalan dokument u kom ću dati neke osnovne informacije o ovom repozitorijumu, kako ceo sajt funkcioniše i kako možete doprineti razvoju sajta. Ukoliko samo želite da pišete i uređujete stranice, dokumentacija za to je OVDE.

## Osnovne informacije
Sajt se u svojoj celosti nalazi i hostuje na CloudFlare servisima, od kojih je jedan R1 bucket za čuvanje stranica i drugih podataka poput istorije, jedan worker za operacije nad stranicama i korisnicima, i jedna pages instanca sa funkcijama za routing.

Pages instanca prati sve izmene na master branchu ovog repozitorijuma, osim izmena dokumentacije, što znači da svaki uspešan PR automatski postaje deo sajta.

Jedini drugi branch u repozitorijumu je dev, za koji ne garantujem ikakav maintenance, dobre commit poruke i sl. jer postoji isključivo za testiranje. 
## Sajt
Sajt je napravljen u čistom HTML-u, CSS-u i JS-u. Za bilo koga sa imalo iskustva u web developmentu ovo je veoma čudan izbor, ali ja sam započeo projekat sa mnogo manjim očekivanjima i scope-om, a nisam želeo da ga još odlažem tako što bi se prebacio na neki konkretan framework. Naravno, ukoliko sajt bude korišćen, imam u planu da sve lepo prebacim u Next.js, ali zasad je ovo dovoljno.

U osnovi, ovo nema nikakav uticaj na funkcionalnost sajta ali čini development i tuđi doprinos kodu mnogo težim.

Što se tiče doprinošenja, ukoliko ste zainteresovani, nemam ništa protiv, ali ne mogu da garantujem da je trenutni kod pregledan i lak za uređivanje. Jedan refactoring je "long overdue" čak i bez prebacivanja na framework, i unapred se izvinjavam za muke koje vam ovaj projekat izazove 😅. Entrance point za JavaScript je `index.js`, a u `Elements` folderu se nalaze elementi koji se koriste u pisanju članaka na sajtu.
