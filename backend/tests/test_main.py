from fastapi.testclient import TestClient

import main
import models
from db import SessionLocal
import base64

import cloudinary.uploader

# 画像バリデーション(実バイト検査)を通すための最小の有効な PNG(1x1)
_VALID_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC"
)


def _make_authed_token(user_name: str, email: str) -> str:
    client.post(
        "/users",
        json={"user_name": user_name, "email": email, "password": "supersecret123"},
    )
    login = client.post("/login", json={"email": email, "password": "supersecret123"})
    return login.json()["access_token"]

client = TestClient(main.app)


def test_register_user_returns_public_fields_only():
    res = client.post(
        "/users",
        json={
            "user_name": "alice",
            "email": "alice@example.com",
            "password": "supersecret123",
        },
    )

    assert res.status_code == 200
    body = res.json()
    assert body["user_name"] == "alice"
    assert "password" not in body
    assert "email" not in body


def test_register_duplicate_email_is_rejected():
    payload = {
        "user_name": "eve",
        "email": "eve@example.com",
        "password": "supersecret123",
    }
    first = client.post("/users", json=payload)
    assert first.status_code == 200

    duplicate = client.post(
        "/users",
        json={**payload, "user_name": "eve2"},
    )
    assert duplicate.status_code == 400


def test_register_duplicate_username_is_rejected():
    # user_name にも DB のユニーク制約がある。以前は事前チェックが無く、
    # 同じ user_name で登録すると commit 時の IntegrityError が 500 になっていた。
    # (フロントの初期値が "太郎" 固定で、2 人目が必ず踏んでいた)
    payload = {
        "user_name": "taro",
        "email": "taro1@example.com",
        "password": "supersecret123",
    }
    first = client.post("/users", json=payload)
    assert first.status_code == 200

    duplicate = client.post(
        "/users",
        json={**payload, "email": "taro2@example.com"},
    )
    assert duplicate.status_code == 400


def test_users_list_endpoint_is_removed():
    # 認証なしで全ユーザー(パスワードハッシュ含む)を取得できてしまう
    # 脆弱なエンドポイントは削除済みであることを確認する(POSTのみ存在するので405)
    res = client.get("/users")
    assert res.status_code == 405


def test_login_success_and_wrong_password():
    client.post(
        "/users",
        json={
            "user_name": "bob",
            "email": "bob@example.com",
            "password": "correct-horse-battery",
        },
    )

    ok = client.post(
        "/login", json={"email": "bob@example.com", "password": "correct-horse-battery"}
    )
    assert ok.status_code == 200
    assert "access_token" in ok.json()

    ng = client.post(
        "/login", json={"email": "bob@example.com", "password": "wrong-password"}
    )
    assert ng.status_code == 401


def _create_user_with_styling(user_name: str, email: str, password_hash: str) -> int:
    db = SessionLocal()
    try:
        user = models.User(user_name=user_name, email=email, password=password_hash)
        db.add(user)
        db.commit()
        db.refresh(user)

        styling = models.Styling(
            styling_explanation="test styling",
            styling_item_img="http://example.com/img.png",
            user_id=user.user_id,
        )
        db.add(styling)
        db.commit()
        db.refresh(styling)
        return styling.styling_id
    finally:
        db.close()


def test_upload_rejects_content_type_spoofing():
    client.post(
        "/users",
        json={
            "user_name": "frank",
            "email": "frank@example.com",
            "password": "supersecret123",
        },
    )
    login = client.post(
        "/login", json={"email": "frank@example.com", "password": "supersecret123"}
    )
    token = login.json()["access_token"]

    fake_image = b"this is not really an image, just plain text"
    res = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        data={"styling_explanation": "test", "items": "[]"},
        files={"styling_item_img": ("fake.png", fake_image, "image/png")},
    )
    assert res.status_code == 400


def test_upload_with_broken_items_json_returns_400():
    token = _make_authed_token("gina", "gina@example.com")
    res = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        data={"styling_explanation": "test", "items": "not-json"},
        files={"styling_item_img": ("ok.png", _VALID_PNG, "image/png")},
    )
    assert res.status_code == 400


def test_upload_returns_502_when_cloudinary_fails(monkeypatch):
    # Cloudinary の認証未設定・障害を模す。以前は素の 500 になっていた。
    def _boom(*args, **kwargs):
        raise RuntimeError("cloudinary down")

    monkeypatch.setattr(cloudinary.uploader, "upload", _boom)

    token = _make_authed_token("hugo", "hugo@example.com")
    res = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        data={"styling_explanation": "test", "items": "[]"},
        files={"styling_item_img": ("ok.png", _VALID_PNG, "image/png")},
    )
    assert res.status_code == 502


def test_upload_with_missing_item_fields_returns_400(monkeypatch):
    monkeypatch.setattr(
        cloudinary.uploader,
        "upload",
        lambda *a, **k: {"secure_url": "http://example.com/x.png"},
    )

    token = _make_authed_token("iris", "iris@example.com")
    # brand / url / category が欠けた商品
    res = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        data={"styling_explanation": "test", "items": '[{"name": "only-name"}]'},
        files={"styling_item_img": ("ok.png", _VALID_PNG, "image/png")},
    )
    assert res.status_code == 400


def test_delete_styling_requires_authentication():
    styling_id = _create_user_with_styling("carol", "carol@example.com", "hashed")

    res = client.delete(f"/stylings/{styling_id}")
    assert res.status_code == 401


def test_get_stylings_does_not_expose_password_hash():
    _create_user_with_styling("dave", "dave@example.com", "super-secret-hash")

    res = client.get("/stylings")
    assert res.status_code == 200

    body = res.json()
    assert len(body) == 1
    creator = body[0]["creator"]
    assert creator["user_name"] == "dave"
    assert "password" not in creator
    assert "email" not in creator
