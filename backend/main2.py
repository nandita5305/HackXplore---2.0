"""
Internship Scraper — Buddy4Study + National Scholarship Portal (NSP)
=====================================================================
  • Buddy4Study  → Playwright scroll on /article/category/internship
                   + optional api.buddy4study.com probe
  • NSP          → requests-based scraper on scholarships.gov.in

Both sources are merged into one deduplicated CSV + JSON output.

─────────────────────────────────────────────────────────────────────
Install once:
  pip install playwright requests beautifulsoup4 lxml
  python -m playwright install chromium
─────────────────────────────────────────────────────────────────────
Run:
  python internship_scraper.py
─────────────────────────────────────────────────────────────────────
"""

import asyncio
import csv
import json
import time
import re
from pathlib import Path
from datetime import datetime

import requests
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, TimeoutError as PWTimeout

# ─────────────────────────────────────────────────────────────────────────────
#  CONFIG
# ─────────────────────────────────────────────────────────────────────────────

OUTPUT_DIR     = Path(__file__).parent
SCROLL_WAIT_MS = 3000   # ms between each scroll attempt
MAX_STALE      = 6      # stop after N rounds with no new cards
CHECKPOINT_N   = 20     # save every N new records

FIELDS = [
    "source", "name", "url", "provider", "deadline",
    "eligibility", "stipend", "duration", "location",
    "category", "status", "description", "image",
]

COMMON_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-IN,en;q=0.9",
}


def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


