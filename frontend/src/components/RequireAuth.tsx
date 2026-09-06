import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clearToken, isLoggedIn } from "../auth.js";

// 未ログインのままフォームに入れてしまうと、
// 画像も商品も説明も入れ終えてから 401 で弾かれ、入力がすべて消える。
// 入り口で止めて、ログイン後に元の画面へ戻す。
export const RequireAuth = ({ children }: { children: ReactNode }) => {
    const location = useLocation();

    if (!isLoggedIn()) {
        // 期限切れのトークンが残っていると、以降の判定も誤り続ける
        clearToken();
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname + location.search,
                    flash: "この操作にはログインが必要です。",
                }}
            />
        );
    }

    return <>{children}</>;
};
