# Station Integration Plan

Comprehensive plan for integrating 5 new Faroese radio stations into the scraper and web UI. Each station is its own PR. Each PR updates this document with findings and checks off completed items.

---

## Research Summary

### Infrastructure Map

All 5 stations stream via two Icecast 2.4.4 servers:

| Server | Stations | Status endpoint |
|--------|----------|-----------------|
| `stream-secure.midlar.fo` (HTTPS proxy for `stream2.midlar.fo:8000`) | VoxPop, FM1, (also Ras 2) | `https://stream-secure.midlar.fo/status-json.xsl` |
| `srv.stream.fo:8000` | Lindin (FM98,7 previously listed here, see below) | `http://srv.stream.fo:8000/status-json.xsl` |
| `liveradio.stream.fo` (AzuraCast) | Norðlýsið, FM98,7 (also Tulking, Jolarasin, Stream.fo) | `https://liveradio.stream.fo/api/nowplaying/{shortcode}` |
| `player.sjey.fo` (standalone PHP) | SJEY | `https://player.sjey.fo/playing.php` |

### Now-Playing Metadata Availability

| Station | ICY metaint | StreamTitle observed | Alt. endpoint | Assessment |
|---------|-------------|---------------------|---------------|------------|
| VoxPop | 16000 | `''` (empty) | None found | ICY metadata supported but was empty on Sunday morning. Needs testing during weekday broadcast hours. |
| FM1 | 16000 | `'Unknown'` | fm1.fo WP REST (no track endpoint) | Same as VoxPop. |
| FM98,7 | 16000 | `''` (empty) | None found | Same server as Lindin. |
| Lindin | 16000 | `''` (empty) | Uses Qodio platform (no public API found) | Same server as FM98,7. |
| SJEY | N/A | N/A | `playing.php` returns HTML with artist + title | Best metadata source of all 5. |

### Stream URLs

| Station | Mount | Format | Bitrate |
|---------|-------|--------|---------|
| VoxPop | `https://stream-secure.midlar.fo/voxpop` | MP3 | 320 kbps |
| FM1 | `https://stream-secure.midlar.fo/fm1-128` | MP3 | 128 kbps |
| FM98,7 | `http://srv.stream.fo:8000/128.mp3` | MP3 | 128 kbps |
| Lindin | `http://srv.stream.fo:8000/lindinhigh` | AAC+ | 64 kbps |
| SJEY | N/A (no stream needed) | N/A | N/A |

### Key Technical Insight

The existing Ras 2 integration uses a **radio.co API** (`https://public.radio.co/api/v2/s4d14b9fcc/track/current`), NOT Icecast metadata, even though Ras 2 also streams via Midlar's Icecast. This suggests Midlar's Icecast may not reliably carry track metadata. The new stations likely need a different approach.

### Update (2026-10-18): AzuraCast server on liveradio.stream.fo

`https://liveradio.stream.fo/api/stations` lists five public stations: `nordlysid`, `fm98,7`, `tulking`, `jolarasin`, `stream.fo`. `GET /api/nowplaying/{shortcode}` returns structured JSON (`now_playing.song.artist` / `.title`, `played_at`, `live.is_live`, plus a short `song_history`). No auth needed.

- **Norðlýsið** and **FM98,7** carry real track metadata. Shared fetcher: `packages/scraper/src/azuracast.ts`. Norðlýsið is shipped; FM98,7 is waiting on more cleanup (see its section).
- **Tulking** and **Stream.fo** only played "Live.fo - Free ambient sound N" filler when checked. Not worth adding.
- **Jolarasin** not checked yet (likely a seasonal Christmas stream).
- **Lindin is not on this server.**

Metadata quirks seen (handled in `normalizeAzuraCastSong`):

| Quirk | Example | Handling |
|-------|---------|----------|
| Non-ASCII escaped as `%uXXXX` | `Fr%u00e6ndur`, `Kj%u00f8lar` | Decoded → `Frændur`, `Kjølar` |
| Character lost upstream (`%ufffd`) | `Heine L%ufffdtzen`, `Ebenezerk%ufffdri%ufffd` | Decoded to `�` and kept. **Open question**: store, skip, or repair? |
| Playlist/show name in artist field (live studio) | `PoppList3` / `Enekk - Eru tit til` | Artists matching `PoppList\d*` or `Blanda` → split title on first ` - ` |
| Untagged files | `Track  6` | Skipped |
| Empty artist | FM98,7: `''` / `Magni Christiansen` | Skipped |
| Junk after a NUL byte | `I Am\x00e`, `Magni Christiansen\x00t` | Truncated at the NUL |
| Text misread as UTF-16 | `潇灳汥吠돃慮⁲2?` (= "Gospel Tónar 2") | Skipped |
| Other control characters | | Stripped |