def save(records: list, csv_path: Path, json_path: Path, label: str = ""):
    """Write records to CSV and JSON atomically."""
    # Ensure every record has all fields
    full = [{f: r.get(f, "") for f in FIELDS} for r in records]

    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS, extrasaction="ignore")
        w.writeheader()
        w.writerows(full)

    json_path.write_text(
        json.dumps(full, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    log(f"  💾  {len(records)} records saved {label}")


# ═════════════════════════════════════════════════════════════════════════════
#  SOURCE 1 — BUDDY4STUDY  (Playwright scroll)
# ═════════════════════════════════════════════════════════════════════════════

B4S_BASE   = "https://www.buddy4study.com"
B4S_URL    = f"https://www.buddy4study.com/article/category/scholarship"
B4S_API    = "https://api.buddy4study.com"   # probe; may or may not respond

# JS that extracts card data from the DOM after scrolling
EXTRACT_JS_B4S = r"""
() => {
    function txt(el) { return el ? (el.innerText || el.textContent || '').trim() : ''; }
    function attr(el, a) { return el ? (el.getAttribute(a) || '').trim() : ''; }

    // Try multiple card selectors — site may change markup
    const sels = [
        'article',
        'div[class*="post-card"]',
        'div[class*="PostCard"]',
        'div[class*="blog-card"]',
        'div[class*="BlogCard"]',
        'div[class*="card"]',
        '.entry-summary',
        '.post',
    ];

    let cards = [];
    for (const s of sels) {
        const found = [...document.querySelectorAll(s)]
            .filter(el => el.querySelector('a[href*="/article/"]') || el.querySelector('h2,h3'));
        if (found.length > cards.length) cards = found;
    }

    // Fallback: grab all internship article links directly
    if (cards.length === 0) {
        const links = [...document.querySelectorAll('a[href*="/article/"][href*="scholarship"]')];
        return links.map(a => ({
            source:      'buddy4study',
            name:        txt(a) || a.href.split('/').pop().replace(/-/g,' '),
            url:         a.href,
            provider:    '',
            deadline:    '',
            eligibility: '',
            stipend:     '',
            duration:    '',
            location:    '',
            category:    'scholarship',
            status:      '',
            description: '',
            image:       '',
        }));
    }

    const results = [];
    const seen    = new Set();

    for (const card of cards) {
        try {
            const anchor  = card.querySelector('a[href*="/article/"]') || card.querySelector('a[href]');
            if (!anchor) continue;
            const url = anchor.href;
            if (!url || seen.has(url)) continue;
            seen.add(url);

            const titleEl = card.querySelector('h1,h2,h3,h4,[class*="title"],[class*="Title"]');
            const name    = txt(titleEl) || txt(anchor);

            const imgEl   = card.querySelector('img');
            const image   = imgEl
                ? (imgEl.dataset.src || imgEl.dataset.lazySrc || attr(imgEl,'src'))
                : '';

            // Extract meta snippets (date, excerpt etc.)
            const metaEl  = card.querySelector('time,[class*="date"],[class*="Date"]');
            const deadline= txt(metaEl);

            const excerptEl = card.querySelector('p,[class*="excerpt"],[class*="Excerpt"],[class*="desc"]');
            const description = txt(excerptEl).slice(0, 300);

            results.push({
                source:      'buddy4study',
                name:        name.trim(),
                url:         url.trim(),
                provider:    '',
                deadline:    deadline,
                eligibility: '',
                stipend:     '',
                duration:    '',
                location:    '',
                category:    'scholarship',
                status:      '',
                description: description,
                image:       image,
            });
        } catch (e) {}
    }
    return results;
}
"""

# JS to count visible cards
COUNT_JS_B4S = r"""
() => {
    const sels = ['article','div[class*="post-card"]','div[class*="card"]','.post'];
    let best = 0;
    for (const s of sels) {
        const n = document.querySelectorAll(s).length;
        if (n > best) best = n;
    }
    // Also count distinct /article/ links as a lower bound
    const links = new Set(
        [...document.querySelectorAll('a[href*="/article/"][href*="scholarship"]')].map(a=>a.href)
    );
    return Math.max(best, links.size);
}
"""


async def scrape_buddy4study(csv_path: Path, json_path: Path) -> list:
    log("=" * 65)
    log("BUDDY4STUDY — Playwright scroll scraper")
    log(f"  URL: {B4S_URL}")
    log("=" * 65)

    all_records: list = []
    seen_urls:   set  = set()

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage",
                  "--disable-blink-features=AutomationControlled"],
        )
        ctx = await browser.new_context(
            viewport={"width": 1400, "height": 900},
            user_agent=COMMON_HEADERS["User-Agent"],
            locale="en-IN",
        )
        page = await ctx.new_page()

        # Mask automation
        await page.add_init_script(
            "Object.defineProperty(navigator,'webdriver',{get:()=>undefined});"
        )

        log("  Navigating…")
        try:
            await page.goto(B4S_URL, wait_until="domcontentloaded", timeout=90_000)
        except PWTimeout:
            log("  ⚠️  Timeout on initial load — continuing anyway")

        await page.wait_for_timeout(5_000)

        # Dismiss consent / cookie banners
        for sel in [
            "button:has-text('Accept')",
            "button:has-text('OK')",
            "button:has-text('Got it')",
            "[aria-label='Close']",
            ".cookie-accept",
        ]:
            try:
                btn = page.locator(sel).first
                if await btn.is_visible(timeout=500):
                    await btn.click()
                    await page.wait_for_timeout(500)
            except Exception:
                pass

        # Wait for first content
        log("  Waiting for articles (up to 60 s)…")
        for _ in range(20):
            count = await page.evaluate(COUNT_JS_B4S)
            if count > 0:
                log(f"  ✅  First {count} articles found")
                break
            await page.wait_for_timeout(3_000)
        else:
            log("  ❌  No articles found — saving debug HTML")
            (OUTPUT_DIR / "debug_buddy4study.html").write_text(
                await page.content(), encoding="utf-8"
            )
            await browser.close()
            return all_records

        # ── Infinite-scroll loop ──────────────────────────────────────────────
        stale, prev, peak, round_n = 0, 0, 0, 0
        last_chk = 0

        try:
            while stale < MAX_STALE:
                round_n += 1
                cur = await page.evaluate(COUNT_JS_B4S)

                # Detect page resets (SPA navigation wiping the list)
                if peak > 10 and cur < peak * 0.4:
                    log(f"  ⚠️  Possible page reset ({peak}→{cur}). Extracting & stopping.")
                    break

                peak = max(peak, cur)

                if cur > prev:
                    log(f"  Round {round_n:3d} | ~{cur} items (+{cur - prev})")
                    stale = 0
                    prev  = cur
                else:
                    stale += 1
                    log(f"  Round {round_n:3d} | ~{cur} items (stale {stale}/{MAX_STALE})")

                # Checkpoint extract every CHECKPOINT_N new items
                if cur - last_chk >= CHECKPOINT_N or stale >= MAX_STALE - 1:
                    batch = await page.evaluate(EXTRACT_JS_B4S)
                    added = 0
                    for rec in (batch or []):
                        u = rec.get("url", "")
                        if u and u not in seen_urls:
                            seen_urls.add(u)
                            all_records.append(rec)
                            added += 1
                    if added:
                        last_chk = cur
                        save(all_records, csv_path, json_path,
                             f"(+{added} from buddy4study)")

                # Try "Load More" button first; fall back to scroll
                loaded_more = False
                for btn_sel in [
                    "button:has-text('Load More')",
                    "a:has-text('Load More')",
                    "button:has-text('More')",
                    ".load-more",
                    "[class*='LoadMore']",
                ]:
                    try:
                        btn = page.locator(btn_sel).first
                        if await btn.is_visible(timeout=400):
                            await btn.click()
                            await page.wait_for_timeout(2_500)
                            loaded_more = True
                            break
                    except Exception:
                        pass

                if not loaded_more:
                    # Smooth scroll to bottom
                    await page.evaluate("""
                        window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
                        document.querySelectorAll('main,[role=main],[class*=scroll],[class*=Scroll]')
                            .forEach(el => el.scrollTo({top: el.scrollHeight, behavior: 'smooth'}));
                    """)
                    await page.wait_for_timeout(SCROLL_WAIT_MS)

        except Exception as exc:
            log(f"  Scroll error: {exc}")

        # Final extract
        batch = await page.evaluate(EXTRACT_JS_B4S)
        for rec in (batch or []):
            u = rec.get("url", "")
            if u and u not in seen_urls:
                seen_urls.add(u)
                all_records.append(rec)

        await browser.close()

    log(f"  Buddy4Study done: {len(all_records)} scholarship articles collected")
    return all_records


