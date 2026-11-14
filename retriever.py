"""
Retriever Module Entrypoint
Re-exports RetrieverService from app.services.retriever.
"""
from app.services.retriever import RetrieverService as ActualNewsRetriever

__all__ = ["ActualNewsRetriever"]

if __name__ == "__main__":
    retriever = ActualNewsRetriever()
    print("Testing retriever query:")
    res = retriever.find_matches("NASA lunar mission", language="en")
    print("Matches found:", len(res))
