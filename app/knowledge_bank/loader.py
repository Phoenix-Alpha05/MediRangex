import json
from pathlib import Path
from typing import Optional
from app.knowledge_bank.schemas import KnowledgeBankDocument
from app.core.logging import get_logger

logger = get_logger("medirx.knowledge_bank.loader")

_kb_cache: Optional[KnowledgeBankDocument] = None


def load_knowledge_bank(path: str) -> KnowledgeBankDocument:
    global _kb_cache

    kb_path = Path(path)
    if not kb_path.exists():
        raise FileNotFoundError(f"Knowledge bank file not found at: {path}")

    if not kb_path.suffix == ".json":
        raise ValueError(f"Knowledge bank must be a JSON file, got: {kb_path.suffix}")

    logger.info("loading_knowledge_bank", path=str(kb_path))

    with open(kb_path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    kb = KnowledgeBankDocument.model_validate(raw)

    module_names = [m.module for m in kb.knowledge_bank.modules]
    logger.info(
        "knowledge_bank_loaded",
        bank_name=kb.knowledge_bank.name,
        version=kb.knowledge_bank.version,
        module_count=len(module_names),
        modules=module_names,
    )

    _kb_cache = kb
    return kb


def get_cached_kb() -> KnowledgeBankDocument:
    if _kb_cache is None:
        raise RuntimeError(
            "Knowledge bank has not been loaded. Ensure load_knowledge_bank() "
            "is called during application startup."
        )
    return _kb_cache
