// === 配置区域 ===
const pdfRepoOwner = 'Guiglc';
const pdfRepoName = 'ebook-pdf';
// 你的 GitHub Pages URL
const pdfPagesBaseUrl = `https://${pdfRepoOwner}.github.io/${pdfRepoName}/`;
// ==================

// DOM 元素
const bookListContainer = document.getElementById('book-list');
const loadingText = document.getElementById('loading-text');
const pdfPlaceholder = document.getElementById('pdf-placeholder');
const pdfViewer = document.getElementById('pdf-viewer');

// 页面加载完成后获取 PDF 列表
document.addEventListener('DOMContentLoaded', fetchPdfList);

// 获取 GitHub 仓库 PDF 列表
async function fetchPdfList() {
    try {
        loadingText.textContent = '正在加载书单...';
        const apiUrl = `https://api.github.com/repos/${pdfRepoOwner}/${pdfRepoName}/contents/`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        // 只保留 PDF 文件
        const pdfFiles = data.filter(item => item.type === 'file' && item.name.toLowerCase().endsWith('.pdf'));

        loadingText.style.display = 'none';
        renderPdfList(pdfFiles);

    } catch (error) {
        console.error('获取PDF列表失败:', error);
        loadingText.textContent = '加载失败: ' + error.message;
    }
}

// 渲染 PDF 列表
function renderPdfList(pdfFiles) {
    if (pdfFiles.length === 0) {
        bookListContainer.innerHTML = '<li>未找到PDF文件</li>';
        return;
    }

    bookListContainer.innerHTML = '';
    pdfFiles.forEach(file => {
        const li = document.createElement('li');
        li.textContent = file.name;
        li.addEventListener('click', () => openPdf(file.name));
        bookListContainer.appendChild(li);
    });
}

// 打开 PDF（右侧 iframe 占满区域）
function openPdf(fileName) {
    pdfPlaceholder.style.display = 'none';
    pdfViewer.style.display = 'block';
    pdfViewer.src = pdfPagesBaseUrl + encodeURIComponent(fileName);
}
