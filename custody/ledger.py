import hashlib
import time
import json
from typing import List, Dict, Any, Optional
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
from custody.merkle import MerkleTree, sha256

class CustodyLedger:
    """
    Manages the hash-linked chain and signs sealed blocks.
    In a real app, state is in PostgreSQL and keys are in an HSM.
    """
    
    def __init__(self, source_id: str, private_key_pem: Optional[bytes] = None):
        self.source_id = source_id
        
        # Load or generate Ed25519 keypair
        if private_key_pem:
            self.private_key = serialization.load_pem_private_key(private_key_pem, password=None)
        else:
            self.private_key = ed25519.Ed25519PrivateKey.generate()
            
        self.public_key = self.private_key.public_key()
        
        # In-memory chain state for the MVP
        self.sequence = 0
        self.last_chain_hash = "GENESIS"
        self.pending_raw_events: List[bytes] = []
        
        self.blocks = []
        
    def ingest_event(self, raw_bytes: bytes) -> Dict[str, Any]:
        """
        Accepts a raw event, adds it to the hash chain, and queues it for the next block.
        Returns the provenance metadata for the normalized event.
        """
        self.sequence += 1
        raw_hash = sha256(raw_bytes)
        
        # chain_hash_n = SHA-256(chain_hash_(n-1) || raw_hash_n || source_id || seq_n)
        chain_input = f"{self.last_chain_hash}{raw_hash}{self.source_id}{self.sequence}".encode('utf-8')
        self.last_chain_hash = sha256(chain_input)
        
        self.pending_raw_events.append(raw_bytes)
        
        return {
            "raw_hash": raw_hash,
            "chain_hash": self.last_chain_hash,
            "source_id": self.source_id,
            "seq": self.sequence,
            "merkle_leaf_index": len(self.pending_raw_events) - 1
            # block_id and proof are added when the block is sealed
        }
        
    def seal_block(self) -> Optional[Dict[str, Any]]:
        """
        Takes all pending events, builds a Merkle tree, and signs the root.
        """
        if not self.pending_raw_events:
            return None
            
        tree = MerkleTree(self.pending_raw_events)
        root_hash = tree.root
        
        block_id = f"blk_{int(time.time())}_{self.source_id}"
        prev_block_hash = self.blocks[-1]['block_hash'] if self.blocks else "GENESIS"
        
        # Construct the payload to sign
        block_payload = {
            "block_id": block_id,
            "prev_block_hash": prev_block_hash,
            "merkle_root": root_hash,
            "event_count": len(self.pending_raw_events),
            "timestamp": int(time.time())
        }
        
        payload_bytes = json.dumps(block_payload, sort_keys=True).encode('utf-8')
        
        # Sign the block with Ed25519
        signature = self.private_key.sign(payload_bytes)
        
        block = {
            **block_payload,
            "signature_hex": signature.hex(),
            "block_hash": sha256(payload_bytes + signature),
            "_tree_instance": tree # Stored temporarily to generate proofs
        }
        
        self.blocks.append(block)
        
        # Clear pending
        self.pending_raw_events = []
        
        return block

    def verify_block(self, block: Dict[str, Any]) -> bool:
        """Verifies the Ed25519 signature of a sealed block."""
        try:
            payload = {
                "block_id": block["block_id"],
                "prev_block_hash": block["prev_block_hash"],
                "merkle_root": block["merkle_root"],
                "event_count": block["event_count"],
                "timestamp": block["timestamp"]
            }
            payload_bytes = json.dumps(payload, sort_keys=True).encode('utf-8')
            signature = bytes.fromhex(block["signature_hex"])
            
            self.public_key.verify(signature, payload_bytes)
            return True
        except Exception:
            return False
