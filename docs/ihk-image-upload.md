# IHK-Zusatzmodul: Bild-Upload-Feature für "Join"

Dokumentation der Entwicklung, geführt während der Umsetzung (nicht nachträglich
geschrieben) — für die Abschlusspräsentation.

## Kontext

- **Modul**: Softwareentwickler (IHK) – Schwerpunkt Frontend, Zusatzmodul
  "Dateiupload bei Join" (Developer Akademie).
- **Ziel**: Eine effiziente und sichere Bild-Upload-Funktionalität in das
  bestehende Kanban-Board-Projekt "Join" integrieren.
- **Stack**: Angular 21 (standalone components, signals), Supabase
  (Postgres + RPC + Storage), Reactive Forms.

## Status quo vor dem Feature (Bestandsaufnahme)

- `Task` / `CreateTaskDto` ([task.model.ts](../src/app/core/models/task.model.ts))
  haben noch kein Feld für Attachments.
- `SupabaseService` ([supabase.service.ts](../src/app/core/services/supabase.service.ts))
  nutzt bisher nur den Postgres-Client (`.db`), noch nicht `.storage`.
- Task-Erstellung/-Update läuft transaktional über RPCs
  (`create_task_with_contacts`, `update_task_with_contacts`).
- Kein Datei-Input, keine Galerie-Komponente vorhanden.

## Anforderungen (aus Kurs-Checkliste "Dateiupload")

Kernvorgabe: Dateien werden über einen Filepicker beim Erstellen/Bearbeiten
eines Tasks hinzugefügt, **als Array im Base64-Format direkt im Task
gespeichert** (nicht als externe Objekt-URLs), inkl. Metadaten
(Dateiname, Typ, Größe) pro Eintrag. In der Task-Detailansicht können die
Dateien angesehen werden. Prüfungsleistung — keine Wiederholung nach Bestehen,
mind. 50 % nötig.

Wichtigste Einzelpunkte:

- Filepicker im selben Stil wie andere Formularfelder; Mehrfachauswahl;
  sofortige Vorschau/Dateiliste nach Auswahl.
- Upload sowohl in Add-Task als auch im Edit-Mode; im Edit-Mode auch löschbar.
- Nur Bilder erlauben (empfohlen) — Format-Whitelist im Filepicker **und**
  zusätzlich mit JavaScript/TypeScript validiert.
- Upload-Limit **max. 1 MB pro Task** (Checklisten-Text nennt "Firebase" —
  bei uns Supabase/Postgres; Limit wird trotzdem selbst durchgesetzt, s.
  Entscheidung unten), Nutzer wird bei Überschreitung informiert.
- Automatische Kompression nach Upload, max. Breite/Höhe 800 px.
- Thumbnails in Add-Task und Ticketansicht.
- Bildbetrachter (Imageviewer): Blättern zwischen Bildern, Anzeige von
  Dateiname/Typ/Größe, Downloadfunktion (auch in der Ticketansicht).
- A11y: Filepicker per Tastatur/Screenreader bedienbar (Tab, ARIA-Labels);
  klare Fehlermeldungen; keine Schrift < 16px (Kleingedrucktes < 14px).
- Base64-Konvertierung als eigene, ausgelagerte Funktion(en) nach
  Code-Konvention (≤ 14 Zeilen/Funktion), mit JSDoc dokumentiert — ebenso
  der Rest des Features (Clean Code, SOLID, semantisches HTML).
- Alle "normalen" Join-Checklisten-Punkte (Sprint 1–3: Contacts, Board, Auth,
  Legal/Privacy, Help) gelten weiterhin und müssen bei Abgabe ebenfalls
  erfüllt sein.

## Backlog

Sprint 1–3 (die "normale" Join-Checkliste) sind bereits umgesetzt und gelten
als erfüllt. Verbleibende Arbeit gliedert sich in zwei Epics:

**Bild-Upload für Tasks (Pflichtteil laut IHK-Checkliste)**

1. AT-1 Datenmodell: `files`-Feld auf `tasks` (jsonb array) + Anpassung
   `create_task_with_contacts`/`update_task_with_contacts` ✅ erledigt
2. AT-2 Utils: Datei-Validierung (Format-Whitelist + Größenlimit) ✅ erledigt
3. AT-3 Utils: Bildkompression + Resize auf max. 800×800 ✅ erledigt
4. AT-4 Utils: Base64-Konvertierung + Metadaten-Objekt ✅ erledigt
5. AT-5 UI: Filepicker im Add-Task-Formular ✅ erledigt — zusammen mit
   AT-6/7/8 umgesetzt, da alles dieselbe Komponente/denselben State betrifft
   (siehe Entscheidung unten); mit Playwright-Screenshot gegen das
   Figma-Design geprüft (leere/gefüllte Liste, Hover-Delete)
6. AT-6 UI: Datei-Vorschauliste im Add-Task — zusammen mit AT-5 erledigt
7. AT-7 Integration: echte ausgewählte Dateien ins `CreateTaskDto` (löst das
   `files: []`-Platzhalter-TODO in `AddTaskComponent.onSave`), `TaskService`
   braucht keine Änderung (reicht `dto` generisch durch) — zusammen mit AT-5
   erledigt
8. AT-8 UI: Edit-Mode — Bilder laden + löschen, `UpdateTaskDto`/
   `TaskService.updateTask` braucht keine Änderung — zusammen mit AT-5
   erledigt (Prefill + `removeFile` in `add-task.ts` bereits vorhanden)
9. AT-9 UI: Thumbnails in der Task-Detailansicht ✅ erledigt (vorgezogen,
   gemeinsam mit der neuen `TaskFileList`-Komponente)
10. AT-10 Feature: Image-Viewer (Blättern, Metadaten, Download) ✅ erledigt —
    `viewerjs`, verifiziert aus Add-Task und Task-Modal
