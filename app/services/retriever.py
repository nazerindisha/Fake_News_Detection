import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional

from app.core.config import settings

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    pd = None
    PANDAS_AVAILABLE = False

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    TfidfVectorizer = None
    cosine_similarity = None
    SKLEARN_AVAILABLE = False

try:
    import joblib
    JOBLIB_AVAILABLE = True
except ImportError:
    joblib = None
    JOBLIB_AVAILABLE = False

try:
    from duckduckgo_search import DDGS
    DDGS_AVAILABLE = True
except ImportError:
    DDGS_AVAILABLE = False


def extract_search_terms(text: str, max_words: int = 10) -> str:
    """Extracts a concise, clean query suitable for search engines."""
    if not text:
        return ""
    clean = re.sub(r"https?://\S+|www\.\S+", "", text)
    clean = re.sub(r"[\r\n\t]+", " ", clean)
    sentences = re.split(r"[।\.\?\!\n]", clean)
    first_sentence = sentences[0].strip() if sentences else clean.strip()
    words = first_sentence.split()
    if len(words) > max_words:
        return " ".join(words[:max_words])
    return first_sentence if first_sentence else " ".join(clean.split()[:max_words])


class RetrieverService:
    """
    Production Hybrid Ground-Truth Retriever:
    1. Indexes verified local datasets (True.csv & Authentic-48K.csv) with TF-IDF.
    2. Caches vectorized matrices for near-instantaneous startup.
    3. Seamlessly falls back to regional live web search via DuckDuckGo.
    """

    def __init__(self):
        self.data_dir = settings.DATA_DIR
        self.true_df = None
        self.en_vectorizer = None
        self.en_vectors = None

        self.auth_df = None
        self.bn_vectorizer = None
        self.bn_vectors = None

        if PANDAS_AVAILABLE and SKLEARN_AVAILABLE and JOBLIB_AVAILABLE:
            self._initialize_english_index()
            self._initialize_bangla_index()

    def _initialize_english_index(self):
        """Indexes English verified articles from True.csv."""
        true_path = settings.EN_TRUE_CSV
        if not true_path.exists():
            legacy = settings.DATA_DIR.parent / "True.csv"
            if legacy.exists():
                true_path = legacy
            else:
                return

        try:
            cache_path = self.data_dir / "en_retriever_cache.joblib"
            if cache_path.exists():
                cached = joblib.load(cache_path)
                self.true_df = cached["df"]
                self.en_vectorizer = cached["vectorizer"]
                self.en_vectors = cached["vectors"]
                print(f"✅ Loaded {len(self.true_df)} cached English verified articles.")
                return

            print("Indexing English verified records from True.csv...")
            df = pd.read_csv(true_path)
            df["content"] = df["title"].fillna("") + " " + df["text"].fillna("")
            vectorizer = TfidfVectorizer(stop_words="english", max_df=0.7, max_features=50000)
            vectors = vectorizer.fit_transform(df["content"])

            self.true_df = df[["title", "subject", "date", "text"]].copy()
            self.en_vectorizer = vectorizer
            self.en_vectors = vectors
            print(f"✅ Indexed {len(self.true_df)} English verified articles.")

            try:
                joblib.dump({"df": self.true_df, "vectorizer": vectorizer, "vectors": vectors}, cache_path)
            except Exception:
                pass
        except Exception as e:
            print(f"⚠️ Notice: English indexer initialization bypassed: {e}")

    def _initialize_bangla_index(self):
        """Indexes Bangla verified articles from Authentic-48K.csv."""
        auth_path = settings.BN_AUTHENTIC_CSV
        if not auth_path.exists():
            legacy = settings.DATA_DIR.parent / "Authentic-48K.csv"
            if legacy.exists():
                auth_path = legacy
            else:
                return

        try:
            cache_path = self.data_dir / "bn_retriever_cache.joblib"
            if cache_path.exists():
                cached = joblib.load(cache_path)
                self.auth_df = cached["df"]
                self.bn_vectorizer = cached["vectorizer"]
                self.bn_vectors = cached["vectors"]
                print(f"✅ Loaded {len(self.auth_df)} cached Bangla verified articles.")
                return

            print("Indexing Bangla verified records from Authentic-48K.csv...")
            df = pd.read_csv(auth_path)
            title_col = "headline" if "headline" in df.columns else "title"
            text_col = "content" if "content" in df.columns else "text"

            df["full_content"] = df[title_col].fillna("") + " " + df[text_col].fillna("")
            vectorizer = TfidfVectorizer(token_pattern=r"[\u0980-\u09FF\w]+", max_df=0.8, max_features=50000)
            vectors = vectorizer.fit_transform(df["full_content"])

            save_cols = [c for c in [title_col, text_col, "category", "date"] if c in df.columns]
            self.auth_df = df[save_cols].copy()
            self.bn_vectorizer = vectorizer
            self.bn_vectors = vectors
            print(f"✅ Indexed {len(self.auth_df)} Bangla verified articles.")

            try:
                joblib.dump({"df": self.auth_df, "vectorizer": vectorizer, "vectors": vectors}, cache_path)
            except Exception:
                pass
        except Exception as e:
            print(f"⚠️ Notice: Bangla indexer initialization bypassed: {e}")

    @property
    def is_english_indexed(self) -> bool:
        return self.en_vectorizer is not None and self.en_vectors is not None

    @property
    def is_bangla_indexed(self) -> bool:
        return self.bn_vectorizer is not None and self.bn_vectors is not None

    def find_matches(self, text: str, language: str = "en", top_k: int = 2) -> List[Dict[str, Any]]:
        """
        Retrieves matching authentic news:
        1. Queries local verified vector spaces.
        2. Dispatches live web queries if local similarity is under threshold.
        """
        if not text:
            return []

        results: List[Dict[str, Any]] = []
        max_sim = 0.0
        lang = (language or "en").lower().strip()

        # 1. Local English Search
        if lang == "en" and self.is_english_indexed:
            try:
                query_vec = self.en_vectorizer.transform([text])
                sims = cosine_similarity(query_vec, self.en_vectors).flatten()
                if len(sims) > 0:
                    best_idx = sims.argmax()
                    max_sim = float(sims[best_idx])
                    if max_sim >= settings.EN_SIMILARITY_THRESHOLD:
                        row = self.true_df.iloc[best_idx]
                        results.append({
                            "source_type": "local_historical",
                            "source_label": "Verified Archive (True.csv)",
                            "title": str(row.get("title", "Verified Report")),
                            "subject": str(row.get("subject", "General")),
                            "date": str(row.get("date", "Historical Archive")),
                            "similarity_score": round(max_sim, 4),
                            "snippet": str(row.get("text", ""))[:320] + "...",
                            "url": None
                        })
            except Exception as e:
                print(f"English local retrieval error: {e}")

        # 2. Local Bangla Search
        elif lang == "bn" and self.is_bangla_indexed:
            try:
                query_vec = self.bn_vectorizer.transform([text])
                sims = cosine_similarity(query_vec, self.bn_vectors).flatten()
                if len(sims) > 0:
                    best_idx = sims.argmax()
                    max_sim = float(sims[best_idx])
                    if max_sim >= settings.BN_SIMILARITY_THRESHOLD:
                        row = self.auth_df.iloc[best_idx]
                        title_col = "headline" if "headline" in self.auth_df.columns else "title"
                        text_col = "content" if "content" in self.auth_df.columns else "text"
                        results.append({
                            "source_type": "local_historical",
                            "source_label": "Verified Archive (Authentic-48K)",
                            "title": str(row.get(title_col, "সত্য সংবাদ রেকর্ড")),
                            "subject": str(row.get("category", "সাধারণ")),
                            "date": str(row.get("date", "ঐতিহাসিক রেকর্ড")),
                            "similarity_score": round(max_sim, 4),
                            "snippet": str(row.get(text_col, ""))[:320] + "...",
                            "url": None
                        })
            except Exception as e:
                print(f"Bangla local retrieval error: {e}")

        # 3. Live Web Search Fallback (DuckDuckGo)
        if not results or max_sim < settings.LIVE_SEARCH_FALLBACK_THRESHOLD:
            if DDGS_AVAILABLE:
                try:
                    search_query = extract_search_terms(text, max_words=10)
                    region = "bn-bd" if lang == "bn" else "wt-wt"

                    with DDGS() as ddgs:
                        live_items = list(ddgs.text(search_query, max_results=top_k, region=region))
                        for item in live_items:
                            body = item.get("body", "")
                            q_words = set(search_query.lower().split())
                            b_words = set(body.lower().split())
                            overlap = len(q_words.intersection(b_words)) / max(len(q_words), 1)
                            score = round(min(0.50 + (overlap * 0.45), 0.95), 2)

                            results.append({
                                "source_type": "live_web_search",
                                "source_label": "Live Web Search (DuckDuckGo)",
                                "title": item.get("title", "Live Search Match"),
                                "subject": "Real-Time Web",
                                "date": "Current Web",
                                "similarity_score": score,
                                "snippet": (body[:320] + "...") if len(body) > 320 else body,
                                "url": item.get("href", "")
                            })
                except Exception as e:
                    print(f"Live web search notice: {e}")

        return results[:top_k]
