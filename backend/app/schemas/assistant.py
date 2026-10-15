from typing import Optional, List
from pydantic import BaseModel


class AssistantMessageRequest(BaseModel):
    message: str
    language: str = "en"  # "en" or "ta"
    user_location_lat: Optional[float] = None
    user_location_lon: Optional[float] = None
    activity_category: Optional[str] = "outdoor_worker"


class SourceReference(BaseModel):
    title: str
    organization: str
    url_or_document: Optional[str] = None


class AssistantMessageResponse(BaseModel):
    reply_text: str
    detected_language: str
    is_emergency: bool
    emergency_contact: Optional[str] = None  # e.g. "108 (Tamil Nadu Ambulance & Emergency)"
    emergency_immediate_steps: Optional[List[str]] = None
    sources: List[SourceReference]
    suggested_actions: List[str]
    tts_text: str  # Optimized text string for Web Speech API synthesis
