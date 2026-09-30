import re
import hashlib
from typing import Dict, Any, Tuple

def sha256(data: str) -> str:
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

class LosslessReconstructor:
    """
    Proves zero-information loss by reconstructing the raw log byte-for-byte
    from the parsed variables and the parser template.
    """
    
    @staticmethod
    def reconstruct_regex_log(regex_pattern: str, extracted_fields: Dict[str, str]) -> str:
        """
        Takes a regex pattern like '^FW-01 (?P<var_0>.*?) src=(?P<var_1>.*?)$'
        and injects the extracted field values back into it to recreate the raw string.
        """
        # Strip anchors for reconstruction
        reconstructed = regex_pattern.lstrip('^').rstrip('$')
        
        # We need to replace all (?P<name>pattern) with the actual value
        # This regex matches Python named capture groups
        group_pattern = re.compile(r'\(\?P<(?P<name>[a-zA-Z0-9_]+)>.*?\)')
        
        def replace_group(match) -> str:
            group_name = match.group('name')
            # If we don't have the value, we can't reconstruct perfectly
            if group_name not in extracted_fields:
                raise ValueError(f"Missing extracted value for {group_name}")
            return extracted_fields[group_name]
            
        reconstructed = group_pattern.sub(replace_group, reconstructed)
        
        # Unescape regex characters that were escaped during template mining
        # re.escape() escapes many non-alphanumeric characters like -, [, ], etc.
        reconstructed = re.sub(r'\\(.)', r'\1', reconstructed)
        
        return reconstructed

    @staticmethod
    def verify_round_trip(original_hash: str, regex_pattern: str, extracted_fields: Dict[str, str]) -> Tuple[bool, str]:
        """
        Attempts to reconstruct the log and compares its hash to the original custody hash.
        Returns (success_boolean, reconstructed_string).
        """
        try:
            reconstructed = LosslessReconstructor.reconstruct_regex_log(regex_pattern, extracted_fields)
            reconstructed_hash = sha256(reconstructed)
            
            return reconstructed_hash == original_hash, reconstructed
        except Exception as e:
            return False, str(e)
