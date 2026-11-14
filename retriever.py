import os
import re
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib

try:
    from duckduckgo_search import DDGS
    DDGS_AVAILABLE = True
except ImportError:
    DDGS_AVAILABLE = False


def clean_query_text(text: str, max_words: int = 10) -> str:
    """
    Cleans and extracts key search terms from an input claim or article.
    Strips URLs, excessive punctuation, and extracts a concise search query.
    """
    if not text:
        return ""
    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    # Remove special control characters
    text = re.sub(r"[\r\n\t]+", " ", text)
    # Extract first line or main sentence
    sentences = re.split(r"[।\.\?\!\n]", text)
    first_sentence = sentences[0].strip() if sentences else text.strip()
    words = first_sentence.split()
    if len(words) > max_words:
        return " ".join(words[:max_words])
    return first_sentence if first_sentence else " ".join(text.split()[:max_words])


class ActualNewsRetriever:
    """
    Hybrid Bilingual News Retriever:
    1. Indexes verified historical datasets (English: True.csv, Bangla: Authentic-48K.csv).
    2. Uses TF-IDF cosine similarity for high-speed local candidate retrieval.
    3. Seamlessly falls back to real-time web search (DuckDuckGo) when local similarity is low.
    """

    def __init__(self, data_dir: str = None):
        print("Initializing Hybrid Bilingual Actual News Retriever...")
        self.data_dir = self._resolve_data_dir(data_dir)
        print(f"Dataset root directory: {self.data_dir}")

        self.true_df = None
        self.en_vectorizer = None
        self.en_vectors = None

        self.auth_df = None
        self.bn_vectorizer = None
        self.bn_vectors = None

        self._load_english_dataset()
        self._load_bangla_dataset()
        print("Hybrid Actual News Retriever initialization complete!")

    def _resolve_data_dir(self, custom_dir: str = None) -> str:
        """Finds the directory where CSV datasets reside."""
        candidates = [
            custom_dir,
            os.getenv("DATA_DIR"),
            os.path.join(os.path.dirname(__file__), "data"),
            os.path.dirname(__file__),
            r"D:\7th_Semester_Collections\Project\Fake_News_Detection"
        ]
        for path in candidates:
            if path and os.path.exists(path):
                # Check if at least one dataset exists here
                if os.path.exists(os.path.join(path, "True.csv")) or os.path.exists(os.path.join(path, "Authentic-48K.csv")):
                    return os.path.abspath(path)

        # Fallback to current directory or 'data' folder
        default_path = os.path.join(os.path.dirname(__file__), "data")
        return os.path.abspath(default_path if os.path.exists(default_path) else os.path.dirname(__file__))

    def _load_english_dataset(self):
        """Loads and vectorizes English verified real news (True.csv)."""
        true_path = os.path.join(self.data_dir, "True.csv")
        if not os.path.exists(true_path):
            print(f"Notice: English verified news dataset not found at '{true_path}'. Local English retrieval will be disabled.")
            return

        try:
            cache_path = os.path.join(self.data_dir, "en_retriever_cache.joblib")
            if os.path.exists(cache_path):
                print("Loading cached English TF-IDF index...")
                cache_data = joblib.load(cache_path)
                self.true_df = cache_data["df"]
                self.en_vectorizer = cache_data["vectorizer"]
                self.en_vectors = cache_data["vectors"]
                print(f"Loaded {len(self.true_df)} English real articles from cache.")
                return

            print("Indexing English real articles from True.csv...")
            self.true_df = pd.read_csv(true_path)
            self.true_df["content"] = self.true_df["title"].fillna("") + " " + self.true_df["text"].fillna("")
            self.en_vectorizer = TfidfVectorizer(stop_words="english", max_df=0.7, max_features=50000)
            self.en_vectors = self.en_vectorizer.fit_transform(self.true_df["content"])
            print(f"Successfully loaded and indexed {len(self.true_df)} English real articles.")

            # Attempt to cache for faster future startups
            try:
                joblib.dump({
                    "df": self.true_df[["title", "subject", "date", "text"]],
                    "vectorizer": self.en_vectorizer,
                    "vectors": self.en_vectors
                }, cache_path)
            except Exception:
                pass
        except Exception as e:
            print(f"Warning: Could not index English dataset: {e}")

    def _load_bangla_dataset(self):
        """Loads and vectorizes Bangla verified real news (Authentic-48K.csv)."""
        auth_path = os.path.join(self.data_dir, "Authentic-48K.csv")
        if not os.path.exists(auth_path):
            print(f"Notice: Bangla verified news dataset not found at '{auth_path}'. Local Bangla retrieval will be disabled.")
            return

        try:
            cache_path = os.path.join(self.data_dir, "bn_retriever_cache.joblib")
            if os.path.exists(cache_path):
                print("Loading cached Bangla TF-IDF index...")
                cache_data = joblib.load(cache_path)
                self.auth_df = cache_data["df"]
                self.bn_vectorizer = cache_data["vectorizer"]
                self.bn_vectors = cache_data["vectors"]
                print(f"Loaded {len(self.auth_df)} Bangla real articles from cache.")
                return

            print("Indexing Bangla real articles from Authentic-48K.csv...")
            self.auth_df = pd.read_csv(auth_path)
            title_col = "headline" if "headline" in self.auth_df.columns else "title"
            text_col = "content" if "content" in self.auth_df.columns else "text"

            self.auth_df["full_content"] = self.auth_df[title_col].fillna("") + " " + self.auth_df[text_col].fillna("")
            self.bn_vectorizer = TfidfVectorizer(token_pattern=r"[\u0980-\u09FF\w]+", max_df=0.8, max_features=50000)
            self.bn_vectors = self.bn_vectorizer.fit_transform(self.auth_df["full_content"])
            print(f"Successfully loaded and indexed {len(self.auth_df)} Bangla real articles.")

            try:
                save_cols = [c for c in [title_col, text_col, "category", "date"] if c in self.auth_df.columns]
                joblib.dump({
                    "df": self.auth_df[save_cols],
                    "vectorizer": self.bn_vectorizer,
                    "vectors": self.bn_vectors
                }, cache_path)
            except Exception:
                pass
        except Exception as e:
            print(f"Warning: Could not index Bangla dataset: {e}")

    def find_actual_news(self, text: str, language: str = "en", top_k: int = 1) -> list:
        """
        Finds matching authentic news.
        1. Checks local verified datasets using TF-IDF cosine similarity.
        2. If similarity is low or local dataset is unavailable, falls back to Live Web Search.
        """
        if not text:
            return []

        results = []
        max_sim = 0.0
        lang = (language or "en").lower().strip()

        # 1. Local English Retrieval
        if lang == "en" and self.en_vectorizer is not None and self.en_vectors is not None:
            try:
                query_vector = self.en_vectorizer.transform([text])
                similarities = cosine_similarity(query_vector, self.en_vectors).flatten()
                if len(similarities) > 0:
                    best_idx = similarities.argmax()
                    max_sim = float(similarities[best_idx])
                    if max_sim >= 0.20:
                        row = self.true_df.iloc[best_idx]
                        results.append({
                            "source_type": "local_historical",
                            "source_label": "Verified Local Database (True.csv)",
                            "title": str(row.get("title", "Historical News Record")),
                            "subject": str(row.get("subject", "General")),
                            "date": str(row.get("date", "Verified Archive")),
                            "similarity_score": round(max_sim, 4),
                            "snippet": str(row.get("text", ""))[:320] + "...",
                            "url": None
                        })
            except Exception as e:
                print(f"Local English retrieval error: {e}")

        # 2. Local Bangla Retrieval
        elif lang == "bn" and self.bn_vectorizer is not None and self.bn_vectors is not None:
            try:
                query_vector = self.bn_vectorizer.transform([text])
                similarities = cosine_similarity(query_vector, self.bn_vectors).flatten()
                if len(similarities) > 0:
                    best_idx = similarities.argmax()
                    max_sim = float(similarities[best_idx])
                    if max_sim >= 0.18:
                        row = self.auth_df.iloc[best_idx]
                        title_col = "headline" if "headline" in self.auth_df.columns else "title"
                        text_col = "content" if "content" in self.auth_df.columns else "text"
                        results.append({
                            "source_type": "local_historical",
                            "source_label": "Verified Local Database (Authentic-48K)",
                            "title": str(row.get(title_col, "সংবাদ রেকর্ড")),
                            "subject": str(row.get("category", "সাধারণ")),
                            "date": str(row.get("date", "সংরক্ষণাগার")),
                            "similarity_score": round(max_sim, 4),
                            "snippet": str(row.get(text_col, ""))[:320] + "...",
                            "url": None
                        })
            except Exception as e:
                print(f"Local Bangla retrieval error: {e}")

        # 3. Live Web Search Fallback (DuckDuckGo)
        if not results or max_sim < 0.25:
            if DDGS_AVAILABLE:
                try:
                    search_query = clean_query_text(text, max_words=10)
                    region = "bn-bd" if lang == "bn" else "wt-wt"
                    
                    with DDGS() as ddgs:
                        live_results = list(ddgs.text(search_query, max_results=max(top_k, 2), region=region))
                        for item in live_results:
                            body = item.get("body", "")
                            # Compute simple word overlap similarity score
                            query_words = set(search_query.lower().split())
                            body_words = set(body.lower().split())
                            overlap = len(query_words.intersection(body_words)) / max(len(query_words), 1)
                            score = round(min(0.5 + (overlap * 0.45), 0.95), 2)

                            results.append({
                                "source_type": "live_web_search",
                                "source_label": "Live Web Search (DuckDuckGo)",
                                "title": item.get("title", "Live Search Match"),
                                "subject": "Verified Web News",
                                "date": "Real-time Web",
                                "similarity_score": score,
                                "snippet": (body[:320] + "...") if len(body) > 320 else body,
                                "url": item.get("href", "")
                            })
                except Exception as e:
                    print(f"Live web search fallback notice: {e}")

        return results[:top_k]
