/**
 * Cloudinary の画像 URL に変換パラメータを挟み、表示サイズに見合った画像を取りに行く。
 *
 * 投稿時に DB へ保存しているのはアップロード原寸の secure_url なので、
 * そのまま <img> に渡すと一覧のカード1枚あたり数 MB の写真を落とすことになる。
 * Cloudinary は URL の `/upload/` 直後にパラメータを置くだけで変換して返すため、
 * 既存の投稿も保存し直さずにそのまま効く。
 *
 * - f_auto : ブラウザが対応していれば WebP / AVIF で返す
 * - q_auto : 見た目が保てる範囲まで自動で圧縮する
 * - c_limit: 指定幅を上限に縮小する（元が小さければ拡大しない）
 *
 * Cloudinary 以外の URL や、すでに変換済みの URL はそのまま返す。
 */
export const cloudinaryImage = (url: string, width: number): string => {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  // `/upload/` の直後がバージョン (v123456) かフォルダ名なら未変換。
  // すでに `f_auto` などが入っているものへ二重に足さない。
  const [head, ...rest] = url.split("/upload/");
  const tail = rest.join("/upload/");
  if (/^[a-z]+_[^/]+\//.test(tail)) {
    return url;
  }
  return `${head}/upload/f_auto,q_auto,c_limit,w_${width}/${tail}`;
};