11. AT-11 UX: Fehlermeldungen + Upload-Limit-Warnung (1MB/Task)
12. AT-12 Responsiveness der neuen UI-Teile ✅ vom Nutzer selbst geprüft
    (außerhalb dieser Session) — wird nur bei Rückmeldung der Akademie
    nochmal aufgegriffen
13. AT-13 Semantisches HTML in der gesamten App ✅ erledigt (Scope: die in
    diesem Feature berührten Dateien — `add-task`, `task-modal`,
    `task-file-list`, `image-viewer`, plus das gemeinsame `modal.html`)
14. AT-14 Doku: JSDoc-/Clean-Code-Review ✅ erledigt — `add-task.ts` war mit
    436 Zeilen über dem 400-LOC-Limit; behoben durch Extraktion von
    `TaskFilePicker` (siehe Entscheidung unten), nicht durch Kürzen
15. AT-15 Barrierefreiheits-Review (WCAG) ✅ erledigt (gleicher Scope wie
    AT-13) — Anlass war der beim Bau von AT-5 gefundene Bug: die
    Subtask-Edit-/Delete-Buttons hatten weder `alt`-Text noch `aria-label`
    (kein zugänglicher Name für Screenreader); dabei zusätzlich gefunden und
    behoben: Category-/Assigned-to-Dropdowns nicht per Tastatur bedienbar,
    Kontakt-Checkbox ohne zugänglichen Namen, `alt` mit Dateinamen statt
    Beschreibung, `role="dialog"`/`aria-modal` fehlten im gemeinsamen
    `Modal`-Wrapper

## Entscheidungsprotokoll

### Korrektur: Dateispeicherung ist Base64-jsonb im Task, nicht Supabase Storage

**Entscheidung:** Die Entscheidung (Supabase Storage / Blobs)
wird **verworfen**. Die Checkliste schreibt explizit vor: Dateien werden als
Base64-codiertes Array direkt am Task gespeichert (zusätzliche `jsonb`-Spalte
in der `tasks`-Tabelle), nicht als Datei im Object Storage.

**Begründung:** Die Anforderung ist eine feste Prüfungsvorgabe, kein rein
technischer Optimierungsspielraum — abweichen würde ein zentrales
Prüfungskriterium verfehlen. Base64 im Task selbst vereinfacht zusätzlich die
bestehende transaktionale RPC-Struktur (`create_task_with_contacts` /
`update_task_with_contacts`): Attachments werden einfach Teil der
`task_data`, kein separater Storage-Client, keine RLS-Bucket-Policies nötig.

**Alternativen erwogen:** Supabase Storage (ursprüngliche Annahme, s.
verworfene Entscheidung oben) — hätte sauberere Trennung von Binärdaten und
Relationaldaten geboten, ist aber nicht das, was die Prüfung verlangt.

### AT-1: Struktur des `files`-Arrays

**Entscheidung:** Neue Spalte `tasks.files jsonb default '[]'::jsonb`
(**nullable**, keine `NOT NULL`-Constraint — korrigiert nach Rückfrage: die
bestehende `subtasks`-Spalte hat ebenfalls keine `NOT NULL`, nur einen
Default; `files` folgt zur Konsistenz demselben Muster statt strenger zu
sein als der Präzedenzfall). Jedes Array-Element (TS-Typ `TaskFile`,
[task.model.ts](../src/app/core/models/task.model.ts)) hat die Felder `id`,
`name`, `type`, `size`, `createdAt`, `data` — alle camelCase, wie schon bei
`Subtask` (jsonb-Inhalt ist kein direkter Spaltenname, folgt also
JS/TS-Konvention statt Postgres-snake_case).

**Begründung:**

- `id` (uuid/string) — nötig, um im Edit-Mode eine einzelne Datei gezielt zu
  löschen (Checklisten-Anforderung), analog zu `Subtask.id`.
- `data` statt `base64` — Feldname ist unabhängig vom konkreten Encoding, das
  bleibt austauschbar ohne Rename.
- `size` speichert die Dateigröße in Bytes, nicht die Größe des
  Base64-Strings (der ca. 33 % größer ist) — relevant für eine korrekte
  Anzeige im Imageviewer und ggf. spätere Sortierung/Filterung. _(Ob das die
  Original- oder die komprimierte Größe ist, wurde hier noch nicht
  festgelegt — siehe AT-4: entschieden für die komprimierte Größe.)_
- `createdAt` zusätzlich vorgesehen für mögliches späteres Filtern/Sortieren
  nach Datum (keine Checklisten-Pflicht, aber günstig mitgenommen).
- Spaltenname `files` statt `images` — bewusste Entscheidung für spätere
  Erweiterbarkeit (z. B. Video), obwohl die Validierung (AT-2) aktuell nur
  Bild-MIME-Types zulässt, wie von der Checkliste gefordert.
- `CreateTaskDto.files` ist ein **Pflichtfeld** (wie `subtasks`), damit der
  Compiler jede Stelle markiert, die noch echte Dateien liefern muss;
  `AddTaskComponent.onSave` hat bis AT-6/7 einen `files: []`-Platzhalter.
  `UpdateTaskDto` brauchte keine Änderung (`Partial<CreateTaskDto>`).
- Beide RPCs mussten manuell angepasst werden (Spalten sind dort explizit
  aufgelistet, nicht automatisch generisch) — SQL siehe unten.

**Alternativen erwogen:** `images` als Spaltenname (verworfen zugunsten
zukünftiger Erweiterbarkeit); Dateigröße als Base64-Länge speichern
(verworfen — verfälscht die angezeigte Größe).

### AT-2: Datei-Validierung

**Entscheidung:** Neue Utils in
[file.utils.ts](../src/app/core/utils/file.utils.ts):
`isAllowedFileType`/`isFileSizeValid` (reine Boolean-Prädikate) plus
Orchestrator `validateFile(file): { valid: boolean; error?: string }`.
Whitelist: nur `image/jpeg`/`image/png` (laut Figma-Design). Limit: **1 MB pro
Datei**, geprüft an der unkomprimierten Originaldatei direkt bei Auswahl
(nicht erst nach der Kompression in AT-3).

