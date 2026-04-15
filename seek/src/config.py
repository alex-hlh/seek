from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
WORKFLOWS_DIR = BASE_DIR / "workflows"
OUTPUTS_DIR = BASE_DIR / "outputs"
LOGS_DIR = BASE_DIR / "logs"

WORKFLOWS_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)

DEFAULT_HEADLESS = True
DEFAULT_RESTART_INTERVAL = 300
DEFAULT_MAX_WORKERS = 10
DEFAULT_REQUEST_TIMEOUT = 30
