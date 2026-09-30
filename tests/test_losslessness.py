import pytest
import re
from losslessness.reconstructor import LosslessReconstructor, sha256
from onboarding.miner import TemplateMiner

def test_exact_round_trip():
    # 1. Start with a raw log
    raw_log = "[2026-09-29T10:00:00] FW-01 DENY src=192.168.1.10 dst=10.0.0.5 port=80"
    original_hash = sha256(raw_log)
    
    # 2. Mine the parser template (Feature 2)
    miner = TemplateMiner()
    spec = miner.mine_template([raw_log])
    regex_pattern = spec["regex"]
    
    # 3. "Parse" the log using the generated regex
    parser = re.compile(regex_pattern)
    match = parser.match(raw_log)
    assert match is not None
    extracted_fields = match.groupdict()
    
    # 4. Prove losslessness (Feature 3)
    success, reconstructed = LosslessReconstructor.verify_round_trip(
        original_hash=original_hash,
        regex_pattern=regex_pattern,
        extracted_fields=extracted_fields
    )
    
    assert success is True
    assert reconstructed == raw_log
    
def test_failed_round_trip():
    raw_log = "USER login failure IP=1.1.1.1"
    original_hash = sha256(raw_log)
    
    # Simulate a parser that dropped the IP field (loss of information)
    regex_pattern = r"^USER (?P<var_0>.*?) failure IP=.*$"
    extracted_fields = {"var_0": "login"}
    
    success, _ = LosslessReconstructor.verify_round_trip(
        original_hash=original_hash,
        regex_pattern=regex_pattern,
        extracted_fields=extracted_fields
    )
    
    # The reconstruction should fail because it doesn't have the IP variable to inject back
    assert success is False
