import { useState } from "react"

export const OpenList = ({ styling }) => {
    const [isOpen, setIsOpen] = useState(false);

    return(
        <div className="card">
            {styling.items.length>0 && (
                <>
                <dl key={styling.items[0].item_id}>
                    <dt>カテゴリー:{styling.items[0].item_category}</dt>                                
                    <dd>{styling.items[0].item_brand}:{styling.items[0].item_name}</dd>
                    <dd>説明:{styling.styling_explanation}</dd>
                    <dd>URL:
                        <a href={styling.items[0].item_url}>
                            {styling.items[0].item_url}
                        </a>
                    </dd>
                </dl>
                <button onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? 'close' : 'open'}
                </button>
                </>
            )}
            {isOpen && styling.items.slice(1).map((item) => (
                <dl key={item.item_id}>
                    <dt>カテゴリー:{item.item_category}</dt>                                
                    <dd>{item.item_brand}:{item.item_name}</dd>
                    <dd>説明:{styling.styling_explanation}</dd>
                    <dd>URL:<a href={item.item_url}>{item.item_url}</a>
                    </dd>
                </dl>
            ))}
        </div>
    )
}