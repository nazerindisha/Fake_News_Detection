import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
from duckduckgo_search import DDGS

class ActualNewsRetriever:
    def __init__(self):
        print("Initializing Hybrid Bilingual Actual News Retriever database...")
        base_dir = r"D:\7th_Semester_Collections\Project\Fake_News_Detection"
        
        # 1. Load English Real News (True.csv)
        true_path = os.path.join(base_dir, "True.csv")
        self.true_df = pd.read_csv(true_path)
        self.true_df["content"] = self.true_df["title"].fillna("") + " " + self.true_df["text"].fillna("")
        
        self.en_vectorizer = TfidfVectorizer(stop_words="english", max_df=0.7)
        self.en_vectors = self.en_vectorizer.fit_transform(self.true_df["content"])
        print(f"Loaded {len(self.true_df)} English real articles.")

        # 2. Load Bangla Real News (Authentic-48K.csv)
        auth_path = os.path.join(base_dir, "Authentic-48K.csv")
        if os.path.exists(auth_path):
            self.auth_df = pd.read_csv(auth_path)
            
            # Map BanFakeNews columns safely ('headline' and 'content')
            title_col = "headline" if "headline" in self.auth_df.columns else "title"
            text_col = "content" if "content" in self.auth_df.columns else "text"
            
            self.auth_df["full_content"] = self.auth_df[title_col].fillna("") + " " + self.auth_df[text_col].fillna("")
            self.bn_vectorizer = TfidfVectorizer(max_df=0.7)
            self.bn_vectors = self.bn_vectorizer.fit_transform(self.auth_df["full_content"])
            print(f"Loaded {len(self.auth_df)} Bangla real articles.")
        else:
            self.auth_df = None
            print("Warning: Authentic-48K.csv not found.")

        print("Hybrid Actual News Retriever fully initialized!")

    def find_actual_news(self, text, language="en", top_k=1):
        """Finds matching real news from local datasets first. If similarity is low, falls back to live web search."""
        results = []
        max_sim = 0.0
        
        # Check local dataset first
        if language == "en":
            query_vector = self.en_vectorizer.transform([text])
            similarities = cosine_similarity(query_vector, self.en_vectors).flatten()
            best_idx = similarities.argmax()
            max_sim = float(similarities[best_idx])
            
            if max_sim > 0.25:  # Good local match found
                row = self.true_df.iloc[best_idx]
                results.append({
                    "source_type": "local_historical",
                    "title": row.get("title", "No Title"),
                    "subject": row.get("subject", "General"),
                    "date": row.get("date", "Unknown"),
                    "similarity_score": max_sim,
                    "snippet": str(row.get("text", ""))[:300] + "..."
                })
                
        elif language == "bn" and self.auth_df is not None:
            query_vector = self.bn_vectorizer.transform([text])
            similarities = cosine_similarity(query_vector, self.bn_vectors).flatten()
            best_idx = similarities.argmax()
            max_sim = float(similarities[best_idx])
            
            title_col = "headline" if "headline" in self.auth_df.columns else "title"
            text_col = "content" if "content" in self.auth_df.columns else "text"
            
            if max_sim > 0.2:
                row = self.auth_df.iloc[best_idx]
                results.append({
                    "source_type": "local_historical",
                    "title": row.get(title_col, "No Title"),
                    "subject": row.get("category", "General"),
                    "date": row.get("date", "Unknown"),
                    "similarity_score": max_sim,
                    "snippet": str(row.get(text_col, ""))[:300] + "..."
                })

        # Fallback to Live Web Search if local match is weak or not found
        if not results or max_sim < 0.25:
            try:
                search_query = " ".join(text.split()[:8]) 
                region = "bd-en" if language == "en" else "bn-bd"
                
                with DDGS() as ddgs:
                    live_results = list(ddgs.text(search_query, max_results=top_k, region=region))
                    for item in live_results:
                        results.append({
                            "source_type": "live_web_search",
                            "title": item.get("title", "Live Search Match"),
                            "subject": "Current News / Web",
                            "date": "2026 / Real-time",
                            "similarity_score": 0.85,
                            "snippet": item.get("body", "No description available.")[:300] + "...",
                            "url": item.get("href", "")
                        })
            except Exception as e:
                print(f"Live web search error: {e}")

        return results[:top_k]