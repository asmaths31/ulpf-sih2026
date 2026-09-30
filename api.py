from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import re
import json

from custody.ledger import CustodyLedger
from onboarding.miner import TemplateMiner
from losslessness.reconstructor import LosslessReconstructor, sha256

app = FastAPI(title="ULPF API", description="Universal Log Pre-processing Framework")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State for MVP (In a real app, this is in PostgreSQL/Redis)
ledger = CustodyLedger(source_id="default-source")
parser_registry: List[Dict[str, Any]] = []
event_store: List[Dict[str, Any]] = []

class OnboardPayload(BaseModel):
    samples: List[str]

class IngestPayload(BaseModel):
    raw_log: str

@app.post("/api/onboard")
async def onboard_source(payload: OnboardPayload):
    """
    Feature 2: Self-Onboarding Parsers
    Takes a list of raw log samples and automatically generates a parser spec.
    """
    if not payload.samples:
        raise HTTPException(status_code=400, detail="No samples provided.")
        
    miner = TemplateMiner()
    spec = miner.mine_template(payload.samples)
    
    # Store in our active registry
    parser_registry.append(spec)
    
    return {
        "status": "success",
        "message": "Parser inferred and activated successfully.",
        "spec": spec
    }

@app.post("/api/ingest")
async def ingest_log(payload: IngestPayload):
    """
    The main ingestion pipeline executing Features 1 and 3.
    """
    raw_log = payload.raw_log
    raw_bytes = raw_log.encode('utf-8')
    
    # 1. Feature 1: Tamper-Evident Custody (Ingest into Ledger)
    provenance = ledger.ingest_event(raw_bytes)
    
    # 2. Parsing Layer (Try all active parsers)
    extracted_fields = {}
    matched_spec = None
    
    for spec in parser_registry:
        pattern = re.compile(spec["regex"])
        match = pattern.match(raw_log)
        if match:
            extracted_fields = match.groupdict()
            matched_spec = spec
            break
            
    if not matched_spec:
        # If unparsed, we still keep the raw evidence (Zero Loss guarantee)
        event_store.append({
            "status": "unparsed",
            "raw_log": raw_log,
            "provenance": provenance
        })
        return {"status": "unparsed", "provenance": provenance}
        
    # 3. Feature 3: Provable Losslessness (Reconstruct and verify)
    success, reconstructed = LosslessReconstructor.verify_round_trip(
        original_hash=provenance["raw_hash"],
        regex_pattern=matched_spec["regex"],
        extracted_fields=extracted_fields
    )
    
    if not success:
        # Gated by Losslessness check
        raise HTTPException(status_code=500, detail="Losslessness verification failed. Data dropping detected.")
        
    # 4. Success! Store the perfectly parsed event
    normalized_event = {
        "status": "parsed",
        "fields": extracted_fields,
        "provenance": provenance,
        "lossless_verified": True
    }
    event_store.append(normalized_event)
    
    return normalized_event

@app.post("/api/seal")
async def seal_block():
    """
    Feature 1: Seals a block of logs, creating a Merkle root and signing it.
    """
    block = ledger.seal_block()
    if not block:
        return {"status": "no_events_to_seal"}
        
    # Remove the tree instance from JSON response as it's not serializable
    resp_block = {k: v for k, v in block.items() if k != "_tree_instance"}
    return {"status": "sealed", "block": resp_block}

@app.get("/api/events")
async def get_events():
    return {"total": len(event_store), "events": event_store}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
