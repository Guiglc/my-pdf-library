// === 配置区域 === //
const pdfRepoOwner = 'Guiglc';
const pdfRepoName = 'ebook-pdf';
// =============== //

// 获取DOM元素
const bookListContainer = document.getElementById('book-list');
const loadingText = document.getElementById('loading-text');
const pdfPlaceholder = document.getElementById('pdf-placeholder');
const advancedPdfViewer = document.getElementById('advanced-pdf-viewer');

// 1. 页面加载完成后，获取PDF列表
document.addEventListener('DOMContentLoaded', fetchPdfList);

// 2. 从GitHub API获取PDF文件列表
async function fetchPdfList() {
    try {
        loadingText.textContent = '正在加载书单...';
        const apiUrl = `https://api.github.com/repos/${pdfRepoOwner}/${pdfRepoName}/contents/`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const pdfFiles = data.filter(item => item.type === 'file' && item.name.toLowerCase().endsWith('.pdf'));

        loadingText.style.display = 'none';
        renderPdfList(pdfFiles);

    } catch (error) {
        console.error('获取PDF列表失败:', error);
        loadingText.textContent = '加载失败: ' + error.message;
    }
}

// 3. 将PDF列表渲染到页面上
function renderPdfList(pdfFiles) {
    if (pdfFiles.length === 0) {
        bookListContainer.innerHTML = '<li>未找到PDF文件</li>';
        return;
    }

    bookListContainer.innerHTML = '';
    pdfFiles.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;
        listItem.addEventListener('click', () => {
            openPdfWithOfficialViewer(file.download_url);
        });
        bookListContainer.appendChild(listItem);
    });
}

// 4. 使用官方查看器打开PDF
function openPdfWithOfficialViewer(pdfUrl) {
    // 编码PDF的URL，因为它可能包含特殊字符
    const encodedPdfUrl = encodeURIComponent(pdfUrl);

    // 构建查看器的URL。
    // 注意：我们使用 `viewer.html` 的绝对路径，指向我们复制过来的 `/web/` 目录下的文件。
    // `file` 参数指定要打开的PDF文件的URL。
    const viewerUrl = `./web/viewer.html?file=${encodedPdfUrl}`;

    // 隐藏占位符，显示iframe
    pdfPlaceholder.style.display = 'none';
    advancedPdfViewer.style.display = 'block';

    // 将iframe的src设置为官方查看器的URL
    advancedPdfViewer.src = viewerUrl;
}