---

## Shared Prerequisites (PR 0 — optional)

Before integrating stations that need ICY metadata, we may need shared infrastructure.

### Icecast Status Polling Approach (preferred)

Both Icecast servers expose `status-json.xsl` which returns a JSON object with a `title` field per mount point. This is simpler than ICY stream parsing — it's just a GET request returning JSON.

**Midlar server** (`https://stream-secure.midlar.fo/status-json.xsl`):
```json
{
  "icestats": {
    "source": [
      { "listenurl": "http://stream2.midlar.fo:8000/voxpop", "server_name": "VoxPop", ... },
      { "listenurl": "http://stream2.midlar.fo:8000/fm1-128", "title": "Unknown", ... }
    ]
  }
}
```

**stream.fo server** (`http://srv.stream.fo:8000/status-json.xsl`):
```json
{
  "icestats": {
    "source": [
      { "listenurl": "http://localhost:8000/128.mp3", "server_name": "FM98,7", ... },
      { "listenurl": "http://localhost:8000/lindinhigh", "server_name": "Lindin", ... }
    ]
  }
}
```

### ICY Stream Metadata Approach (fallback)

If the `status-json.xsl` `title` field remains empty/Unknown during live broadcasts, we'll need to parse ICY metadata directly from the audio stream. This involves:
1. Connecting with `Icy-MetaData: 1` header
2. Reading `icy-metaint` from response headers
3. Parsing metadata frames embedded in the audio data every N bytes
4. Extracting `StreamTitle='Artist - Title';` pattern

This would require a new utility module and adds complexity (persistent connections, binary parsing). Only implement if Icecast status polling doesn't work.

---

## Station 1: SJEY (easiest — proves the integration pattern)

**Slug:** `sjey`
**Type:** Christian radio
**Why first:** Has the most reliable metadata source — a simple HTTP endpoint returning structured HTML. Good starting point.

### Metadata Source

`GET https://player.sjey.fo/playing.php` returns:
```html
<div class="playing--current">
  <div class="playing--time">7:54</div>
  <div class="playing--artist">Mark Gray</div>
  <div class="playing--title">My Savior First of All</div>
</div>
<div class="playing--history">
  <div class="playing--history-item" title="Malin Zachariassen - Heilagt folk">
    ...
  </div>
</div>
```

### Checklist

- [x] **Spike: Verify endpoint reliability**
  - [x] Confirm `playing.php` returns data at different times of day — tested Sunday 7:57 AM local, returns current + history
  - [ ] Confirm it returns data on weekdays (might only broadcast certain hours) — still need to verify
  - [x] Document response when nothing is playing — endpoint returns history even during current play, always has data

- [x] **Scraper changes**
  - [x] Add `'sjey'` to `StationSlug` type in `types.ts`
  - [x] Create fetcher in `fetchers.ts`:
    - GET `https://player.sjey.fo/playing.php`
    - Parse HTML with regex (no dependency needed — structure is simple)
    - Return `PlayingEvent` with artist, title, and raw HTML as rawData
    - Returns `null` when no `.playing--current` artist/title found
  - [x] Add `STATION_URL_SJEY` env var
  - [x] Skipped Zod validation — regex parsing is sufficient for this simple HTML
  - [x] Update `isLikelyAd.ts`: added "sjey" to station names, added `RELIGIOUS_READINGS` pattern for "Bíbliulestur" and "Dagsins orð"

- [x] **Web UI changes**
  - [x] Add SJEY color to `stationCardAccent` in `page.tsx` (purple accent: `#7a5a8a`)
  - [x] Add SJEY styling to `StationBadge` CSS (bg: `#f0edf5`, color: `#5a4a7a`)

- [x] **Deploy**
  - [x] Add `STATION_URL_SJEY=https://player.sjey.fo/playing.php` to Fly.io secrets

- [x] **Verified**: both scraper and web-ui build cleanly
- [x] **Verified**: fetcher returns correct data from live endpoint (tested: `{ artist: 'Sangbrøður', title: 'Vinur hoyr' }`)

