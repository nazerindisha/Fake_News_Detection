"""
Scraper Module Entrypoint
Re-exports ScraperService from app.services.scraper.
"""
from app.services.scraper import ScraperService, extract_text_from_url

__all__ = ["ScraperService", "extract_text_from_url"]

if __name__ == "__main__":
    test_url = "https://www.bbc.com/news"
    print(f"Testing ScraperService with: {test_url}")
    result = ScraperService.scrape_article(test_url)
    print("Status:", "Success" if result["success"] else "Failed")
    if result["success"]:
        print("Title:", result["title"])
        print("Content preview:", result["content"][:200] + "...")
    else:
        print("Error:", result["error"])
