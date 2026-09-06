// 投稿フォームの選択肢。バックエンドの constants.py と同じ値を持つ。増やすときは両方直す。
// 値(value)は英字で固定し、画面に出す日本語(label)だけをここで当てる。
// カテゴリーが自由入力だった頃は tops / トップス / Tops が混ざって溜まっていた。

export const ITEM_CATEGORIES = [
    { value: "tops", label: "トップス" },
    { value: "outer", label: "アウター" },
    { value: "pants", label: "パンツ" },
    { value: "skirt", label: "スカート" },
    { value: "onepiece", label: "ワンピース" },
    { value: "shoes", label: "シューズ" },
    { value: "bag", label: "バッグ" },
    { value: "headwear", label: "帽子" },
    { value: "accessory", label: "アクセサリー" },
    { value: "other", label: "その他" },
] as const;

export const ITEM_CONDITION_NEW = "new";
export const ITEM_CONDITION_USED = "used";

export const ITEM_CONDITIONS = [
    { value: ITEM_CONDITION_NEW, label: "新品", hint: "購入先のURLが必要です" },
    { value: ITEM_CONDITION_USED, label: "古着", hint: "URLは任意です" },
] as const;

// 選択式にする前の投稿は自由入力の値が入っている。
// 一覧に無ければ、保存されている文字列をそのまま出す。
export const categoryLabel = (value: string): string =>
    ITEM_CATEGORIES.find((category) => category.value === value)?.label ?? value;

// 状態は後から足した項目なので、それ以前の投稿は空。出すものが無ければ null。
export const conditionLabel = (value: string | null | undefined): string | null =>
    ITEM_CONDITIONS.find((condition) => condition.value === value)?.label ?? null;
