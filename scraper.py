import re
from urllib.parse import urlparse
import ipaddress
import socket
from trafilatura import fetch_url, extract, extract_metadata

# List of blocked local and private host patterns for SSRF prevention
BLOCKED_HOSTNAMES = {"localhost", "127.0.0.1", "0.0.0.0", "::1"}

def is_safe_url(url: str) -> bool:
    """
    Validates the URL to protect against SSRF (Server-Side Request Forgery).
    Only allows public http and https URLs.
    """
    try:
        parsed = urlparse(url.strip())
        if parsed.scheme not in ("http", "https"):
            return False
        
        hostname = parsed.hostname
        if not hostname:
            return False
            
        hostname_lower = hostname.lower()
        if hostname_lower in BLOCKED_HOSTNAMES:
            return False
            
        # Check if the hostname resolves to a private or loopback IP
        try:
            ip = ipaddress.ip_address(hostname)
            if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local:
                return False
        except ValueError:
            # Hostname is a domain name, resolve IP safely
            try:
                resolved_ip = socket.gethostbyname(hostname)
                ip = ipaddress.ip_address(resolved_ip)
                if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local:
                    return False
            except Exception:
                # If resolution fails, proceed with caution or reject
                pass
                
        return True
    except Exception:
        return False

def extract_text_from_url(url: str) -> dict:
    """
    Extracts text and metadata from a news URL.
    Returns a dictionary:
    {
        "content": str,
        "title": str,
        "author": str,
        "date": str,
        "url": str,
        "status": "success" | "error",
        "error": str | None
    }
    """
    if not url:
        return {
            "content": "",
            "title": "",
            "url": "",
            "status": "error",
            "error": "URL cannot be empty."
        }
        
    url = url.strip()
    if not is_safe_url(url):
        return {
            "content": "",
            "title": "",
            "url": url,
            "status": "error",
            "error": "Invalid or disallowed URL. Only public http/https URLs are permitted."
        }

    try:
        downloaded = fetch_url(url)
        if not downloaded:
            return {
                "content": "",
                "title": "",
                "url": url,
                "status": "error",
                "error": "Failed to download webpage. The site may be blocking crawlers or unreachable."
            }

        # Extract main text content
        content = extract(
            downloaded,
            include_comments=False,
            include_tables=False,
            no_fallback=False
        )
        
        if not content:
            return {
                "content": "",
                "title": "",
                "url": url,
                "status": "error",
                "error": "Could not extract article content from the webpage."
            }

        # Extract metadata (title, author, date)
        title = ""
        author = ""
        date = ""
        try:
            metadata = extract_metadata(downloaded)
            if metadata:
                title = metadata.title or ""
                author = metadata.author or ""
                date = metadata.date or ""
        except Exception:
            pass

        return {
            "content": content,
            "title": title,
            "author": author,
            "date": date,
            "url": url,
            "status": "success",
            "error": None
        }

    except Exception as e:
        return {
            "content": "",
            "title": "",
            "url": url,
            "status": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    test_url = "https://www.bbc.com/news"
    print(f"Testing scraper with: {test_url}")
    result = extract_text_from_url(test_url)
    print("Status:", result["status"])
    if result["status"] == "success":
        print(f"Title: {result['title']}")
        print(f"Content preview: {result['content'][:250]}...")
    else:
        print(f"Error: {result['error']}")
