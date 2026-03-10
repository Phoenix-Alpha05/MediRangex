from typing import Any, Dict, List
from fastapi import HTTPException, status
from app.knowledge_bank.loader import get_cached_kb
from app.knowledge_bank.schemas import ModuleMetadata, ModuleResponse

KNOWN_MODULES = {
    "clinical_protocols_sepsis",
    "clinical_risk_feature_store",
    "drug_safety_knowledge_base",
    "hospital_operations_forecasting",
    "medical_ontology_mapping",
    "clinical_knowledge_graph",
}


def list_modules() -> List[ModuleMetadata]:
    kb = get_cached_kb()
    return kb.knowledge_bank.modules


def get_module(module_name: str) -> ModuleResponse:
    kb = get_cached_kb()

    matched = next(
        (m for m in kb.knowledge_bank.modules if m.module == module_name),
        None,
    )

    if matched is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module '{module_name}' not found in knowledge bank. "
                   f"Available modules: {[m.module for m in kb.knowledge_bank.modules]}",
        )

    payload = _build_module_payload(module_name, kb)

    return ModuleResponse(
        module=matched.module,
        version=matched.version,
        domain=matched.domain,
        payload_ref=matched.payload_ref,
        payload=payload,
    )


def get_module_payload(module_name: str) -> Dict[str, Any]:
    response = get_module(module_name)
    return response.payload or {}


def _build_module_payload(module_name: str, kb) -> Dict[str, Any]:
    bank = kb.knowledge_bank

    cross_links = [
        {
            "from": link.from_module,
            "to": link.to_module,
            "link_type": link.link_type,
        }
        for link in bank.cross_module_links
        if link.from_module == module_name or link.to_module == module_name
    ]

    api_contract = _resolve_api_contract(module_name, bank.api_contracts)

    rag_layers = [
        layer.model_dump()
        for layer in bank.rag_index_structure.index_layers
        if module_name in layer.sources
    ]

    graph_seed = (
        bank.graph_database_seed.model_dump()
        if bank.graph_database_seed.source_module == module_name
        else None
    )

    ingestion_order = bank.ingestion_notes.get("ordering", [])
    ingestion_priority = (
        ingestion_order.index(module_name) + 1
        if module_name in ingestion_order
        else None
    )

    return {
        "cross_module_links": cross_links,
        "api_contract": api_contract,
        "rag_layers": rag_layers,
        "graph_seed": graph_seed,
        "ingestion_priority": ingestion_priority,
        "embedding_strategy": bank.rag_index_structure.embedding_strategy.model_dump(),
    }


_API_CONTRACT_MAP = {
    "clinical_protocols_sepsis": "risk_prediction_api",
    "clinical_risk_feature_store": "risk_prediction_api",
    "drug_safety_knowledge_base": "drug_safety_api",
    "hospital_operations_forecasting": "operations_forecast_api",
    "medical_ontology_mapping": "terminology_api",
    "clinical_knowledge_graph": "clinical_reasoning_api",
}


def _resolve_api_contract(module_name: str, api_contracts: Dict[str, Any]) -> Dict[str, Any]:
    contract_key = _API_CONTRACT_MAP.get(module_name)
    if contract_key and contract_key in api_contracts:
        return {contract_key: api_contracts[contract_key]}
    return {}