# ─────────────────────────────────────────────────────────────────────────────
#  Detail enrichment — Buddy4Study article pages
#  (Optional: parse each article page for stipend / deadline / eligibility)
# ─────────────────────────────────────────────────────────────────────────────

DETAIL_PATTERNS = {
    "stipend":     re.compile(
        r'(stipend|fellowship|award|grant)[^\n₹₨]*(?:₹|INR|Rs\.?)\s*[\d,]+', re.I),
    "deadline":    re.compile(
        r'(last\s*date|deadline|apply\s*by)[^\n:]*:\s*([^\n<]{5,40})', re.I),
    "duration":    re.compile(
        r'(\d+[\–\-to ]+\d+)\s*(weeks?|months?|days?)', re.I),
    "eligibility": re.compile(
        r'(eligib[^\n:]*:[^\n]{10,200})', re.I),
}


def enrich_from_article(rec: dict) -> dict:
    """Fetch individual Buddy4Study article and extract structured fields."""
    try:
        r = requests.get(
            rec["url"], headers=COMMON_HEADERS, timeout=15, allow_redirects=True
        )
        if r.status_code != 200:
            return rec
        soup = BeautifulSoup(r.text, "lxml")

        # Full visible text (strip scripts/styles)
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        text = soup.get_text(" ", strip=True)

        for field, pat in DETAIL_PATTERNS.items():
            if not rec.get(field):
                m = pat.search(text)
                if m:
                    rec[field] = m.group(0).strip()[:200]

        # Provider: look for "by <org>" or the first <strong> in article body
        if not rec.get("provider"):
            m = re.search(r'\bby\s+([A-Z][^\n,\.]{3,50})', text)
            if m:
                rec["provider"] = m.group(1).strip()

        # Location
        if not rec.get("location"):
            m = re.search(r'(location|city|place)\s*[:\–]\s*([^\n,\.]{3,60})', text, re.I)
            if m:
                rec["location"] = m.group(2).strip()

        # Better description from article intro
        article_body = soup.find("div", {"class": re.compile(r"entry-content|post-content|article-body", re.I)})
        if article_body:
            paras = article_body.find_all("p", limit=3)
            rec["description"] = " ".join(p.get_text(" ", strip=True) for p in paras)[:400]

    except Exception as exc:
        log(f"    ⚠️  enrich failed for {rec.get('url','')} — {exc}")

    return rec