---

## Station 2: VoxPop

**Slug:** `voxpop`
**Type:** Commercial music station (100% hit music, pop, top 40)
**Why second:** Highest-value music station. Shares Midlar Icecast with the already-integrated Ras 2, so infrastructure is familiar.

### Metadata Source (TBD — needs spike)

**Option A — Icecast status polling:**
`GET https://stream-secure.midlar.fo/status-json.xsl` → find the `voxpop` source → read `title` field.
This is the simplest approach if the `title` field is populated during live broadcasts.

**Option B — ICY stream metadata:**
Connect to `https://stream-secure.midlar.fo/voxpop` with `Icy-MetaData: 1` header, parse `StreamTitle` from the binary stream.

**Option C — External discovery:**
Check if VoxPop uses a third-party service (like radio.co for Ras 2) that has a now-playing API. The voxpop.fo website was down during research (ECONNREFUSED).

### Checklist

- [ ] **Spike: Find working metadata source**
  - [ ] Poll `status-json.xsl` during weekday daytime hours — does VoxPop's `title` field populate?
  - [ ] If yes → Option A (Icecast status polling)
  - [ ] If no → sample ICY stream metadata during broadcasts — does `StreamTitle` populate?
  - [ ] If yes → Option B (ICY stream parsing)
  - [ ] If neither → check if voxpop.fo comes back online, look for API
  - [ ] If no metadata source found → **station cannot be integrated yet**, document and move on
  - [ ] Document the `Artist - Title` format (separator character, field order)

- [ ] **Scraper changes**
  - [ ] Add `'voxpop'` to `StationSlug` type
  - [ ] Create fetcher based on spike results:
    - **If Option A:** Simple GET to status-json.xsl, find source by mount path, parse title
    - **If Option B:** Implement ICY metadata reader (new utility), connect to stream, parse StreamTitle
  - [ ] Add env var for metadata URL
  - [ ] Parse artist/title from format (likely `Artist - Title` separator like Ras 2)
  - [ ] Add Zod validation
  - [ ] Update `isLikelyAd.ts` with VoxPop-specific patterns (station idents, ad breaks)

- [ ] **Web UI changes**
  - [ ] Add VoxPop color to `stationCardAccent`
  - [ ] Add VoxPop styling to `StationBadge`

- [ ] **Fly.io secret**: Add env var for metadata URL

---

## Station 3: FM1

**Slug:** `fm1`
**Type:** Mixed news/talk + music (pop, top 40, country shows)
**Why third:** Same Midlar Icecast server as VoxPop — whatever approach works for VoxPop will likely work here too.

### Metadata Source (TBD — depends on VoxPop spike)

Same three options as VoxPop, using:
- Status: same `status-json.xsl` endpoint, mount `/fm1-128`
- ICY: `https://stream-secure.midlar.fo/fm1-128`
- fm1.fo WordPress has no track API (confirmed: `/api/v1/portal-feed/ljod` returned 404)

### Checklist

- [ ] **Spike: Verify metadata availability**
  - [ ] Reuse findings from VoxPop spike (same server)
  - [ ] Confirm FM1 mount specifically has metadata (might differ from VoxPop)
  - [ ] Note: FM1 is mixed talk/music — metadata might only appear during music segments

