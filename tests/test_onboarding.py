import pytest
from onboarding.miner import TemplateMiner
import re

def test_template_miner():
    miner = TemplateMiner()
    
    # 3 samples of an unknown firewall log format
    logs = [
        "FW-01 DENY src=192.168.1.10 dst=10.0.0.5 port=80",
        "FW-01 ALLOW src=10.0.0.2 dst=8.8.8.8 port=53",
        "FW-01 DENY src=172.16.0.5 dst=1.1.1.1 port=443"
    ]
    
    spec = miner.mine_template(logs)
    
    # It should identify it as a regex parser
    assert spec["parser_type"] == "regex"
    
    # It should extract fields
    fields = spec["fields"]
    assert len(fields) > 0
    
    # Let's check if the generated regex actually matches the logs
    regex = re.compile(spec["regex"])
    
    for log in logs:
        match = regex.match(log)
        assert match is not None, f"Generated regex failed to match log: {log}"
        
        # Ensure we captured variables
        groups = match.groupdict()
        assert len(groups) == len(fields)
        
    # Check if type inference worked
    types = [f["inferred_type"] for f in fields]
    assert "action" in types
    assert "ipv4" in types
    assert "number" in types
    
    # Check if mapping proposals were generated
    mappings = [f["proposed_mapping"] for f in fields if f["proposed_mapping"]]
    assert "action" in mappings
    assert "src_ip" in mappings
