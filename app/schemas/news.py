from typing import Optional, List
from enum import Enum
from pydantic import BaseModel, Field, HttpUrl


class LanguageEnum(str, Enum):
    EN = "en"
    BN = "bn"


class NewsRequest(BaseModel):
    text: Optional[str] = Field(
        None,
        description="Raw text, headline, or claim to be verified",
        examples=["NASA announces new discovery of water ice deposits on the Moon."]
    )
    url: Optional[str] = Field(
        None,
        description="Public news article URL to scrape and analyze",
        examples=["https://www.bbc.com/news/articles/c04901g7x9vo"]
    )
    language: Optional[LanguageEnum] = Field(
        LanguageEnum.EN,
        description="Language code: 'en' for English or 'bn' for Bangla"
    )


class RetrievalMatch(BaseModel):
    source_type: str = Field(..., description="'local_historical' or 'live_web_search'")
    source_label: str = Field(..., description="Human-readable origin badge")
    title: str = Field(..., description="Headline of the matching authentic report")
    subject: str = Field(..., description="News category or subject tag")
    date: str = Field(..., description="Publication date or archive status")
    similarity_score: float = Field(..., description="Cosine or keyword overlap similarity (0.0 to 1.0)")
    snippet: str = Field(..., description="Short summary snippet of the verified news")
    url: Optional[str] = Field(None, description="Direct URL if retrieved from live web search")


class PredictResponse(BaseModel):
    language: str = Field(..., description="Full language name ('English' or 'Bangla')")
    language_code: str = Field(..., description="Language ISO code ('en' or 'bn')")
    prediction: str = Field(..., description="Classification verdict: 'Real', 'Fake', or 'Unverified'")
    confidence: float = Field(..., description="Percentage confidence score (0 to 100)")
    actual_news_matches: List[RetrievalMatch] = Field(
        default_factory=list,
        description="Matched verified ground-truth records or web references"
    )
    evidence: str = Field(..., description="Aggregated evidence statement for UI display")
    sources: List[str] = Field(default_factory=list, description="List of external URL links")
    input_preview: str = Field(..., description="Preview snippet of the analyzed input text")
    note: Optional[str] = Field(None, description="Diagnostic or operational notes")


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    models_status: dict
