from fastapi import FastAPI
from pydantic import BaseModel
from transformers import MBartForConditionalGeneration, MBart50TokenizerFast
import torch

# FastAPI app
app = FastAPI()

# 设备选择
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")

# 加载 mBART 模型
model_name = "facebook/mbart-large-50-many-to-many-mmt"
tokenizer = MBart50TokenizerFast.from_pretrained(model_name)
model = MBartForConditionalGeneration.from_pretrained(model_name).to(device)

# 目标语言固定为中文
target_lang = "zh_CN"

class TranslateRequest(BaseModel):
    text: str

@app.post("/translate")
def translate(req: TranslateRequest):
    # 英文作为源语言
    tokenizer.src_lang = "en_XX"
    inputs = tokenizer(req.text, return_tensors="pt").to(device)
    forced_bos_token_id = tokenizer.lang_code_to_id["zh_CN"]
    outputs = model.generate(**inputs, forced_bos_token_id=forced_bos_token_id)
    translation = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]
    return {"translation": translation}

