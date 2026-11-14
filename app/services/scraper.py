from typing import Dict, Any, Optional
from app.core.security import is_safe_url

try:
    from trafilatura import fetch_url, extract, extract_metadata
    TRAFILATURA_AVAILABLE = True
except ImportError:
    TRAFILATURA_AVAILABLE = False

class ScraperService:
    """
    Production Web Scraper Service for news article extraction.
    Ensures safe, sanitised, and structured body text and metadata parsing.
    """

    @staticmethod
    def scrape_article(url: str) -> Dict[str, Any]:
        """
        Extracts news article text and metadata from a given URL.
        Guards against SSRF and unsupported protocols.
        """
        if not TRAFILATURA_AVAILABLE:
            return {
                "success": False,
                "content": "",
                "title": "",
                "author": "",
                "date": "",
                "url": url or "",
                "error": "Trafilatura package is not installed. Run 'pip install -r requirements.txt'."
            }

        if not url:
            return {
                "success": False,
                "content": "",
                "title": "",
                "author": "",
                "date": "",
                "url": "",
                "error": "URL cannot be empty."
            }

        clean_url = url.strip()
        if not is_safe_url(clean_url):
            return {
                "success": False,
                "content": "",
                "title": "",
                "author": "",
                "date": "",
                "url": clean_url,
                "error": "Access blocked: Only public HTTP/HTTPS URLs are allowed."
            }

        try:
            downloaded = fetch_url(clean_url)
            if not downloaded:
                return {
                    "success": False,
                    "content": "",
                    "title": "",
                    "author": "",
                    "date": "",
                    "url": clean_url,
                    "error": "Could not download webpage. Destination server unreachable or blocked."
                }

            content = extract(
                downloaded,
                include_comments=False,
                include_tables=False,
                no_fallback=False
            )

            if not content:
                return {
                    "success": False,
                    "content": "",
                    "title": "",
                    "author": "",
                    "date": "",
                    "url": clean_url,
                    "error": "Webpage reached, but no readable article text could be extracted."
                }

            title = ""
            author = ""
            date = ""
            try:
                meta = extract_metadata(downloaded)
                if meta:
                    title = meta.title or ""
                    author = meta.author or ""
                    date = meta.date or ""
            except Exception:
                pass

            return {
                "success": True,
                "content": content.strip(),
                "title": title.strip(),
                "author": author.strip(),
                "date": str(date).strip(),
                "url": clean_url,
                "error": None
            }

        except Exception as e:
            return {
                "success": False,
                "content": "",
                "title": "",
                "author": "",
                "date": "",
                "url": clean_url,
                "error": f"Scraping error: {str(e)}"
            }

def extract_text_from_url(url: str) -> Dict[str, Any]:
    return ScraperService.scrape_article(url)
