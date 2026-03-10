from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


class ModuleMetadata(BaseModel):
    module: str
    version: str
    domain: str
    payload_ref: str


class CrossModuleLink(BaseModel):
    from_module: str = Field(alias="from")
    to_module: str = Field(alias="to")
    link_type: str

    model_config = {"populate_by_name": True}


class RAGIndexLayer(BaseModel):
    layer: str
    sources: List[str]


class EmbeddingStrategy(BaseModel):
    clinical_text: str
    structured_data: str
    graph: str


class RAGIndexStructure(BaseModel):
    index_layers: List[RAGIndexLayer]
    embedding_strategy: EmbeddingStrategy


class GraphDatabaseSeed(BaseModel):
    source_module: str
    node_types: str
    edge_types: str
    logic_layers: List[str]


class KnowledgeBankRoot(BaseModel):
    name: str
    version: str
    platform: str
    modules: List[ModuleMetadata]
    cross_module_links: List[CrossModuleLink]
    rag_index_structure: RAGIndexStructure
    graph_database_seed: GraphDatabaseSeed
    api_contracts: Dict[str, Any]
    ingestion_notes: Dict[str, Any]


class KnowledgeBankDocument(BaseModel):
    knowledge_bank: KnowledgeBankRoot


class ModuleResponse(BaseModel):
    module: str
    version: str
    domain: str
    payload_ref: str
    payload: Optional[Dict[str, Any]] = None


class ModuleListResponse(BaseModel):
    total: int
    bank_name: str
    bank_version: str
    modules: List[ModuleMetadata]
