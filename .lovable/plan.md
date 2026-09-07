# PICCARD³ rebranding

## Cilj
Potpuno zamijeniti vidljivi Penta identitet s PICCARD³ identitetom, bez promjena autentifikacije, podataka, webhookova ili ostale poslovne logike.

## Izmjene
- Zamijeniti Plus Jakarta Sans kombinacijom Space Grotesk za naslove, wordmark, cijene i aktivnu donju navigaciju te Inter za sav ostali tekst.
- Uvesti deep navy, navy-dark, gold i graphite tokene; sve postojeće brand gradijente pretvoriti u solid navy prikaz, uz hladnu splash pozadinu i navy sjene.
- Zamijeniti slikovni logo tekstualnim PICCARD³ wordmarkom na prijavi, zaglavlju stranica i drugim trenutno vidljivim brand mjestima; na prijavi dodati gold tagline “PLAN. BOOK. GO.” i zadržati hrvatski opis.
- Ažurirati vidljive nazive i naslove stranica s Penta na PICCARD³, bez mijenjanja tehničkih URL-ova, webhook adresa, tajnih headera ili mock korisničkih podataka.
- Ažurirati osnovne meta podatke i web manifest; postojeće PNG ikone i `penta-logo.webp` ostaviti fizički netaknute.
- Primijeniti display font na naslove, cijene/totale i aktivne oznake donje navigacije kroz postojeće komponente i rute.

## Provjera
- Provjeriti da u prikaznom kodu više nema starih brand boja, gradijenata, fonta ni vidljivog naziva Penta.
- Provjeriti prijavu i glavne ekrane na desktop i mobilnoj širini, uključujući čitljivost wordmarka i odsutnost preklapanja.
- Potvrditi prolazak automatskog builda i provjeriti runtime/console greške.

## Tehničke napomene
- Zadržati postojeće nazive utility klasa gdje smanjuju rizik promjene, ali promijeniti njihovu implementaciju iz gradijenta u solid navy.
- Novi brand tokeni bit će registrirani u Tailwind v4 `@theme inline` mapiranju; fontovi će se učitati isključivo preko `<link>` elemenata u korijenskom dokumentu.
- Funkcionalne crvena, zelena i plava status boja ostaju; pending prelazi na gold.
