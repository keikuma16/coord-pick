"""投稿フォームの選択肢。フロントの src/constants.ts と同じ値を持つ。増やすときは両方直す。"""

# カテゴリーは自由入力だったため、tops / トップス / Tops が混ざって溜まっていた。
# 値は英字で固定し、画面に出す日本語はフロント側で当てる。
ITEM_CATEGORIES = [
    "tops",
    "outer",
    "pants",
    "skirt",
    "onepiece",
    "shoes",
    "bag",
    "headwear",
    "accessory",
    "other",
]

# 新品は購入先が必ずあるので URL 必須。古着は一点物で買える場所が無いこともある。
ITEM_CONDITION_NEW = "new"
ITEM_CONDITION_USED = "used"
ITEM_CONDITIONS = [ITEM_CONDITION_NEW, ITEM_CONDITION_USED]