**Begründung:**

- Die Checklisten-Formulierung _"max. 1mb upload für die Bilder eines
  Tasks"_ ist grammatikalisch nicht eindeutig (pro Datei vs. Summe aller
  Dateien einer Task). Bewusste Interpretation: **pro Datei** — einfacher zu
  begründen und umzusetzen, und liest sich als die naheliegendere Lesart.
- Prüfung an der Originaldatei (nicht nach Kompression) liefert sofortiges
  Feedback beim Auswählen, statt erst nach dem (teureren) Kompressionsschritt.
- SVG bewusst nicht in der Whitelist, obwohl technisch ein Bildformat: SVG ist
  XML und kann Skripte/Event-Handler enthalten (stored-XSS-Risiko bei
  Datei-Uploads) — deckt sich ohnehin mit der Figma-Vorgabe (nur JPEG/PNG).
- Decomposition in zwei reine Prädikate + einen Orchestrator hält jede
  Funktion weit unter der 14-Zeilen-Grenze und macht Format- und
  Größenprüfung einzeln testbar.

**Alternativen erwogen:** 1-MB-Limit als Summe aller Dateien einer Task
(verworfen — mehrdeutige Anforderung, einfachere Lesart gewählt); Prüfung
nach der Kompression (verworfen für AT-2 — verzögert Feedback, siehe oben).

### AT-3: Bildkompression/Resize

**Entscheidung:** Neue Utils in
[image.utils.ts](../src/app/core/utils/image.utils.ts):
`compressImage(file): Promise<Blob>` (Orchestrator), plus
`calculateScaledDimensions` und private Canvas-Helper. Kein Kompressions-Paket
als Dependency — reines Canvas-API. Resize via `createImageBitmap` →
`<canvas>` (`drawImage` auf Zielgröße) → `canvas.toBlob(...)`. Zielformat =
Quellformat (kein PNG→JPEG-Downgrade, sonst Verlust von Transparenz).

**Begründung:**

- Modul-Lernziel ist das Verständnis der Blob-Mechanik selbst — eine
  Drittanbieter-Bibliothek würde genau das umgehen, ohne technischen Vorteil
  für diesen Umfang.
- `createImageBitmap` statt `<img>`+`onload`: liefert direkt ein Promise,
  kein manuelles DOM-Element/Object-URL-Handling nötig.
- `{ imageOrientation: 'from-image' }` an `createImageBitmap` übergeben —
  korrigiert automatisch die EXIF-Rotation von Handyfotos (sonst könnten
  Hochkant-Fotos nach dem Resize um 90° gedreht erscheinen).
- `canvas.toBlob`s `quality`-Parameter wirkt **nur bei JPEG/WebP**, nicht bei
  PNG (dort verlustfrei) — bei PNG kommt die Größenersparnis ausschließlich
  aus dem Resize, nicht aus einer Qualitätsreduktion. Bewusst dokumentiert,
  damit das keine Überraschung bei der Präsentation ist.
- Kleinere Bilder (< 800px) werden nicht hochskaliert
  (`calculateScaledDimensions` gibt Originalgröße unverändert zurück).

**Alternativen erwogen:** Drittanbieter-Kompressionsbibliothek (verworfen,
s. o.); PNG nach JPEG konvertieren für bessere Kompression (verworfen —
würde Transparenz zerstören und das Ausgabeformat unerwartet ändern).

### AT-4: Base64-Konvertierung + `TaskFile` bauen

**Entscheidung:** `blobToBase64(blob)` (FileReader-Wrapper, gibt volle
Data-URL zurück) in [file.utils.ts](../src/app/core/utils/file.utils.ts)
(domänenneutral). `buildTaskFile(file)` (Orchestrator: `compressImage` →
`blobToBase64` → Metadaten) in einer eigenen Datei
[task-file.utils.ts](../src/app/core/utils/task-file.utils.ts) — bewusst
getrennt von `file.utils.ts`, siehe Nachtrag unten. `id` via
`crypto.randomUUID()`. `size` im gebauten `TaskFile` ist die **komprimierte**
Größe (nach AT-3), nicht die Originalgröße.

**Begründung:**

- Volle Data-URL statt nacktem Base64-String: `readAsDataURL()` liefert sie
  ohnehin direkt, keine manuelle Präfix-Konstruktion nötig, sofort als
  `<img src>` nutzbar.
- `onload`/`onerror` statt `onloadend` ohne Fehlerbehandlung — ein im
  Kursvideo gezeigtes Beispiel hat den `reject`-Callback komplett ignoriert;
  bei einem Lesefehler wäre das Promise nie aufgelöst worden (hängt für
  immer). Bewusst korrigiert.
- `crypto.randomUUID()` statt `Date.now()`-basierter ID (wie bei `Subtask`)
  oder dem Timestamp+Random-Muster aus `ToastService.generateId` — beide
  Alternativen sind Eigenbau mit (kleinem, aber realem) Kollisionsrisiko bei
  paralleler Verarbeitung mehrerer Dateien; `crypto.randomUUID()` ist nativ,
  ohne zusätzlichen Code und praktisch kollisionsfrei.
- `size` = komprimierte Größe, nicht Originalgröße: Das ist das, was
  tatsächlich gespeichert und später heruntergeladen wird — Originalgröße
  anzuzeigen wäre irreführend (Diskrepanz zur echten Downloadgröße). Die
  1-MB-Validierung (AT-2) bleibt unverändert auf der Originaldatei bei
  Auswahl — beides sind unterschiedliche Zwecke, keine Dopplung.
- Keine eigene Angular-Service-Klasse: Die Pipeline hat keine
  Dependency-Injection-Bedürfnisse (keine injizierten Services), reine
  Funktionen genügen und sind einfacher zu testen. Nur die generischen
  Bausteine (`compressImage`, `blobToBase64`) sind bewusst wiederverwendbar;
  die konkrete
  Objekt-Zusammenstellung (`buildTaskFile`) bleibt task-spezifisch.

