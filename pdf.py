import pdfplumber
from pdf2image import convert_from_path
import pytesseract
import json
import os
import argparse
import base64
from io import BytesIO

def is_text_pdf(pdf_path):
    """判断 PDF 是否包含可提取文本"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                if page.extract_text():
                    return True
        return False
    except:
        return False

def extract_text_pdf(pdf_path):
    """文本型 PDF 提取段落、表格和图片（图片转 base64，自动限制 bbox）"""
    data = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            page_data = {"page": i + 1, "paragraphs": [], "tables": [], "images": []}
            
            # 提取文字段落
            text = page.extract_text()
            if text:
                paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
                page_data["paragraphs"] = paragraphs
            
            # 提取表格
            tables = page.extract_tables()
            for table in tables:
                if table:
                    page_data["tables"].append(table)
            
            # 提取图片并转 base64
            for img in page.images:
                # 限制 bbox 在页面范围内
                x0 = max(0, img['x0'])
                y0 = max(0, img['top'])
                x1 = min(page.width, img['x1'])
                y1 = min(page.height, img['bottom'])
                
                try:
                    im = page.within_bbox((x0, y0, x1, y1)).to_image(resolution=300)
                    buffer = BytesIO()
                    im.save(buffer, format="PNG")
                    img_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
                    page_data["images"].append(img_b64)
                except Exception as e:
                    print(f"第 {i+1} 页图片处理失败，已跳过: {e}")
            
            data.append(page_data)
    return data

def extract_scanned_pdf(pdf_path):
    """扫描型 PDF OCR 提取文字，每页图片转 base64"""
    data = []
    pages = convert_from_path(pdf_path)
    for i, page in enumerate(pages):
        text = pytesseract.image_to_string(page, lang='chi_sim+eng')
        paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
        # 页面图片转 base64
        buffer = BytesIO()
        page.save(buffer, format="PNG")
        img_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        data.append({"page": i+1, "paragraphs": paragraphs, "tables": [], "images": [img_b64]})
    return data

def main():
    parser = argparse.ArgumentParser(description="PDF 转 JSON（含段落、表格、图片 base64）")
    parser.add_argument("pdf_path", help="PDF 文件路径")
    parser.add_argument("json_path", help="导出的 JSON 文件路径")
    args = parser.parse_args()

    pdf_path = args.pdf_path
    output_json = args.json_path

    if is_text_pdf(pdf_path):
        print("检测到文本型 PDF，使用文本提取...")
        data = extract_text_pdf(pdf_path)
    else:
        print("检测到扫描型 PDF，使用 OCR 提取...")
        data = extract_scanned_pdf(pdf_path)
    
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"已生成 JSON 文件：{output_json}")

if __name__ == "__main__":
    main()