- [ ] **Scraper changes**
  - [ ] Add `'fm1'` to `StationSlug` type
  - [ ] Create fetcher (reuse VoxPop's approach/utilities)
  - [ ] Add env var
  - [ ] Update `isLikelyAd.ts` — FM1 has talk shows that should be flagged:
    - News broadcasts ("Tíðindi", "Fréttir")
    - Talk show names from the schedule
    - Station idents
  - [ ] Consider: is the talk/music mix worth tracking? A high `is_likely_not_music` rate might indicate the station isn't a good fit. Evaluate after a trial period.

- [ ] **Web UI changes**
  - [ ] Add FM1 color and badge styling

- [ ] **Fly.io secret**: Add env var

---

## Station 4: FM98,7 (Klaksvík)

**Slug:** `fm987`
**Type:** Christian music station (observed: gospel/CCM, e.g. Michael W. Smith, Amy Grant, Faroese choirs)

> **Update (2026-10-18):** FM98,7 now streams from the AzuraCast server (`liveradio.stream.fo`, shortcode `fm98,7`) with structured metadata and can use the shared AzuraCast fetcher. The Icecast options below are superseded.
>
> **Status (2026-10-21):** Its tags look like old 30-character ID3v1 fields mixed with newer tags, so it has its own, more aggressive cleanup in `fm987.ts`. On the 3½-day local trial (1,019 tracks) 72% are kept and 98% of kept tracks are clean (up from 74%).
> - [x] Strip album/year from titles: `Allan veg / (Her er løtan) / 2008` → `Allan veg` (137 tracks). Only when the title ends in a year, has a genre, or the album is in parentheses, since real titles can contain ` / `.
> - [x] Drop the duplicated tag value after `; `: `Hin Gamli Maðurin; Hin Gamli Maðurin` (47 tracks)
> - [x] Strip leading track numbers and stray dashes: `02 - Dómadagsmorgun`, `- Í syndamyrkri`
> - [x] Strip album names cut off by the 30-character limit: `Hann elskaði meg fyrst - (Kom`
> - [x] Reject artists that are only a track number (`4`, `(4)`)
> - [ ] Stray trailing characters on artists (`Magni Christiansent`, `SALTT`, `Alex Bærendsen¾`, ~25 duplicate artists): decided to merge these in the database later. Raw AzuraCast fields are kept in `raw_play_data`.
> - Known and accepted: 28% of tracks are rejected because the artist is empty and the title only holds the artist name (song name missing). Some titles are cut at 30 characters, and a few have lost letters (`�`).

### Metadata Source (TBD — needs spike)

**Option A — Icecast status polling:**
`GET http://srv.stream.fo:8000/status-json.xsl` → find `/128.mp3` source → read `title` field.

**Option B — ICY stream metadata:**
Connect to `http://srv.stream.fo:8000/128.mp3` with `Icy-MetaData: 1`.

Note: The stream.fo Icecast server uses `http://localhost:8000` in its listenurl, so we'll need to use the public hostname `srv.stream.fo:8000` instead.

### Checklist

- [ ] **Spike: Find working metadata source**
  - [ ] Poll `http://srv.stream.fo:8000/status-json.xsl` during broadcast hours — does the FM98,7 source have a populated `title`?
  - [ ] Sample ICY stream metadata during broadcasts
  - [ ] Note: this is a local community station — might have irregular broadcast hours
  - [ ] Document when the station broadcasts vs. automated playlist

- [ ] **Scraper changes**
  - [ ] Add `'fm987'` to `StationSlug` type
  - [ ] Create fetcher based on spike results
  - [ ] Add env var
  - [ ] Update `isLikelyAd.ts` with station-specific patterns
  - [ ] Handle: the `leygarkvold` mount ("Beinleidis ur Staraburinum") is a special broadcast — might want to detect/exclude

- [ ] **Web UI changes**
  - [ ] Add FM98,7 color and badge styling

- [ ] **Fly.io secret**: Add env var

---

## Station 4b: Norðlýsið (Klaksvík)

**Slug:** `nordlysid`
**Type:** News outlet (nordlysid.fo) with a music radio stream; has live studio shows
**Metadata source:** AzuraCast, `https://liveradio.stream.fo/api/nowplaying/nordlysid`

### Checklist

- [x] **Spike**: endpoint confirmed working, structured artist/title
- [x] **Local trial** (2026-10-18 → 21, 1,199 tracks): 77% kept, 98% of kept tracks clean. About 340–400 tracks a day, around the clock, mostly live from the studio.
  - Rejected: empty artist with only the artist name in the title (210), `Track N` (48), `Blanda` with no ` - ` in the title (18)
- [x] **Scraper changes**
  - [x] Add `'nordlysid'` to `StationSlug`
  - [x] Shared fetcher `fetchAzuraCast(shortcode)` in `azuracast.ts` (base URL hard-coded: it's public, no env var needed)
- [x] **Web UI**: add station hue (`nordlysid: 320`)
- [ ] **Deploy**: no Fly.io secret needed. The first play auto-creates the station row in prod.
- [ ] **Follow-ups** (minor, seen in the trial)
  - [ ] `isLikelyAd.ts`: `Komið øll við …` interview segments and `Frískt Lot` shows; check what `Útvarpsfløga` is
  - [ ] Compilation `Ung um aldarmótið` has `Song - Artist` titles (reversed)
  - [ ] Titles that repeat the artist: `All that rain` / `All That Rain - Destination`
  - [ ] Stray trailing punctuation: `Drowning(`, `Heaven is my goal.`

---

## Station 5: Lindin

**Slug:** `lindin`
**Type:** Christian radio (Kristiligt Kringvarp)
**Why last:** Mixed content (gospel music + religious programming). Note: FM98,7 has moved to AzuraCast, so Lindin is now alone on `srv.stream.fo:8000` and can't reuse that approach.

### Metadata Source (TBD — depends on FM98,7 spike)

Same stream.fo Icecast server:
- Status: `http://srv.stream.fo:8000/status-json.xsl`, mount `/lindinhigh`
- ICY: `http://srv.stream.fo:8000/lindinhigh`

The website references Qodio platform, but no public Qodio API was found.

### Checklist

- [ ] **Spike: Verify metadata availability**
  - [ ] Reuse findings from FM98,7 spike (same server)
  - [ ] Confirm Lindin mount specifically has metadata
  - [ ] Check if Qodio provides any metadata API (visit qodio.com, look for docs)

- [ ] **Scraper changes**
  - [ ] Add `'lindin'` to `StationSlug` type
  - [ ] Create fetcher (reuse FM98,7's approach)
  - [ ] Add env var
  - [ ] Update `isLikelyAd.ts`:
    - Religious readings ("Bíbliulestur", "Dagsins orð", etc.)
    - Prayer/devotional segments
    - Station idents ("Lindin", "Kristiligt Kringvarp")
  - [ ] Evaluate: high non-music rate expected given religious programming. Document after trial.

- [ ] **Web UI changes**
  - [ ] Add Lindin color and badge styling (note: the codebase already references `lindin` in some places)

- [ ] **Fly.io secret**: Add env var

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| ICY metadata never populated for Midlar stations | Blocks VoxPop + FM1 | Check at multiple times. Contact Midlar if needed. Worst case: stations can't be integrated. |
| ICY metadata never populated for stream.fo stations | Blocks FM98,7 + Lindin | Same as above. |
| voxpop.fo permanently down | Low — metadata comes from Icecast, not website | No impact on scraping if Icecast works. |
| SJEY `playing.php` format changes | Breaks SJEY scraper | Raw data is archived; parser can be updated. Monitor for errors. |
| Self-signed cert on stream.fo | Connection errors | Use `rejectUnauthorized: false` for stream.fo endpoints (or use HTTP not HTTPS). |
| High non-music rate on FM1/Lindin | Noisy data | `isLikelyAd.ts` patterns + trial period evaluation. Consider removing station if >80% non-music. |
| Rate limiting on Icecast status endpoint | Scraper gets blocked | Current scrape interval is 10s. Icecast status is lightweight. Should be fine but monitor. |

---

## Integration Order Rationale

```
SJEY → VoxPop → FM1 → FM98,7 → Lindin
```

1. **SJEY first** — reliable metadata, simple HTTP+HTML, proves the full integration cycle (scraper → DB → UI)
2. **VoxPop second** — highest-value music station, solves the Icecast metadata question for the Midlar server
3. **FM1 third** — same server as VoxPop, reuse approach, but mixed content adds non-music filtering complexity
4. **FM98,7 fourth** — different server (stream.fo), tests whether the approach generalizes
5. **Lindin last** — same server as FM98,7, similar non-music challenges to FM1, lowest music-per-hour ratio

---

## Architecture Notes

### What exists today
- `fetchers.ts` exports an array of `{ slug, fetchData }` objects
- `StationSlug` is a union type that must be extended per station
- `isLikelyAd.ts` has regex-based non-music detection
- Stations table is dynamic (auto-created on first play)
- Web UI picks up new stations automatically from DB
- Station badge colors need manual CSS addition

### What might need to change
- If we add Icecast status polling, multiple stations share one HTTP call (one status endpoint returns all mounts). Consider fetching once and distributing to multiple station fetchers.
- If we add ICY stream parsing, it's a fundamentally different pattern (persistent connection vs. polling). Might warrant a separate module.
- HTML parsing dependency (for SJEY) — keep it minimal. `node-html-parser` or regex.
- The 10-second poll interval works for SJEY's PHP endpoint and Icecast status. ICY parsing would be event-driven instead.

### No database schema changes needed
The existing schema handles new stations automatically. No migrations required.