**Alternativen erwogen:** `blob.text()` zur Base64-Konvertierung (verworfen —
dekodiert Bytes als UTF-8-Text, nicht als Base64, ergibt für Binärdaten
Datenmüll); ID-Generierung wie `Subtask`/`ToastService` (verworfen zugunsten
der nativen, robusteren Lösung); eine gemeinsame Service-Klasse für
Task-Dateien (verworfen — unterschiedliche Zielformen, nur die
Primitiven werden geteilt).

**Nachtrag 1 (gleicher Tag):** `buildTaskFile` initial versehentlich in
`file.utils.ts` platziert — inkonsistent, da diese Datei sonst komplett
domänenneutral ist (`validateFile`/`blobToBase64` kennen kein `Task`).
Nutzerkorrektur (zuerst als "sollte in `TaskService`" formuliert): richtig
erkanntes Problem (Inkonsistenz), falsche Lösung — ein Service würde
Dependency Injection ohne Bedarf einführen und `AddTaskComponent`s
bestehende, bewusste Entkopplung von `TaskService` durchbrechen (die
Komponente kennt `TaskService` heute nicht, sondern emittiert nur ein DTO).
Stattdessen: eigene Datei `task-file.utils.ts`, weiterhin eine reine Funktion
ohne DI, aber mit ehrlichem Namen für ihre Domänenbindung.

**Nachtrag 2 (gleicher Tag):** Die beiden bestehenden Eigenbau-ID-Generatoren im
Projekt (`Subtask.id` in add-task.ts, `ToastService.generateId()`) wurden zur
Konsistenz ebenfalls auf `crypto.randomUUID()` umgestellt —
`ToastService.generateId()` war danach nur noch eine sinnlose Ein-Zeilen-Hülle
um den nativen Aufruf und wurde entfernt.

**SQL, ausgeführt im Supabase-Dashboard** (kein Migrations-Tooling im Projekt —
Schema wird bewusst direkt im Dashboard gepflegt, SQL hier nur als Beleg):

```sql
alter table tasks
  add column files jsonb default '[]'::jsonb;

create or replace function create_task_with_contacts(
  task_data jsonb,
  contact_ids uuid[]
) returns tasks as $$
declare
  new_task tasks;
begin
  insert into tasks (title, description, status, priority, category, subtasks, due_date, files)
  values (
    task_data->>'title',
    task_data->>'description',
    (task_data->>'status')::text,
    (task_data->>'priority')::text,
    (task_data->>'category')::text,
    coalesce((task_data->'subtasks')::jsonb, '[]'::jsonb),
    (task_data->>'due_date')::date,
    coalesce((task_data->'files')::jsonb, '[]'::jsonb)
  )
  returning * into new_task;

  if array_length(contact_ids, 1) > 0 then
    insert into task_contacts (task_id, contact_id)
    select new_task.id, unnest(contact_ids);
  end if;

  return new_task;

exception
  when others then
    raise exception 'create_task_with_contacts failed: %', sqlerrm;
end;
$$ language plpgsql;

create or replace function update_task_with_contacts(
  p_task_id uuid,
  task_data jsonb,
  contact_ids uuid[]
) returns tasks as $$
declare
  updated_task tasks;
begin
  update tasks set
    title       = coalesce(task_data->>'title',       title),
    description = coalesce(task_data->>'description', description),
    status      = coalesce(task_data->>'status',      status::text)::text,
    priority    = coalesce(task_data->>'priority',    priority::text)::text,
    category    = coalesce(task_data->>'category',    category::text)::text,
    subtasks    = coalesce((task_data->'subtasks')::jsonb, subtasks),
    due_date    = coalesce((task_data->>'due_date')::date, due_date),
    files       = coalesce((task_data->'files')::jsonb, files)
  where id = p_task_id
  returning * into updated_task;

  delete from task_contacts where task_contacts.task_id = p_task_id;

  if array_length(contact_ids, 1) > 0 then
    insert into task_contacts (task_id, contact_id)
    select updated_task.id, unnest(contact_ids);
  end if;

  return updated_task;

exception
  when others then
    raise exception 'update_task_with_contacts failed: %', sqlerrm;
end;
$$ language plpgsql;
```

### AT-5/6/7/8: Filepicker, Vorschauliste, Speichern, Edit-Mode

**Entscheidung:** Alle vier Tickets in einem Durchgang umgesetzt (siehe
Backlog oben) — sie betreffen dieselbe Komponente (`AddTaskComponent`) und
denselben `files`-State, eine künstliche Trennung hätte nur Zwischenzustände
ohne eigenen Wert erzeugt. Layout: `Priority`/`Category` von der rechten in
die linke Spalte verschoben, rechte Spalte neu `Attachments` → `Subtasks` →
`Assigned to` (Figma-Vorgabe). Dropzone ist ein `<label for="task-files">`,
das den echten (visuell versteckten, aber fokussierbaren) `<input
type="file">` umschließt — Klick und Tastatur funktionieren nativ ohne JS.
Datei-Validierung (AT-2) läuft direkt bei Auswahl/Drop; ungültige Dateien
lösen `ToastService.error(...)` aus, gültige werden komprimiert+kodiert
(AT-3/4) und erscheinen sofort in der Vorschauliste. `hasChanges`-Vergleich
für Dateien läuft über `name+size+type`, nicht `id`/`data` (siehe Diskussion:
`id` ist bei jedem Re-Upload neu, `data` wäre ein potenziell großer
Base64-String, der bei jedem Tastendruck neu verglichen würde).

**Begründung für die visuell-versteckt-Technik:** `display: none` oder
`visibility: hidden` hätten den `<input>` auch aus der Tab-Reihenfolge
entfernt — stattdessen Standard-"visually hidden"-CSS (1×1px,
`clip-path: inset(50%)`, weiterhin fokussierbar). Fokus-Ring wird per
CSS `:has()` auf das sichtbare `<label>` gespiegelt, da der unsichtbare
Input selbst keine sichtbare Box hat.

