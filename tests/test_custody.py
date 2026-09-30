import pytest
from custody.merkle import MerkleTree, sha256
from custody.ledger import CustodyLedger

def test_merkle_tree_proofs():
    logs = [b"log1", b"log2", b"log3", b"log4", b"log5"]
    tree = MerkleTree(logs)
    
    # Test valid proof
    leaf_idx = 2
    proof = tree.get_proof(leaf_idx)
    target_hash = sha256(logs[leaf_idx])
    
    assert MerkleTree.verify_proof(target_hash, proof, tree.root) == True
    
    # Test tamper (invalid proof)
    tampered_hash = sha256(b"log3_tampered")
    assert MerkleTree.verify_proof(tampered_hash, proof, tree.root) == False

def test_ledger_sealing_and_verification():
    ledger = CustodyLedger(source_id="fw-01")
    
    # Ingest 3 logs
    event1 = ledger.ingest_event(b"log data A")
    event2 = ledger.ingest_event(b"log data B")
    event3 = ledger.ingest_event(b"log data C")
    
    assert event1["seq"] == 1
    assert event3["seq"] == 3
    
    # Seal block
    block = ledger.seal_block()
    
    assert block is not None
    assert block["event_count"] == 3
    
    # Verify the signature
    assert ledger.verify_block(block) == True
    
    # Tamper with the block signature
    block["signature_hex"] = block["signature_hex"].replace("a", "b")
    assert ledger.verify_block(block) == False
    
    # Generate an inclusion proof for event 2
    tree = block["_tree_instance"]
    proof = tree.get_proof(event2["merkle_leaf_index"])
    
    assert MerkleTree.verify_proof(event2["raw_hash"], proof, block["merkle_root"]) == True
