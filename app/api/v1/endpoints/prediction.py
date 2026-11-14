from fastapi import APIRouter, HTTPException, Depends
from app.schemas.news import NewsRequest, PredictResponse, RetrievalMatch
from app.services.classifier import ClassifierService
from app.services.retriever import RetrieverService
from app.services.scraper import ScraperService

router = APIRouter()

# Singletons for services
_classifier = None
_retriever = None

def get_classifier() -> ClassifierService:
    global _classifier
    if _classifier is None:
        _classifier = ClassifierService()
    return _classifier

def get_retriever() -> RetrieverService:
    global _retriever
    if _retriever is None:
        _retriever = RetrieverService()
    return _retriever

@router.post("/predict", response_model=PredictResponse, summary="Analyze & Verify News Authenticity")
def predict_news(
    request: NewsRequest,
    classifier: ClassifierService = Depends(get_classifier),
    retriever: RetrieverService = Depends(get_retriever)
):
    """
    Primary verification endpoint:
    - Analyzes raw claim text or scrapes and inspects an external news URL.
    - Classifies via language-tailored ML pipeline (English or Bangla).
    - Augments verdict with ground-truth records or regional real-time web references.
    """
    input_text = request.text.strip() if request.text else None
    scraped_title = None

    # 1. Scrape URL if provided
    if request.url and not input_text:
        scrape_res = ScraperService.scrape_article(str(request.url))
        if not scrape_res["success"]:
            raise HTTPException(status_code=400, detail=scrape_res["error"])
        input_text = scrape_res["content"]
        scraped_title = scrape_res["title"]

    if not input_text:
        raise HTTPException(
            status_code=400,
            detail="Please supply either article 'text' or a valid 'url'."
        )

    # 2. Select Language
    lang_code = request.language.value if hasattr(request.language, "value") else str(request.language or "en").lower()
    lang_name = "Bangla" if lang_code == "bn" else "English"

    # 3. Model Classification
    verdict, confidence, model_note = classifier.predict(input_text, language=lang_code)

    # 4. Ground-Truth Retrieval
    matches_raw = retriever.find_matches(input_text, language=lang_code, top_k=2)
    matches = [RetrievalMatch(**m) for m in matches_raw]

    # 5. Build Synthesized Evidence
    sources = []
    if matches:
        top = matches[0]
        evidence = f"[{top.source_label}] {top.title}\n\n{top.snippet}"
        sources = [m.url for m in matches if m.url]
    else:
        if verdict == "Fake":
            evidence = "No corroborating reports located in either indexed ground-truth records or live regional web indexes."
        else:
            evidence = f"Claim evaluated and substantiated through {lang_name} verification framework."

    preview = (input_text[:280] + "...") if len(input_text) > 280 else input_text
    if scraped_title:
        preview = f"Title: {scraped_title}\n\n{preview}"

    return PredictResponse(
        language=lang_name,
        language_code=lang_code,
        prediction=verdict,
        confidence=confidence,
        actual_news_matches=matches,
        evidence=evidence,
        sources=sources,
        input_preview=preview,
        note=model_note
    )
