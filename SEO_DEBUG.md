# Rapport om SEO-dataoppdatering

Vi jobber med å få på plass de "ekte tallene" fra Google Search Console. Det er tre vanlige grunner til at tallene kan vise 0 eller ikke oppdatere seg:

1. **Tilgang mangler**: Service-brukeren (den lange e-posten som slutter på `.iam.gserviceaccount.com`) må legges til som "Eier" eller "Full tilgang" i Google Search Console.
2. **Feil eiendom**: Hvis siden er verifisert som `https://m51.no/`, men vi spør etter `sc-domain:m51.no` (eller omvendt), vil vi få 0 treff.
3. **Data-forsinkelse**: Google Search Console har vanligvis 2-3 dager forsinkelse på data. Hvis eiendommen er helt ny, kan det ta 24-48 timer før de første tallene i det hele tatt dukker opp i API-et.

## Status akkurat nå
Jeg har lagt til en feilmelding i kontrollpanelet ditt som vil fortelle deg nøyaktig hva Google svarer. 

### Slik sjekker du det:
1. Gå til **Rapport**-siden i dashbordet.
2. Se etter en rød eller grå boks øverst.
3. Hvis det står en e-postadresse der, kopier den og legg den til i Google Search Console under **Innstillinger > Brukere og tillatelser**.