**Verifiziert:** Mit einem Playwright-Skript (Guest-Login → `/add-task` →
zwei Test-PNGs hochladen → Hover) gegen den laufenden Dev-Server geprüft —
leere Liste, gefüllte Liste und Hover-Delete-Overlay stimmen visuell mit dem
Figma-Design überein, keine Console-Errors.

**Zurückgestellt:** Fallback in `buildTaskFile`, der bei einem Dateinamen
ohne erkennbare Endung (z. B. bei Drag&drop eines Bildes von einer
Webseite statt einer lokalen Datei) eine Endung anhand des MIME-Typs
ergänzt. Bewusst nicht umgesetzt — seltener Randfall, keine
Checklisten-Anforderung, jederzeit nachrüstbar.

**Alternativen erwogen:** Fokussteuerung per manuellem `role="button"` +
`tabindex` + `input.click()` auf einem Div (verworfen — natives
`<label for>` erledigt Klick und Tastaturzugriff bereits korrekt, ohne
ARIA-Attribute nachzubauen); JS-Funktion zum Kürzen langer Dateinamen
(verworfen zugunsten von CSS `text-overflow: ellipsis`, das an die reale
Containerbreite/Schriftart angepasst ist, nicht an eine feste Zeichenzahl —
gleiches Muster wie bereits bei `.add-task__subtask-title` im Projekt).

### AT-5-Nacharbeit: Pixel-genauer Feinschliff gegen Figma

Nach visuellem Abgleich (Nutzer-Screenshots vs. laufende App) drei
CSS-Korrekturen an der Dateivorschau:

1. **Horizontales Scrollen wuchs den Container statt zu scrollen** —
   klassische Flex/Grid-Falle: `.add-task__col` (Grid-Item) und
   `.add-task__file-list` hatten kein `min-width: 0`, wodurch beide sich
   nicht unter die "natürliche" Breite ihres Inhalts (viele
   112px-Vorschaubilder) verkleinern konnten. Mit Playwright gemessen:
   rechte Spalte blieb bei 8 Dateien exakt bei 505.5px (statt auf ~950px zu
   wachsen), `overflow-x: auto` greift jetzt wie vorgesehen.
2. **Bild und Dateiname sahen wie zwei separate Elemente aus** — im
   Figma-Design teilen sich Vorschaubild und Beschriftung **eine** Karte mit
   gemeinsamem Rahmen. Rahmen/Radius/Clipping von
   `.add-task__file-thumb-wrapper` auf `.add-task__file-item` verschoben,
   sodass Bild (oben, randlos) und Name (unten, mit Innenabstand) als eine
   Einheit erscheinen.
3. **Kartengröße nicht Figma-genau** — Figma zeigt für die Karte exakt
   `112 × 83` (Breite fix, Höhe "Hug"/inhaltsbasiert). Erste Annahme
   (`aspect-ratio: 1` fürs Vorschaubild) war falsch — das Bild ist kein
   Quadrat, weil sich 83px auf Bild + Beschriftung aufteilen. Gelöst über
   `.add-task__file-item { height: 83px }` + `.add-task__file-thumb-wrapper
{ flex: 1 }` (füllt automatisch das, was der Dateiname nicht braucht) —
   robuster als eine feste Bildhöhe, weil es sich an die tatsächliche
   Text-Höhe anpasst statt eine geschätzte Zahl zu hardcoden. Mit Playwright
   verifiziert: gerenderte Kartengröße exakt `{width: 112, height: 83}`.

**Alternativen erwogen:** feste Pixelhöhe fürs Vorschaubild statt `flex: 1`
(verworfen — bricht bei jeder künftigen Änderung an Schriftgröße/Padding des
Dateinamens erneut, `flex: 1` braucht keine manuelle Nachrechnung).

### Mobiler Lösch-Bug + View/Delete-Aktionspaar auf Vorschaubildern

**Problem:** `.add-task__file-remove` deckte die komplette Vorschau ab
(`inset: 0`). Auf Touch-Geräten simulieren viele Browser `:hover` beim ersten
Tap, wodurch ein einzelner Tap die Datei sofort löschte — ohne sichtbare
Warnung. Zusätzlich hätte diese Vollflächen-Lösung mit der
Checklisten-Anforderung "Beim Klicken auf die Bilder, werden diese mit einem
Imageviewer geöffnet" kollidiert (kein Platz für einen Klick-zum-Ansehen).

**Entscheidung:** Statt einer Vollflächen-Löschen-Fläche zwei kleine runde
Buttons oben rechts im Vorschaubild: **Ansehen** (`eye-icon.svg`, öffnet
später den gemeinsamen Image Viewer, aktuell Platzhalter
`onViewFile()`/AT-10) und **Löschen** (`delete-icon.svg`, bestehend). Auf dem
Desktop wie gehabt per Hover eingeblendet; zusätzlich `@media (hover: none)`
— zeigt beide Buttons dauerhaft auf Touch-Geräten (kein Hover verfügbar).
Hover-Farbwechsel (grau → blau) über denselben `content: var(--hover-icon)`
CSS-Trick wie in der bestehenden `Button`-Komponente (`button.scss`), nicht
über einen neuen Mechanismus. Neues Asset `eye-blue.svg` — mechanisch aus
`eye-icon.svg` erzeugt (identischer Pfad, `fill` auf `#29ABE2` geändert),
exakt nach demselben Muster wie das bereits vorhandene `delete-blue.svg`.

**Begründung:** `@media (hover: none)` statt einer Breakpoint-Media-Query
(`max-width`) — prüft die tatsächliche Hover-**Fähigkeit** des Geräts, nicht
die Bildschirmbreite (ein Touch-Laptop in Desktop-Breite hat z. B. auch
keinen zuverlässigen Hover). Zwei kleine Ecken-Buttons statt Vollflächen-
Overlay lässt den Rest des Vorschaubilds frei für den künftigen
Klick-zum-Ansehen (AT-10) — vermeidet, dieselbe Stelle für AT-10 nochmal
umbauen zu müssen.

