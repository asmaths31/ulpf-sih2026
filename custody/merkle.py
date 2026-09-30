import hashlib
from typing import List, Tuple

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

class MerkleTree:
    """A simple deterministic binary Merkle Tree."""
    
    def __init__(self, leaves_data: List[bytes]):
        self.leaves = [sha256(data) for data in leaves_data]
        self.tree = self._build_tree(self.leaves)

    def _build_tree(self, nodes: List[str]) -> List[List[str]]:
        tree = [nodes]
        current_level = nodes
        
        while len(current_level) > 1:
            next_level = []
            # Process pairs
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                # If odd number of nodes, duplicate the last one
                right = current_level[i + 1] if i + 1 < len(current_level) else left
                combined = (left + right).encode('utf-8')
                next_level.append(sha256(combined))
            
            tree.append(next_level)
            current_level = next_level
            
        return tree

    @property
    def root(self) -> str:
        if not self.tree or not self.tree[-1]:
            return ""
        return self.tree[-1][0]

    def get_proof(self, index: int) -> List[Tuple[str, str]]:
        """
        Returns a list of (sibling_hash, direction) needed to reconstruct the root from a leaf.
        Direction is 'L' (left sibling) or 'R' (right sibling).
        """
        proof = []
        if not self.tree or index < 0 or index >= len(self.leaves):
            return proof

        current_idx = index
        for level in self.tree[:-1]:
            is_right_node = current_idx % 2 != 0
            if is_right_node:
                sibling_idx = current_idx - 1
                direction = 'L'
            else:
                sibling_idx = current_idx + 1
                # Handle odd node duplicated sibling
                if sibling_idx >= len(level):
                    sibling_idx = current_idx
                direction = 'R'
                
            proof.append((level[sibling_idx], direction))
            current_idx //= 2
            
        return proof

    @staticmethod
    def verify_proof(leaf_hash: str, proof: List[Tuple[str, str]], root_hash: str) -> bool:
        """Verifies an inclusion proof offline."""
        current_hash = leaf_hash
        for sibling_hash, direction in proof:
            if direction == 'L':
                combined = (sibling_hash + current_hash).encode('utf-8')
            else:
                combined = (current_hash + sibling_hash).encode('utf-8')
            current_hash = sha256(combined)
            
        return current_hash == root_hash
