import {
  TranslateWord,
  TranslateSentence
} from "./api"

function Constlassify(input) {
  const text = input.trim()
  const sLen = text.split(/\s+/).length
  // 单个单词
  if (sLen <= 1) return "word"

  // 超过 3 个空格，基本是句子
  if (sLen >= 4) return "sentence"

  // 含有动词 + 主语迹象
  if (/\b(I|you|he|she|they|we|is|are|was|were|do|does)\b/i.test(text))
    return "sentence"
  // 默认单词 / 短语
  return "word"
}

function CleanInput(str) {
  console.log('clean input', str)
  str = str
  .replace(/[—–―]/g, '-') // ⭐ 新增：统一破折号
  .replace(/-/g, ' ')
  // 1. 去掉除 中英数 和 空格 之外的字符
  .replace(/[^\u4e00-\u9fa5a-zA-Z0-9 ]/g, '')
  // 2. 多个空格合并为一个
  .replace(/\s+/g, ' ')
  // 3. 去掉首尾空格
  .trim();
  return str
}

let _local = {}
export async function TranslatorReq(text) {
    if (!_local[text]) {
        const textType = Constlassify(text)
        let wor = null
        if (textType === "word") {
          text = CleanInput(text)
          wor = await TranslateWord({text})
        }
        else {
          wor = await TranslateSentence({text})
        }
        if (textType === "sentence") {
          _local[text] = {
            type: 1, // sentence
            content: wor.result,
          }
        }
        else {
          _local[text] = {
            type: 0, // word
            content: wor.result
          }
        }
    }
    return _local[text]
}