**Nicht in dieser Änderung:** Der eigentliche Image Viewer (Klick auf
"Ansehen" öffnet aktuell nur eine Konsolen-Warnung); dasselbe
Aktionspaar-Konzept für die Task-Detailansicht (dort: Download + Ansehen
statt Löschen + Ansehen — Figma zeigt dort ein Download-Icon, das im Projekt
noch nicht als Asset existiert).

**Alternativen erwogen:** Vollflächen-Overlay auf Mobile einfach dauerhaft
sichtbar lassen (verworfen — hätte den AT-10-Konflikt nicht gelöst, nur den
akuten Mobile-Bug); eigener Hover-Mechanismus statt Wiederverwendung des
`Button`-CSS-Tricks (verworfen — unnötige Doppelung eines bereits gelösten
Problems).

### AT-9 vorgezogen: gemeinsame `TaskFileList`-Komponente + Attachments im Task-Modal

**Entscheidung:** Datei-Vorschaukarte (Thumbnail + Name + Aktionen) aus
`add-task` in eine eigene, wiederverwendbare Komponente
[task-file-list](../src/app/components/shared/task-file-list/task-file-list.ts)
extrahiert (`components/shared/`, Standard-Encapsulation statt `None`).
API: `files: TaskFile[]` (required), `variant: 'editable' | 'readonly'`,
Output `view` (immer), Output `remove` (nur `editable`). `add-task` nutzt
`variant="editable"`; das Task-Detail-Modal (`task-modal`) bekommt damit
seine Attachments-Sektion (zwischen "Assigned To" und "Subtasks", passend zur
Figma-Reihenfolge) mit `variant="readonly"`. "Download" ist **kein** Output —
`file.data` ist bereits eine volle Data-URL, ein `<a [href]="file.data"
[download]="file.name">` lädt clientseitig herunter, ganz ohne
Parent-Beteiligung.

**Begründung:**

- Beide Stellen brauchten exakt dieselbe Karte — nur die zweite Aktion
  unterscheidet sich (Löschen vs. Herunterladen). Ohne Extraktion hätten wir
  jeden künftigen Bugfix (wie die Größen-/Rahmen-Korrekturen von vorhin)
  zweimal machen müssen.
- Neues Icon-Paar `download-icon.svg`/`download-blue.svg` von Hand erstellt
  (kein Vorlagen-SVG zum mechanischen Umfärben vorhanden wie bei `eye-blue`)
  — Pfeil-in-Ablage-Symbol, gleiches Format/gleiche Farben (`#2A3647` /
  `#29ABE2`) wie alle anderen Icons im Projekt.
- `view` bleibt ein Output (nicht lokal gelöst wie `download`), weil der
  spätere Image Viewer über **alle** Dateien der Liste blättern soll, nicht
  nur die angeklickte — dafür muss die aufrufende Seite (die den vollen
  `files()`/`task().files`-Kontext hat) den Viewer öffnen, nicht die
  Karten-Komponente selbst.

**Verifiziert:** Kompletter Playwright-Durchlauf (Task mit Datei über
Add-Task anlegen → im Board öffnen → Task-Modal zeigt Attachments mit
Hover-Aktionen → Download-Link zeigt auf die korrekte Data-URL mit
korrektem Dateinamen) ohne Console-Errors. Der dabei erzeugte Test-Task
wurde anschließend über die App selbst wieder gelöscht (Guest-Daten sind
geteilt — sonst bliebe er für alle sichtbar).

**Zurückgestellt:** Der eigentliche Image Viewer — `onViewFile()` ist in
beiden Komponenten weiterhin nur ein `console.warn`-Platzhalter.

**Alternativen erwogen:** Karte in beiden Komponenten dupliziert lassen
(verworfen — DRY-Verstoß, zwei Stellen zum Pflegen); `download` als Output
wie `view` (verworfen — unnötig, da der Download clientseitig vollständig
lokal lösbar ist und keinen Listen-Kontext braucht).

### Umzug: `TaskFileList` gehört nicht in `shared/`

**Entscheidung:** `components/board/task/` (task-card, task-modal) nach
`components/task/` verschoben (per `git mv`, Historie bleibt erhalten);
`task-file-list` liegt jetzt dort statt in `components/shared/`. Importpfade
in `board-column.ts`, `pages/board/board.ts`, `add-task.ts`, `task-modal.ts`
auf `@components/task/...` aktualisiert.

**Begründung:** `shared/` ist in diesem Projekt für domänenneutrale
UI-Bausteine reserviert (Avatar, Button, Modal, Loader — überall im Frontend
einsetzbar). `TaskFileList` arbeitet mit `TaskFile` und ist außerhalb des
Task-Kontexts bedeutungslos — "an zwei Stellen verwendet" macht es nicht
"app-weit generisch". Gleiches Prinzip wie schon bei `buildTaskFile`
(AT-4-Nachtrag): domänenspezifischer Code gehört zu seiner Domäne, nicht in
einen neutralen Ordner, nur weil er wiederverwendet wird. `task-card` und
`task-modal` waren ohnehin nie board-spezifisch (sie repräsentieren einen
Task, nicht das Board-Layout) — der Ordnername `board/task/` war irreführend.

**Nachtrag — echter Bug beim Verifizieren gefunden:** Nach dem Umzug per
Playwright-Smoke-Test geprüft (Board öffnen → Task-Card anklicken →
Task-Modal). Ergebnis: `TypeError: Cannot read properties of null (reading
'length')` in `task-modal.html`, weil `task().files` bei einem älteren
Dummy-Task tatsächlich `null` war (nicht `[]`) — die Nullable-Spalte (siehe
AT-1-Entscheidung) hat also real ein Problem, nicht nur theoretisch.
`task().subtasks` ist derselben Nullable-Falle ausgesetzt.

