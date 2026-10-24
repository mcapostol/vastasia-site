# VASTASIA Consulting Group

Site static independent, pentru `vastasia.ro`, disponibil în RO / EN / FR / DE / ES. Previzualizare: https://mcapostol.github.io/vastasia-site/ . Nu conține date, formulare SMTP, coduri Analytics sau materiale comerciale Clarified.

## Publicare în Hostinger

1. Fă backup la site-ul existent, dacă există.
2. Deschide rădăcina domeniului `vastasia.ro` în File Manager.
3. Copiază **conținutul** folderului `public_html` din arhiva de livrare în folderul `public_html` al domeniului. Fișierul trebuie să ajungă la `public_html/index.html`, nu `public_html/public_html/index.html`.
4. Include `.htaccess` (fișier ascuns), `assets`, `en`, `fr`, `de`, `es`, `robots.txt` și `sitemap.xml`.
5. Verifică HTTPS, homepage-ul, navigarea, contactul, harta și schimbarea limbii. Golește cache-ul domeniului dacă este activ.
6. După conectarea domeniului, trimite `https://vastasia.ro/sitemap.xml` în Google Search Console. Verifică prin inspecția URL că pagina principală poate fi indexată. Previzualizarea GitHub rămâne separat `noindex`.

Nu sunt necesare Node, o bază de date, Composer sau parole pe hosting. Arhiva nu conține secrete. Domeniul și DNS-ul nu au fost modificate.

## Contact

Date confirmate de proprietar: +40 726 425 892, office@vastasia.ro, Strada Drumul Crețeștilor nr. 19, Sector 4, București.

Formularul pregătește local un mesaj și deschide aplicația de email; utilizatorul trimite explicit mesajul din acea aplicație. Butonul de copiere este alternativa fără aplicație asociată. Nu există promisiune falsă de trimitere SMTP. Pentru trimitere directă din server va fi necesară o integrare distinctă cu căsuța VASTASIA; nu se reutilizează parola Clarified.

Harta Google este solicitată doar după apăsarea butonului de încărcare. Adresa completă este folosită în căutare; poziția este rezolvată de Google. Nu sunt inventate coordonate GPS.

## Conținut și imagini

Activitatea din 2016 și proiectele din Voluntari, Bremen, Nürnberg și Viena au fost furnizate/confirmate de utilizator. Nu sunt publicate clienți, valori, suprafețe, certificări sau rezultate neconfirmate. Serviciile de proiectare se definesc separat, potrivit domeniului contractat și specialiștilor necesari.

Imaginile de prezentare sunt generate și nu sunt prezentate ca fotografii ale lucrărilor sau ale angajaților. Grafica proiectelor este schematică. Logo-ul a fost adaptat pentru web din referința vizuală furnizată; originalul editabil nu a fost disponibil în filesystem-ul serverului. Înaintea lansării comerciale, titularul mărcii trebuie să accepte această adaptare sau să furnizeze fișierul vectorial original. Vezi `ASSETS.txt` pentru proveniență și prompturi.

## Structură și build

- `src/content.mjs`: textele complete în toate cele cinci limbi, datele companiei.
- `src/enrichment.mjs`: descrieri detaliate pe specialități, predare, sectoare, întrebări frecvente și titluri SEO în cele cinci limbi.
- `src/seo.mjs`: date structurate despre firmă, servicii, pagini, trasee de navigare și întrebările vizibile.
- `src/style.css`, `src/app.js`: design și interacțiuni unice, fără framework.
- `assets/`: resurse optimizate, licențele fonturilor și filmele incluse.
- `scripts/build.mjs`: generează `public_html`; `--preview` generează `preview_html`, cu `noindex` și URL-urile GitHub Pages.
- `scripts/check.mjs`: verifică traducerile, legăturile, resursele și absența trackingului străin.
- `.github/workflows/pages.yml`: build și deploy GitHub Pages din commitul de pe `main`.

Comenzi: `npm run build`, `npm run check`, `npm run preview`. Node 20+; nu sunt necesare pachete npm pentru build. `scripts/browser-check.cjs` este verificarea de browser din mediul serverului de lucru. `scripts/media.mjs` este rețeta opțională de re-encodare, necesitând FFmpeg și originalele PNG păstrate local; buildul normal utilizează resursele optimizate versionate.

Previzualizarea este publică, dar are `noindex` și `robots.txt` restrictiv. Acestea nu reprezintă control de acces. Arhiva Hostinger are canonical și sitemap pentru `vastasia.ro`, fără restricția de indexare a previzualizării.

## SEO și căutare asistată de AI (GEO)

Cele 50 de pagini au conținut HTML complet, fără traducere dinamică sau dependență de JavaScript pentru informația esențială. Fiecare pagină are titlu și descriere, canonical propriu, legături reciproce între versiunile RO/EN/FR/DE/ES, un singur H1 și legături către serviciile relevante. Datele structurate reflectă numai informația companiei și conținutul vizibil; nu sunt adăugate recenzii, coordonate, certificări sau rezultate inventate. Întrebările sunt accesibile și fără JavaScript. Textele identifică explicit specialitățile, aria de lucru și datele de contact.

Pentru funcțiile de căutare AI se aplică aceleași principii SEO, nu o schemă specială: https://developers.google.com/search/docs/appearance/ai-features . Implementarea nu garantează indexare, poziții, citări AI sau rezultate speciale pentru FAQ. După publicare, proprietarul verifică domeniul în Search Console. Nu sunt incluse coduri de măsurare ori cookie-uri analitice ale altor firme.

Arhiva actualizată conține numai folderul integral `public_html`, inclusiv fișierele ascunse. Este construită dintr-un commit identificabil; SHA-256 și commitul se publică alături de arhivă. Nu copia folderul de previzualizare în Hostinger.