def enrich_buddy4study(records: list, max_pages: int = 80) -> list:
    """Enrich up to max_pages article records with parsed details."""
    log(f"  Enriching {min(len(records), max_pages)} Buddy4Study article pages…")
    for i, rec in enumerate(records[:max_pages]):
        if i % 10 == 0:
            log(f"    {i}/{min(len(records), max_pages)}")
        records[i] = enrich_from_article(rec)
        time.sleep(0.4)   # polite delay
    return records


# ═════════════════════════════════════════════════════════════════════════════
#  SOURCE 2 — NATIONAL SCHOLARSHIP PORTAL  (requests + BeautifulSoup)
# ═════════════════════════════════════════════════════════════════════════════

NSP_BASE      = "https://scholarships.gov.in"
NSP_LIST_URL  = f"{NSP_BASE}/SchemeList.action"   # public scheme listing
NSP_SEARCH    = f"{NSP_BASE}/SchemeSearch.action"  # search endpoint

NSP_HEADERS   = {**COMMON_HEADERS, "Referer": NSP_BASE + "/"}


def nsp_get(url: str, params: dict = None, data: dict = None) -> requests.Response | None:
    try:
        if data:
            r = requests.post(url, headers=NSP_HEADERS, data=data,
                              params=params, timeout=30, verify=False)
        else:
            r = requests.get(url, headers=NSP_HEADERS,
                             params=params, timeout=30, verify=False)
        return r if r.status_code == 200 else None
    except Exception as exc:
        log(f"    NSP request error: {exc}")
        return None


def parse_nsp_scheme_list(html: str) -> list:
    """Parse the NSP scheme table / list and return raw records."""
    soup = BeautifulSoup(html, "lxml")
    records = []

    # NSP uses a table with class 'table' or similar
    rows = soup.select("table tr") or soup.select(".scheme-list li") or []

    for row in rows:
        cells = row.find_all(["td", "th"])
        if len(cells) < 2:
            continue
        name_cell  = cells[0]
        link       = name_cell.find("a")
        name       = link.get_text(strip=True) if link else name_cell.get_text(strip=True)
        href       = link["href"] if (link and link.get("href")) else ""
        full_url   = (NSP_BASE + "/" + href.lstrip("/")) if href and not href.startswith("http") else href

        provider   = cells[1].get_text(strip=True) if len(cells) > 1 else ""
        status     = cells[2].get_text(strip=True) if len(cells) > 2 else ""
        deadline   = cells[3].get_text(strip=True) if len(cells) > 3 else ""

        if not name or name.lower() in {"scheme name", "s.no", "#", "sl.no"}:
            continue

        records.append({
            "source":      "nsp",
            "name":        name,
            "url":         full_url,
            "provider":    provider,
            "deadline":    deadline,
            "eligibility": "",
            "stipend":     "",
            "duration":    "",
            "location":    "India",
            "category":    _classify_nsp(name),
            "status":      status,
            "description": "",
            "image":       "",
        })

    # Fallback: card-style layout
    if not records:
        cards = soup.select(".scheme-card, [class*='scheme'], [class*='Scheme'], .card")
        for card in cards:
            link = card.find("a")
            name = card.find(["h3", "h4", "h5", "strong"])
            if not name:
                continue
            href     = link["href"] if (link and link.get("href")) else ""
            full_url = (NSP_BASE + "/" + href.lstrip("/")) if href and not href.startswith("http") else href
            records.append({
                "source":      "nsp",
                "name":        name.get_text(strip=True),
                "url":         full_url,
                "provider":    "",
                "deadline":    "",
                "eligibility": "",
                "stipend":     "",
                "duration":    "",
                "location":    "India",
                "category":    _classify_nsp(name.get_text(strip=True)),
                "status":      "",
                "description": card.get_text(" ", strip=True)[:300],
                "image":       "",
            })

    return records


