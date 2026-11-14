"""
Diagnostic Entrypoint
Forwards directly to scripts.check_system.
"""
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from scripts.check_system import run_diagnostics

if __name__ == "__main__":
    run_diagnostics()
