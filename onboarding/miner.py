import re
from typing import List, Dict, Any, Tuple
import json

class TemplateMiner:
    """
    A simplified Drain-style template miner for inferring parsers from unseen logs.
    """
    def __init__(self):
        # Type inference regexes
        self.type_patterns = {
            'ipv4': r'^(\d{1,3}\.){3}\d{1,3}$',
            'mac': r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$',
            'timestamp_iso': r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}',
            'timestamp_syslog': r'^[A-Z][a-z]{2}\s+\d+\s+\d{2}:\d{2}:\d{2}$',
            'number': r'^\d+$',
            'action': r'(?i)^(allow|deny|drop|block|success|failure|login|logout)$'
        }
        
        # Heuristics for mapping inferred types/tokens to ULPF unified schema
        self.schema_mapping = {
            'ipv4': ['src_ip', 'dst_ip'],
            'number': ['src_port', 'dst_port', 'bytes', 'pid'],
            'action': ['action', 'outcome']
        }

    def tokenize(self, log_line: str) -> List[str]:
        """Splits a log line into tokens, keeping delimiters separate."""
        # Simple tokenization: split on spaces, but keep brackets and quotes intact if possible.
        # For the MVP, we just split by space and common delimiters.
        return re.split(r'(\s+|=|,|\|)', log_line)

    def infer_type(self, token: str) -> str:
        """Guesses the semantic type of a token."""
        token_clean = token.strip('[]"\'')
        for type_name, pattern in self.type_patterns.items():
            if re.match(pattern, token_clean):
                return type_name
        return "string"

    def mine_template(self, log_lines: List[str]) -> Dict[str, Any]:
        """
        Takes a list of sample lines and infers a single generalized parser template.
        Assumes all lines belong to the same source/format for this MVP.
        """
        if not log_lines:
            return {}

        # 1. Tokenize all lines
        tokenized_lines = [self.tokenize(line) for line in log_lines]
        
        # 2. Find constants vs variables
        # If a token at position i changes across lines or matches a strict type (IP, number), it's a variable.
        base_tokens = tokenized_lines[0]
        template_tokens = []
        extracted_fields = []
        
        var_count = 0
        for i in range(len(base_tokens)):
            # If it's just whitespace or a delimiter, keep it
            if re.match(r'^(\s+|=|,|\|)$', base_tokens[i]):
                template_tokens.append(re.escape(base_tokens[i]))
                continue

            # Check if this position varies across the samples
            varies = False
            types_seen = set()
            
            for t_line in tokenized_lines:
                if i < len(t_line):
                    types_seen.add(self.infer_type(t_line[i]))
                    if t_line[i] != base_tokens[i]:
                        varies = True
            
            # Or if it strictly looks like a specific type even if we only have 1 line
            inferred = self.infer_type(base_tokens[i])
            if varies or inferred != "string":
                var_name = f"var_{var_count}"
                best_type = inferred if len(types_seen) == 1 else "string"
                
                # Propose a ULPF mapping
                mapping_proposal = None
                confidence = 0.0
                if best_type in self.schema_mapping:
                    # Naive mapping: just pick the first likely one. 
                    # In a real app, we'd use context (like "src=" preceding it).
                    mapping_proposal = self.schema_mapping[best_type][0] 
                    confidence = 0.75
                
                template_tokens.append(f"(?P<{var_name}>.*?)")
                extracted_fields.append({
                    "field": var_name,
                    "inferred_type": best_type,
                    "proposed_mapping": mapping_proposal,
                    "confidence": confidence
                })
                var_count += 1
            else:
                # It's a constant
                template_tokens.append(re.escape(base_tokens[i]))

        regex_pattern = "^" + "".join(template_tokens) + "$"
        
        return {
            "parser_type": "regex",
            "regex": regex_pattern,
            "fields": extracted_fields
        }
