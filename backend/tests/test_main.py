from fastapi.testclient import TestClient

import main
import models
from db import SessionLocal

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
