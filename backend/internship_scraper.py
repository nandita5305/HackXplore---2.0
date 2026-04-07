import asyncio
import json
from playwright.async_api import async_playwright

async def scrape_internshala(page):
    """Scrape internships from Internshala"""
    print("\nNavigating to Internshala...")
    
    await page.goto("https://internshala.com/internships/it-internships", wait_until="domcontentloaded", timeout=45000)
    await asyncio.sleep(2)

    # Close popup if it appears
    try:
        close_btn = page.locator("#close_popup, .ic-24-cross, .close_registration_popup").first
        if await close_btn.is_visible(timeout=3000):
            await close_btn.click()
            print(" ➔ Popup closed.")
    except:
        pass

    internships = []

    for page_num in range(2):
        print(f" ➔ Scraping page {page_num + 1}...")

        try:
            # Wait for the newly confirmed card class
            await page.wait_for_selector(".individual_internship", timeout=15000)
        except Exception as e:
            print(" ➔ Timed out waiting for cards.")
            break

        # UPDATED EXTRACTION LOGIC MATCHING YOUR HTML
        items = await page.eval_on_selector_all(
            ".individual_internship",
            """els => els.map(e => {
                const titleEl = e.querySelector('.job-internship-name a');
                const title = titleEl?.innerText?.trim() || '';
                const link = titleEl?.href || '';
                
                const company = e.querySelector('.company-name')?.innerText?.trim() || '';
                const location = e.querySelector('.locations a')?.innerText?.trim() || 'Remote';
                const stipend = e.querySelector('.stipend')?.innerText?.trim() || 'Unpaid/Details inside';
                
                if (title && link) {
                    return { title, company, location, stipend, link };
                }
                return null;
            }).filter(x => x)"""
        )

        internships.extend(items)
        print(f" ➔ Found {len(items)} items on this page")

        # Pagination
        try:
            next_btn = page.locator("#next, a[rel='next'], .next_page").first
            if await next_btn.is_visible():
                await next_btn.click()
                await page.wait_for_load_state("domcontentloaded")
                await asyncio.sleep(2)
            else:
                break
        except:
            break

    return [{"source": "internshala", **item} for item in internships]

async def scrape_unstop(page):
    """Scrape internships from Unstop - Keyboard Emulation Bypass"""
    print("\nNavigating to Unstop...")
    
    await page.goto("https://unstop.com/internships", wait_until="domcontentloaded", timeout=60000)
    
    try:
        await page.wait_for_selector("app-competition-listing .item", timeout=20000)
    except Exception:
        print(" ➔ Timed out waiting for Unstop cards.")
        return []

    scraped_data = {}
    print(" ➔ Executing Physical Keyboard Scroll (Aiming for 100+)...")
    
    for i in range(40):
        # 1. SCOOP: Extract currently visible data
        current_batch = await page.eval_on_selector_all(
            "app-competition-listing a.item",
            """els => els.map(e => {
                const title = e.querySelector('h2.double-wrap, h3.double-wrap')?.innerText?.trim() || '';
                const company = e.querySelector('p.single-wrap')?.innerText?.trim() || '';
                const link = e.href || '';
                const location = e.querySelector('.job_location')?.innerText?.trim() || 'Online';
                
                const stipendNodes = e.querySelectorAll('.cash_widget strong');
                let stipend = "Check Details";
                if (stipendNodes.length > 0) {
                    stipend = Array.from(stipendNodes).map(node => node.innerText.trim()).join(' ');
                }
                
                if (title && title.length > 3) {
                    return { title, company, location, stipend, link };
                }
                return null;
            }).filter(x => x)"""
        )

        for item in current_batch:
            scraped_data[item['link']] = {"source": "unstop", **item}

        if len(scraped_data) >= 100:
            print(" ➔ Goal reached! 100+ items collected.")
            break

        # 2. SCROLL: Physical Device Emulation
        try:
            # Locate the very last card currently loaded on the screen
            last_card = page.locator("app-competition-listing a.item").last
            
            if await last_card.is_visible():
                # Physically move the virtual mouse over this specific card
                await last_card.hover()
                
                # Simulate a human pressing the "Page Down" key 3 times
                await page.keyboard.press("PageDown")
                await page.keyboard.press("PageDown")
                await page.keyboard.press("PageDown")
                
            # Wait for Unstop's servers to send the next batch of cards
            await asyncio.sleep(2.5)
            
        except Exception as e:
            print(f" ➔ End of list or scroll error: {e}")
            break

        if i % 3 == 0:
            print(f" ➔ Scroll {i}/40 | Unique items collected so far: {len(scraped_data)}")

    final_list = list(scraped_data.values())
    print(f" ➔ Unstop Scrape Complete! Total unique items: {len(final_list)}")
    return final_list

async def run_scraper():
    async with async_playwright() as p:
        # Launch with stealth arguments
        browser = await p.chromium.launch(
            headless=False, 
            args=[
                "--disable-blink-features=AutomationControlled",
                "--start-maximized"
            ]
        )
        
        # Use a realistic User-Agent
        context = await browser.new_context(
            no_viewport=True,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
        
        # Hide the webdriver property via init script
        await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        page = await context.new_page()

        all_internships = []

        # 1. Internshala
        i_data = await scrape_internshala(page)
        all_internships.extend(i_data)

        # 2. Unstop
        u_data = await scrape_unstop(page)
        all_internships.extend(u_data)

        await browser.close()

        # Deduplication Step (Catch-all)
        seen_urls = set()
        final_data = []
        for item in all_internships:
            url = item.get('link')
            if url and url not in seen_urls:
                seen_urls.add(url)
                final_data.append(item)

        # Save to database file
        if final_data:
            with open("hackxplore_db.json", "w", encoding="utf-8") as f:
                json.dump(final_data, f, indent=2, ensure_ascii=False)
            
            print("\n" + "="*50)
            print(f"✅ SUCCESS! Updated hackxplore_db.json")
            print(f"Total Unique Listings: {len(final_data)}")
            print("="*50)
        else:
            print("\n❌ No data was captured. Check network connection or debug HTML files.")

if __name__ == "__main__":
    asyncio.run(run_scraper())