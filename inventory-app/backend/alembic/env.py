import sys
import pathlib
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# --- keep your project root on sys.path so `app` imports work ---
PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

# this is the Alembic Config object, which provides access to
# the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name:
    fileConfig(config.config_file_name)

# import your models' Base so autogenerate can read metadata
from app.database import Base   # must define Base = declarative_base()
import app.models               # ensure this executes model definitions

# debug: list loaded tables (optional, safe)
print("Models loaded (metadata tables):", list(Base.metadata.tables.keys()))

# set metadata for 'alembic revision --autogenerate' to use
target_metadata = Base.metadata

# ====== optional: helper to exclude objects (uncomment if needed) ======
# def include_object(object, name, type_, reflected, compare_to):
#     # return True to include the object in autogenerate comparisons
#     return True

def run_migrations_offline():
    """Run migrations in 'offline' mode (no DB engine)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
        # include_object=include_object,   # enable if you implement above
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode (connect to DB engine)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            # include_object=include_object,  # enable if you implement above
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
