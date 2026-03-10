from pydantic import BaseModel
from typing import List, Optional


class ClinicalCodeRequest(BaseModel):
    raw_text: str
    code_system: str
    context: Optional[str] = None


class StandardizedCode(BaseModel):
    code: str
    display: str
    system: str
    version: Optional[str] = None
    confidence: float
    match_type: str


class ClinicalCodeResponse(BaseModel):
    original_text: str
    code_system: str
    results: List[StandardizedCode]
    total_matches: int
    processed_at: str
