Plán opravy

1. Opravit objednávky a detail objednávky
- Chyba není v samotném vytvoření objednávky: objednávka `209afbe0-712e-4fce-89e4-6120098369bd` v databázi existuje a má 1 položku.
- Skutečný problém je v načítání detailu/seznamu pro admin: dotaz se pokouší připojit firmu přes vztah `orders -> companies`, který v databázovém schématu není správně definovaný. Backend proto vrací chybu `Could not find a relationship between 'orders' and 'companies'`, a aplikace to nyní mylně zobrazí jako „Objednávka nebyla nalezena“.
- Doplním databázovou vazbu `orders.company_id -> companies.id`, aby objednávky šly správně spojit s firmou.
- Současně upravím načítání objednávek tak, aby detail objednávky nebyl závislý jen na tomto automatickém spojení: objednávka se načte samostatně a firma/položky samostatně. Tím bude detail fungovat i kdyby se cache schématu backendu opozdila.
- V klientském i admin detailu začnu rozlišovat skutečný stav „nenalezeno“ od technické chyby načtení, aby se už nezobrazovala zavádějící hláška.

2. Opravit reset hesla
- Resetovací odkaz je jednorázový a při přesměrování se token/session může zpracovat dřív, než se stránka `/reset-password` stihne inicializovat. Výsledkem je falešná hláška „odkaz je neplatný nebo vypršel“.
- Nastavím odesílání resetovacího odkazu přes bezpečný callback `/auth/callback?next=/reset-password`, který recovery session zachytí a uloží stav pro stránku resetu.
- Upravím `/auth/callback`, aby aktivně počkal na recovery session/token a až poté přesměroval na `/reset-password`.
- Upravím `/reset-password`, aby používala uložený recovery stav i aktuální session, nevyhodnotila odkaz jako neplatný předčasně a tlačítko „Nastavit nové heslo“ bylo aktivní hned po splnění validace hesla.
- Po úspěšném uložení hesla se recovery stav vyčistí, uživatel se odhlásí a bude přesměrován na přihlášení.

3. Ověření po opravě
- Ověřím, že objednávka `209afbe0-712e-4fce-89e4-6120098369bd` jde načíst v klientském detailu i v admin panelu.
- Ověřím, že admin seznam objednávek znovu vrací položky.
- Ověřím reset hesla na novém resetovacím odkazu. Staré resetovací odkazy nelze spolehlivě znovu použít, protože jsou jednorázové.

Technické detaily
- Databázová migrace: doplnění chybějící foreign key vazby pro `orders.company_id`.
- Úpravy souborů: `src/lib/api/orders.ts`, `src/lib/api/adminOrders.ts`, `src/pages/account/OrderDetail.tsx`, `src/pages/admin/AdminOrderDetail.tsx`, `src/pages/ForgotPassword.tsx`, `src/pages/AuthCallback.tsx`, `src/pages/ResetPassword.tsx`.
- Nezasáhnu do automaticky generovaných backend typů ani klienta.

<lov-actions>
<lov-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</lov-link>
</lov-actions>