def _classify_nsp(name: str) -> str:
    """Classify a scheme as internship / scholarship / fellowship / other."""
    n = name.lower()
    if any(k in n for k in ["intern", "trainee", "training"]):
        return "internship"
    if any(k in n for k in ["fellowship", "fellow"]):
        return "fellowship"
    if any(k in n for k in ["scholarship", "scholar", "award", "merit"]):
        return "scholarship"
    return "other"


def scrape_nsp() -> list:
    log("=" * 65)
    log("NATIONAL SCHOLARSHIP PORTAL — requests + BeautifulSoup")
    log(f"  Base URL: {NSP_BASE}")
    log("=" * 65)

    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    all_records = {}

    # ── Approach 1: Listing pages
    listing_urls = [
        f"{NSP_BASE}/SchemeList.action",
        f"{NSP_BASE}/SchemeList.action?schemeType=Central",
        f"{NSP_BASE}/SchemeList.action?schemeType=State",
        f"{NSP_BASE}/fresh-application",
        f"{NSP_BASE}/search",
    ]

    for url in listing_urls:
        log(f"  Fetching: {url}")
        resp = nsp_get(url)
        if not resp:
            log("    → no response / non-200, skipping")
            continue

        batch = parse_nsp_scheme_list(resp.text)

        for rec in batch:
            key = rec["url"] or rec["name"]
            if key and key not in all_records:
                all_records[key] = rec

        log(f"    → {len(batch)} schemes parsed (total {len(all_records)})")
        time.sleep(1)

    # ── Approach 2: Search keywords (NOW WILL RUN)
    for keyword in ["scholarship", "scholar", "merit", "grant"]:
        log(f"  Searching NSP for keyword='{keyword}'…")

        resp = nsp_get(
            NSP_SEARCH,
            data={"searchKeyword": keyword, "schemeType": "All"},
        )

        if not resp:
            resp = nsp_get(NSP_SEARCH, params={"q": keyword})

        if resp:
            batch = parse_nsp_scheme_list(resp.text)
            new = 0

            for rec in batch:
                key = rec["url"] or rec["name"]
                if key and key not in all_records:
                    all_records[key] = rec
                    new += 1

            log(f"    → {new} new schemes found (total {len(all_records)})")

        time.sleep(1)

    # ✅ FINAL RETURN HERE
    result = list(all_records.values())
    log(f"  NSP done: {len(result)} total records")
    return result

    # ── Approach 2: Search for "internship" specifically ───────────────────
    # for keyword in ["scholarship", "scholar", "merit", "grant"]:
    #     log(f"  Searching NSP for keyword='{keyword}'…")
    #     resp = nsp_get(
    #         NSP_SEARCH,
    #         data={"searchKeyword": keyword, "schemeType": "All"},
    #     )
    #     if not resp:
    #         # Try GET
    #         resp = nsp_get(NSP_SEARCH, params={"q": keyword})
    #     if resp:
    #         batch = parse_nsp_scheme_list(resp.text)
    #         new = 0
    #         for rec in batch:
    #             key = rec["url"] or rec["name"]
    #             if key and key not in all_records:
    #                 all_records[key] = rec
    #                 new += 1
    #         log(f"    → {new} new schemes found (total {len(all_records)})")
    #     time.sleep(1)

    

