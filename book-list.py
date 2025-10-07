import os
import json
import subprocess
from datetime import datetime
import sys
sys.stdout.reconfigure(encoding='utf-8')

# 配置
LOCAL_PDF_PATH = r"E:\Programming\Project\ebook-pdf"  # PDF 仓库本地路径
OUTPUT_JSON = r"E:\Programming\Project\my-pdf-library\ebook_list.json"  # 输出 JSON 路径
DEFAULT_SCORE = 5


# 获取文件第一次 commit 时间（本地 git）
def get_first_commit_date(file_path, repo_path):
    """
    使用 git log 获取文件第一次添加的 commit 时间
    返回 ISO 格式字符串
    """
    try:
        result = subprocess.run([
            'git', 'log', '--diff-filter=A', '--follow', '--format=%cI', '--',
            file_path
        ],
                                cwd=repo_path,
                                stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE,
                                text=True)
        dates = result.stdout.strip().splitlines()
        if dates:
            return dates[0]  # ISO 8601 格式
    except Exception as e:
        print(f"获取 {file_path} commit 时间失败: {e}")
    return ''


# 转换 ISO 时间为 'YYYY-MM-DD HH:MM:SS'
def format_commit_date(iso_date):
    if not iso_date:
        return ''
    try:
        dt = datetime.fromisoformat(iso_date.replace('Z', '+00:00'))
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except Exception as e:
        print(f"时间格式转换失败: {iso_date}, {e}")
        return iso_date


# 遍历 PDF 文件夹生成 JSON 数据
def generate_json(local_pdf_path, output_json):
    all_books = []
    for root, dirs, files in os.walk(local_pdf_path):
        for file in files:
            if file.lower().endswith('.pdf'):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path,
                                           local_pdf_path).replace('\\', '/')
                # 分类：取第一层文件夹
                category = rel_path.split('/')[0] if '/' in rel_path else '未分类'
                # 获取第一次 commit 时间
                raw_date = get_first_commit_date(rel_path, local_pdf_path)
                date = format_commit_date(raw_date)
                all_books.append({
                    "category": category,
                    "name": file,
                    "score": DEFAULT_SCORE,
                    "date": date
                })

    # 写入 JSON 文件
    os.makedirs(os.path.dirname(output_json), exist_ok=True)
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(all_books, f, ensure_ascii=False, indent=2)

    print(f"JSON 文件已生成: {output_json}, 共 {len(all_books)} 条记录")


if __name__ == "__main__":
    generate_json(LOCAL_PDF_PATH, OUTPUT_JSON)
