// トークンの読み取りを1か所に集める。
// 以前は App と ItemDetail が別々に JWT をデコードしていて、
// 「ログイン済みかどうか」の判定が画面ごとにずれていた。

const TOKEN_KEY = "access_token";

interface TokenPayload {
    user_id?: number;
    user_name?: string;
    exp?: number;
}

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);

// JWT の payload は base64url。署名の検証はサーバー側の仕事で、
// ここでは表示と画面遷移の判断にだけ使う。
export const getTokenPayload = (): TokenPayload | null => {
    const token = getToken();
    if (!token) return null;

    try {
        const parts = token.split(".");
        const payload = parts[1];
        if (parts.length !== 3 || !payload) return null;

        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
        return JSON.parse(atob(padded)) as TokenPayload;
    } catch (error) {
        console.error("Token decode error:", error);
        return null;
    }
};

// アクセストークンは30分で切れる。
// 期限切れを「ログイン済み」と扱うと、投稿フォームを全部埋めたあとに
// 401 で弾かれて入力が消える。入り口の時点で弾く。
export const isLoggedIn = (): boolean => {
    const payload = getTokenPayload();
    if (!payload) return false;
    if (typeof payload.exp !== "number") return true;
    return payload.exp * 1000 > Date.now();
};

export const getUserId = (): number | null => getTokenPayload()?.user_id ?? null;

export const getUserName = (): string | null => getTokenPayload()?.user_name ?? null;
