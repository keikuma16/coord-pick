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
