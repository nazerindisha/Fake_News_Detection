from trafilatura import fetch_url, extract

def extract_text_from_url(url: str) -> str:
    try:
        downloaded = fetch_url(url)
        if not downloaded:
            return None
        return extract(downloaded)
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    test_url = "https://www.bbc.com/news"
    print(f"Testing scraper with: {test_url}")
    text = extract_text_from_url(test_url)
    if text:
        print("\nExtracted text preview:")
        print(text[:300] + "...")
    else:
        print("Failed to extract text.")
