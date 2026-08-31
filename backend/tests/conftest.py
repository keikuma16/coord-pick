import os
from pathlib import Path

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault(
    "DATABASE_URL", f"sqlite:///{Path(__file__).parent / 'test_tmp.db'}"
)
os.environ.setdefault("CLOUDINARY_CLOUD_NAME", "test")
os.environ.setdefault("CLOUDINARY_API_KEY", "test")
os.environ.setdefault("CLOUDINARY_API_SECRET", "test")

import pytest

import db as db_module


@pytest.fixture(autouse=True)
def clean_db():
    db_module.Base.metadata.drop_all(bind=db_module.engine)
    db_module.Base.metadata.create_all(bind=db_module.engine)
    yield