**Fix:** Neue Funktion `normalizeTask(task)` in
[task.model.ts](../src/app/core/models/task.model.ts) —
`{ ...task, subtasks: task.subtasks ?? [], files: task.files ?? [] }` —
angewendet an **beiden** Stellen, an denen `TaskService` Daten von Supabase
entgegennimmt (`getAll()`, `reloadOne()`). Bewusst dort statt mit `?.` in
jedem einzelnen Template geflickt: einmal an der Datenquelle normalisiert,
und der Rest der App kann sich wieder auf das Typversprechen "`files`/
`subtasks` sind immer Arrays" verlassen, statt dass jede neue Komponente das
Nullable-Wissen erneut kennen und selbst absichern muss.

**Alternativen erwogen:** `?.`/`?? []` einzeln in jedem betroffenen Template
(verworfen — muss bei jeder neuen Stelle, die `task.files`/`task.subtasks`
liest, erneut bedacht werden, leicht zu vergessen); Spalte nachträglich auf
`NOT NULL` setzen (nicht verworfen, aber nicht sofort gemacht — würde
bestehende `null`-Zeilen in der DB nicht rückwirkend reparieren, eine
Migration mit `update ... set files = '[]' where files is null` bräuchte es
so oder so zusätzlich; `normalizeTask` behebt das Symptom unabhängig davon,
ob/wann diese DB-seitige Aufräumaktion passiert).

### Feinschliff: Hover-Stil der Datei-Aktionen + Due-Date-Klickfläche

**Entscheidung 1:** Die Ecken-Badges (vorherige Entscheidung) durch ein
vollflächiges, abgedunkeltes Overlay mit zentrierten Icons ersetzt — nach
Figma-Vergleich durch den Nutzer war das die tatsächliche Vorgabe, nicht die
Ecken-Variante. Icons sind standardmäßig weiß (`filter:
brightness(0) invert(100%)` auf die bestehenden dunklen SVGs — kein neues
Icon-Asset nötig) und wechseln beim Hover der jeweiligen Einzel-Schaltfläche
auf die blaue Variante (Filter wird dabei entfernt, sonst würde er auch das
blaue Icon einfärben). Der frühere Einwand "Vollflächen-Overlay blockiert
den künftigen Klick-zum-Ansehen" entfällt hier: "Ansehen" (Auge) ist selbst
eine der beiden zentrierten Schaltflächen, es muss also kein Leerraum für
einen separaten Klick auf das Bild freigehalten werden.

**Entscheidung 2:** `due_date`-Feld — Klick **irgendwo** im Feld (nicht nur
auf das Kalender-Icon) öffnet den nativen Date-Picker, über
`input.showPicker()` in einem `(click)`-Handler; `cursor: pointer` auf dem
gesamten Feld signalisiert die Klickbarkeit. `showPicker()` ist in den
Projekt-TS-Typen bereits als garantiert vorhanden typisiert (kein
Feature-Detection-Guard nötig).

**Verifiziert:** Playwright — Hover/Fokus zeigen abgedunkeltes Overlay mit
weißen, mittig zentrierten Icons; Hover der Löschen-Schaltfläche zeigt den
Blau-Wechsel; mobile Emulation (`hover: none`) zeigt denselben
abgedunkelten/zentrierten Zustand dauerhaft; Klick auf den Textbereich von
`due_date` (nicht das Icon) löst `showPicker()` ohne Fehler aus.

### AT-10: Image Viewer (viewerjs)

**Entscheidung:** `viewerjs` (fengyuanchen/viewerjs, npm `viewerjs@1.13.0`,
bringt eigene TS-Typen mit) per `npm install viewerjs` hinzugefügt — passend
zum in der Kurs-Checkliste genannten "ViewerJS" und dessen Funktionsumfang
(Zoom, Rotieren, Slideshow, Blättern). CSS global über `angular.json`
(`styles`-Array) eingebunden, nicht per `@use` in `styles.scss` — es ist
reines Drittanbieter-CSS, kein Sass, Angular-üblicher Weg dafür.

Architektur wie `ToastService`/`ToastContainer`, bewusst **nicht** wie
`ModalService` (der hostet beliebige Angular-Komponenten dynamisch — hier
unnötig, Viewer.js verwaltet sein Overlay-DOM ohnehin komplett selbst):

- [image-viewer.service.ts](../src/app/core/services/image-viewer.service.ts)
  — Signale `files`/`initialIndex`/`isOpen`, `open(files, index)`/`close()`.
- [image-viewer](../src/app/components/task/image-viewer/image-viewer.ts) —
  einmal in `app.html` neben `<app-toast-container />` gemountet (auf jeder
  Seite verfügbar, wie Toast — nicht nur im main-layout wie Modal).
- `add-task`/`task-modal`: `onViewFile()` ist kein Platzhalter mehr, ruft
  `imageViewer.open(files, index)` mit dem Index der geklickten Datei.

**Drei echte Bugs beim Implementieren gefunden und behoben** (nicht nur
Theorie — alle per Playwright reproduziert, bevor sie gefixt wurden):

1. **Race zwischen `effect()` und Angular-Template-Rendering.** Ursprünglich
   wurde die Bildergalerie per `@for` im Template gerendert; der `effect()`,
   der `Viewer` konstruiert, feuerte aber nachweislich, _bevor_ Angular die
   `<img>`-Elemente aus `files()` tatsächlich ins DOM geschrieben hatte
   (`container.children.length === 0` zur Laufzeit gemessen). Gelöst, indem
   die Galerie **nicht** deklarativ per `@for`, sondern **imperativ** in TS
   gebaut wird (`document.createElement('img')` pro Datei, synchron direkt
   vor `new Viewer(...)`) — konsequent, da dieser Container ohnehin nur ein
   interner Übergabepunkt für eine Drittanbieter-Bibliothek ist, kein
   User-sichtbares Template.
2. **`initialViewIndex` öffnet nichts von selbst.** Ist nur der Default-Wert,
   auf den sich `view()` zurückzieht — ohne expliziten `viewer.view(index)`-
   Aufruf blieb der Viewer unsichtbar (im Quellcode verifiziert:
   `view(index = this.options.initialViewIndex) { ...; return this.show(); }`).
