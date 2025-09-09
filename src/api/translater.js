import {Translate} from "./api"
let _local = {}
export async function TranslatorReq(text) {
    if (!_local[text]) {
        const wor = await Translate(text.replace(/[^\w\s\u4e00-\u9fa5]/g, '').toLocaleLowerCase().trim())
        if (!wor) {
          const res = await TranslateLocal(text.trim())
          _local[text] = {
            type: 1, // sentence
            content: res
          }
        }
        else {
          _local[text] = {
            type: 0, // wordz
            content: wor
          }
        }
    }
    return _local[text]
}

// translate.js
const API_URL = "/db/translate";

/**
 * 调用 LibreTranslate 翻译接口
 * @param {string} text - 要翻译的文本
 * @param {string} source - 源语言 (默认 auto 自动识别)
 * @param {string} target - 目标语言 (默认 zh 中文)
 * @returns {Promise<string>} 翻译后的文本
 */
export async function TranslateLocal(text) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text , "direction": "en-zh"})
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    // console
    return data.translation;
  } catch (err) {
    console.error("Translate API Error:", err);
    return "";
  }
}
