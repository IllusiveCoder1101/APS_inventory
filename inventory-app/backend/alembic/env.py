import sys
import pathlib

# get path of the project root (folder containing alembic.ini)
PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))


from app.database import Base
from app.models import *
target_metadata = Base.metadata
