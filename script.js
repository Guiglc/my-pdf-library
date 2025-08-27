// === 配置区域 === //
// 修改为你的信息！
const pdfRepoOwner = 'Guiglc'; // 你的GitHub用户名
const pdfRepoName = 'ebook-pdf'; // 存放PDF的仓库名
// =============== //

// 获取DOM元素
const bookListContainer = document.getElementById('book-list');
const pdfListContainer = document.getElementById('pdf-list-container');
const pdfViewerContainer = document.getElementById('pdf-viewer-container');
const loadingText = document.getElementById('loading-text');
const closePdfBtn = document.getElementById('close-pdf-btn');
const currentPdfTitle = document.getElementById('current-pdf-title');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const pageNumDisplay = document.getElementById('page-num');
const pageCountDisplay = document.getElementById('page-count');
const pdfCanvas = document.getElementById('pdf-canvas');
const loader = document.getElementById('loader');

// PDF.js 相关变量
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
const scale = 1.5; // 缩放比例，可以根据需要调整

// 1. 页面加载完成后，获取PDF列表
document.addEventListener('DOMContentLoaded', fetchPdfList);

// 2. 从GitHub API获取PDF文件列表
async function fetchPdfList() {
    try {
        const apiUrl = `https://api.github.com/repos/${pdfRepoOwner}/${pdfRepoName}/contents/`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // 过滤出PDF文件
        const pdfFiles = data.filter(item =>
            item.type === 'file' && item.name.toLowerCase().endsWith('.pdf')
        );

        loadingText.classList.add('hidden');
        renderPdfList(pdfFiles);

    } catch (error) {
        console.error('获取PDF列表失败:', error);
        loadingText.textContent = '加载失败，请刷新重试或检查控制台。';
    }
}

// 3. 将PDF列表渲染到页面上
function renderPdfList(pdfFiles) {
    if (pdfFiles.length === 0) {
        bookListContainer.innerHTML = '<li>未找到PDF文件</li>';
        return;
    }

    bookListContainer.innerHTML = ''; // 清空列表
    pdfFiles.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;
        listItem.addEventListener('click', () => {
            openPdf(file.download_url, file.name);
        });
        bookListContainer.appendChild(listItem);
    });
}

// 4. 打开PDF查看器
function openPdf(pdfUrl, pdfName) {
    // 更新UI
    currentPdfTitle.textContent = pdfName;
    pdfListContainer.classList.add('hidden');
    pdfViewerContainer.classList.remove('hidden');

    // 显示加载指示器
    loader.classList.remove('hidden');

    // 配置PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // 加载PDF文档
    pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
        pdfDoc = pdf;
        pageCountDisplay.textContent = pdf.numPages;

        // 隐藏加载指示器
        loader.classList.add('hidden');

        // 渲染第一页
        pageNum = 1;
        renderPage(pageNum);
    }).catch(error => {
        console.error('加载PDF错误:', error);
        loader.classList.add('hidden');
        alert('加载PDF失败: ' + error.message);
    });
}

// 5. 渲染指定页码
function renderPage(num) {
    pageRendering = true;
    loader.classList.remove('hidden');

    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale });
        pdfCanvas.height = viewport.height;
        pdfCanvas.width = viewport.width;

        const renderContext = {
            canvasContext: pdfCanvas.getContext('2d'),
            viewport: viewport
        };

        const renderTask = page.render(renderContext);
        return renderTask.promise;
    }).then(() => {
        pageRendering = false;
        pageNumDisplay.textContent = num;
        loader.classList.add('hidden');

        // 如果之前有等待渲染的页面，现在渲染它
        if (pageNumPending !== null) {
            renderPage(pageNumPending);
            pageNumPending = null;
        }
    }).catch(error => {
        console.error('渲染页面错误:', error);
        loader.classList.add('hidden');
    });
}

// 6. 翻页控制函数
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function onPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
}

function onNextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
}

// 7. 关闭PDF查看器
function closePdfViewer() {
    pdfViewerContainer.classList.add('hidden');
    pdfListContainer.classList.remove('hidden');
    if (pdfDoc) {
        pdfDoc.destroy();
        pdfDoc = null;
    }
}

// 8. 绑定事件监听器
closePdfBtn.addEventListener('click', closePdfViewer);
prevPageButton.addEventListener('click', onPrevPage);
nextPageButton.addEventListener('click', onNextPage);