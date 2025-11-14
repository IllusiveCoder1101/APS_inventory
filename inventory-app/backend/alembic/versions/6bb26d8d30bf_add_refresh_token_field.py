"""add refresh token field

Revision ID: 6bb26d8d30bf
Revises: 8bc4d1835211
Create Date: 2025-11-14 08:38:27.016135

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6bb26d8d30bf'
down_revision: Union[str, Sequence[str], None] = '8bc4d1835211'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