3. **`data-*`-Metadaten kamen als `undefined` im Title-Renderer an.**
   Viewer.js rendert jedes Bild auf einer internen Kopie und kopiert dabei
   nur Attribute aus der (undokumentiert kurzen) Default-Liste
   `inheritedAttributes` (`crossOrigin`, `decoding`, `isMap`, `loading`,
   `referrerPolicy`, `sizes`, `srcset`, `useMap` — kein `data-*`). Gelöst
   durch explizites `inheritedAttributes: ['data-filename', 'data-filetype',
'data-filesize']` in den Viewer-Optionen.

**Weitere Details:**

- Download-Button im Toolbar: eigener Toolbar-Eintrag (`download: { show:
true, click: ... }`) — Viewer.js hat dafür keine mitgelieferte Icon-Grafik
  (nur für seine 11 eingebauten Buttons), also eigenes CSS
  (`.viewer-download::before`) mit `download-icon.svg`, exakt in den Maßen
  der Bibliotheks-eigenen Buttons (20×20, 2px Margin) und mit
  `filter: brightness(0) invert(100%)` auf Weiß gebracht (gleiche Technik wie
  schon bei den Datei-Aktionsbuttons). `encapsulation: ViewEncapsulation.None`
  auf der Komponente nötig, damit dieses CSS das von Viewer.js selbst
  eingefügte (außerhalb von Angulars Template-Baum liegende) DOM erreicht —
  gleiches Muster wie bei `TaskModal`.
- Downloadbarkeit selbst gelöst wie in `task-file-list` (kein Server nötig):
  `file.data` ist schon eine volle Data-URL, ein programmatisch erzeugter
  `<a download>`-Klick reicht.
- Der aktuell angezeigte Index wird über das `viewed`-Event nachgeführt
  (`event.detail.index`) statt über eine (in den TS-Typen nicht öffentlich
  deklarierte) `viewer.index`-Property — hält sich an das dokumentierte API.

**Verifiziert (Playwright, gegen den laufenden Dev-Server):** Öffnen aus
Add-Task, Titel zeigt "Dateiname • Typ • Größe" korrekt, Blättern zur
nächsten Datei aktualisiert den Titel, Zoom/Rotieren funktionieren, Klick auf
den Download-Button löst einen echten Browser-Download mit korrektem
Dateinamen aus, Schließen entfernt den Viewer vollständig aus dem DOM. Keine
Console-Errors in keinem Schritt.

**Alternativen erwogen:** Galerie weiter per `@for` rendern und stattdessen
mit `afterRenderEffect`/zusätzlichen Timing-Tricks synchronisieren
(verworfen — die imperative Lösung ist einfacher und für einen rein
internen, nie sichtbaren Container angemessener); `ModalService` zum Hosten
des Viewers (verworfen, s. o. — Viewer.js braucht keinen
Component-Host-Mechanismus).

### AT-14: `TaskFilePicker` extrahiert (400-LOC-Limit)

**Entscheidung:** `add-task.ts` war mit 436 Zeilen über dem
Clean-Code-Limit der Checkliste ("Max 400 LOCs pro Datei"). Statt den
Code lokal zu kürzen, das komplette Attachments-Feld (Dropzone, Datei-Input,
Validierungs-/Kompressions-Pipeline, `isDragOver`-State, Viewer-Trigger) in
eine eigene Komponente
[task-file-picker](../src/app/components/task/task-file-picker/task-file-picker.ts)
ausgelagert. Anbindung an `add-task.ts` über `model<TaskFile[]>([])` (Angular
Signal-basiertes Two-Way-Binding): `add-task.ts` behält sein eigenes
`files`-Signal als Quelle der Wahrheit für `onSave()`/`buildSnapshot()`/
`onClear()`/Prefill in `ngOnInit()` unverändert, bindet es im Template nur
noch mit `[(files)]="files"` — der Picker synchronisiert automatisch in
beide Richtungen.

**Begründung:**

- Kürzen vor Ort (Kommentare/Leerzeilen streichen) hätte die fehlenden ~36
  Zeilen nicht sauber eingespart und das eigentliche Problem — eine
  Komponente mit zwei getrennten Verantwortlichkeiten (Formular +
  Datei-Upload) — nicht behoben.
- `model()` statt eines klassischen `@Input()`/`@Output()`-Paars: weniger
  Boilerplate, deckt sich mit Angulars aktuellem empfohlenen Muster für
  zwei-Weg-gebundenen Kind-Zustand, den der Elternteil weiterhin als
  eigenes Signal lesen/schreiben will.
- `TaskFilePicker` ist bewusst in `components/task/` (nicht `shared/`) —
  gleiche Begründung wie bei `TaskFileList`: domänenspezifisch, nicht
  app-weit neutral.
- Ergebnis: `add-task.ts` 436 → 365 Zeilen, neue Komponente 93 (TS) + 38
  (HTML) + 113 (SCSS) Zeilen — jede Datei mit deutlichem Abstand unter dem
  Limit. SCSS-Klassen konsequent umbenannt (`add-task__filepicker-*` →
  `task-file-picker__*`), da Angulars Style-Kapselung Kind-Komponenten die
  gescopten Eltern-Styles nicht vererbt — nicht kopiert, sondern bewusst neu
  benannt passend zum neuen Component-Scope.

**Verifiziert:** Vom Nutzer manuell durchgetestet (Upload, Entfernen,
Speichern, Edit-Modus mit Prefill) — funktioniert wie vor dem Refactor.

**Alternativen erwogen:** Nur Kommentare/Leerzeilen kürzen, um knapp unter
400 zu kommen (verworfen — behebt nicht die eigentliche
Verantwortlichkeits-Vermischung, bräuchte bei jeder künftigen Erweiterung
erneut Kürzungs-Kunststücke); klassisches `@Input()`/`@Output('filesChange')`
statt `model()` (verworfen — mehr Code für dasselbe Ergebnis, `model()` ist
das modernere, für diesen Fall vorgesehene Muster).
