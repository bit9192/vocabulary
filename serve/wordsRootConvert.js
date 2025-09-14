import XLSX from "xlsx";
import fs from "fs";

// 读取 Excel 文件
const workbook = XLSX.readFile("./data/3076.xls"); // 替换为你的文件名
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// 转成 JSON
const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

console.log(
    data
)

//  '词根词缀': 'amphi',
//     '释义': '【前缀】二,双',
//     '举例': 'amphibian（n.  两栖动物, 水陆两用车）',
const root = {
    prefixes: {},
    roots: {},
    suffixes: {}
}

const roots = {}

data.forEach(v => {
    const word = v['词根词缀']
    const def = v['释义']
    const example = v['举例']
    roots[word] = {
        def,
        example
    }
    if (def.match("词根")) {
        root.roots[word] = {
            def,
            example
        }
    }
    if (def.match("前缀")) {
        root.prefixes[word] = {
            def,
            example
        }
    }
    if (def.match("后缀")) {
        root.suffixes[word] = {
            def,
            example
        }
    }
})

console.log(root)
// // 输出到 JSON 文件
fs.writeFileSync("rootsList.json", JSON.stringify(roots, null, 2), "utf-8");

console.log("导出完成，共 " + data.length + " 条记录");