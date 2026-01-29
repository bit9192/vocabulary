const LLAMA_ENDPOINT = 'http://127.0.0.1:8080/v1/chat/completions'

export async function CallLLM(
  messages,
  options
) {
  const response = await fetch(LLAMA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen',
      stream: false,
      temperature: options.temperature ?? 0.2,
      messages,
    }),
  })

  if (!response.ok) {
    throw new Error('llama-server error')
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? ''
}


export const Prompts = {
  translate: (target, text) => [
    {
      role: 'system',
      content:
        '你是一个专业翻译引擎，只输出翻译结果，不要解释。',
    },
    {
      role: 'user',
      content: `请把下面内容翻译成${target}：\n${text}`,
    }
  ],
  translateWord: (word) => [
    {
      role: 'system',
      content:
        `
          你是一个专业的英文构词法（morphology）分析器，
          精通前缀、词根、后缀和词源学。
          你不会从“词汇使用便利性”出发，
          而是从“构词结构完整性”出发。
          请严格按照要求输出结果，不允许有任何多余解释。
          你需要将单词拆解成最小的构词单位（morpheme）
        `,
    },
    {
      role: "user",
      content: `请分析 ${word} 的构词过程。并将单词 ${word} 拆成 词1 + 词2 + ... 的形式，告诉我单词意思，和音标，和每个单词拆解的意思`
    },
    {
      role: 'user',
      content: `只返回纯净可直接使用的json ，格式为 {
        mean,
        "n": "音标",
        roots: [
          [xxx, "意思"]
        ]
      }
        `,
    },
  ],
}