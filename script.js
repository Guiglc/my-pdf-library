const JSON_FILE = 'ebook_list.json'; // 本地 JSON 文件
const PDF_BASE_URL = 'https://raw.githubusercontent.com/Guiglc/ebook-pdf/main/';

const bookListContainer = document.getElementById('book-list');

fetch(JSON_FILE)
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    })
    .then(data => renderTable(data))
    .catch(err => {
        bookListContainer.innerHTML = `<tr><td colspan="4" style="text-align:center;">加载失败: ${err.message}</td></tr>`;
        console.error(err);
    });

function renderTable(data) {
    bookListContainer.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');

        // 分类
        const categoryCell = document.createElement('td');
        categoryCell.textContent = item.category;
        row.appendChild(categoryCell);

        // 书名
        const nameCell = document.createElement('td');
        const link = document.createElement('a');
        link.textContent = item.name;
        const pdfPath = `${PDF_BASE_URL}${encodeURIComponent(item.category)}/${encodeURIComponent(item.name)}`;
        link.href = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfPath)}`;
        link.target = '_blank';
        nameCell.appendChild(link);
        row.appendChild(nameCell);

        // 打分
        const scoreCell = document.createElement('td');
        scoreCell.textContent = item.score;
        row.appendChild(scoreCell);

        // 加入时间
        const dateCell = document.createElement('td');
        dateCell.textContent = item.date || '';
        row.appendChild(dateCell);

        bookListContainer.appendChild(row);
    });
}
