export interface Item{
    name: string,
    brand: string,
    category: string,
    url:string
}

export interface Styling {
    styling_id: number,
    styling_explanation: string,
    styling_item_img: string,
    items: Item[]
}