import sys
import os

# Set up paths so Flask imports and modules resolve properly inside SeedIQ
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "SeedIQ")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Change working directory to backend dir so sqlite and json data files resolve correctly
os.chdir(BACKEND_DIR)

# Import existing Flask app directly without modifying it
from app import app
