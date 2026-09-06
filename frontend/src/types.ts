export interface Item{
    name: string,
    brand: string,
    category: string,
    // 新品(new) / 古着(used)
    condition: string,
    // 古着は買える場所が無いこともあるので、URL は任意
    url: string
}

export interface Styling {
    styling_id: number,
    styling_explanation: string,
    styling_item_img: string,
    items: Item[]
}