# ─────────────────────────────────────────────────────────────────────────────
#  NSP detail enrichment
# ─────────────────────────────────────────────────────────────────────────────

def enrich_nsp_record(rec: dict) -> dict:
    """Fetch individual NSP scheme page for more details."""
    url = rec.get("url", "")
    if not url or "gov.in" not in url:
        return rec
    try:
        import urllib3
        urllib3.disable_warnings()
        r = requests.get(url, headers=NSP_HEADERS, timeout=15, verify=False)
        if r.status_code != 200:
            return rec
        soup = BeautifulSoup(r.text, "lxml")
        for tag in soup(["script", "style"]):
            tag.decompose()
        text = soup.get_text(" ", strip=True)

        for field, pat in DETAIL_PATTERNS.items():
            if not rec.get(field):
                m = pat.search(text)
                if m:
                    rec[field] = m.group(0).strip()[:200]
    except Exception:
        pass
    return rec


def enrich_nsp(records: list, max_pages: int = 40) -> list:
    log(f"  Enriching up to {max_pages} NSP detail pages…")
    for i, rec in enumerate(records[:max_pages]):
        if i % 10 == 0:
            log(f"    {i}/{min(len(records), max_pages)}")
        records[i] = enrich_nsp_record(rec)
        time.sleep(0.5)
    return records


# ═════════════════════════════════════════════════════════════════════════════
#  MAIN
# ═════════════════════════════════════════════════════════════════════════════

async def main():
    csv_path  = OUTPUT_DIR / "internships.csv"
    json_path = OUTPUT_DIR / "internships.json"

    all_records: list = []

    # ✅ Load existing data
    if json_path.exists():
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                all_records = json.load(f)
        except:
            all_records = []

    # ── Step 1: NSP ─────────────────
    try:
        nsp_records = scrape_nsp()

        intern_nsp = [r for r in nsp_records if r["category"] == "internship"]
        other_nsp  = [r for r in nsp_records if r["category"] != "internship"]

        intern_nsp = enrich_nsp(intern_nsp, max_pages=30)

        existing_urls = {r["url"] for r in all_records}

        new_nsp = [
            r for r in (intern_nsp + other_nsp)
            if r["url"] not in existing_urls
        ]

        all_records.extend(new_nsp)
        save(all_records, csv_path, json_path, "(after NSP)")

    except Exception as exc:
        log(f"NSP scraper error: {exc}")

    # ── Step 2: Buddy4Study ─────────────────
    try:
        b4s_records = await scrape_buddy4study(csv_path, json_path)

        existing_urls = {r["url"] for r in all_records}

        new_b4s = [
            r for r in b4s_records
            if r["url"] not in existing_urls
        ]

        all_records.extend(new_b4s)
        save(all_records, csv_path, json_path, "(after Buddy4Study)")

    except Exception as exc:
        log(f"Buddy4Study scraper error: {exc}")

    # ── Final save ──────────────────────────────────────────────────────────
    save(all_records, csv_path, json_path, "(FINAL)")

    nsp_n = sum(1 for r in all_records if r["source"] == "nsp")
    b4s_n = sum(1 for r in all_records if r["source"] == "buddy4study")
    intern_n = sum(1 for r in all_records if r["category"] == "internship")

    log("")
    log("╔══════════════════════════════════════════════════════════╗")
    log(f"║  ✅  DONE!  {len(all_records)} total records")
    log(f"║     NSP          : {nsp_n}")
    log(f"║     Buddy4Study  : {b4s_n}")
    log(f"║     Internships  : {intern_n}")
    log(f"║  CSV  → {csv_path.name}")
    log(f"║  JSON → {json_path.name}")
    log("╚══════════════════════════════════════════════════════════╝")


if __name__ == "__main__":
    asyncio.run(main())