// JSON 文件路径（放在项目根目录）
const jsonPath = "ebook_list.json";

// 页面加载完成后读取 JSON
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const books = await response.json();
        renderBooksByCategory(books);
    } catch (err) {
        console.error("加载 JSON 失败:", err);
        document.getElementById("library").innerHTML =
            `<p style="color:red; text-align:center;">加载失败: ${err.message}</p>`;
    }
});

// 按分类分组并渲染
function renderBooksByCategory(books) {
    const container = document.getElementById("library");

    // 按 category 分组
    const grouped = {};
    books.forEach(book => {
        if (!grouped[book.category]) {
            grouped[book.category] = [];
        }
        grouped[book.category].push(book);
    });

    // 渲染每个分类
    for (const category in grouped) {
        const section = document.createElement("section");

        // 分类标题
        const h2 = document.createElement("h2");
        h2.textContent = category;
        section.appendChild(h2);

        // 表格
        const table = document.createElement("table");
        table.classList.add("book-table");

        const thead = document.createElement("thead");
        thead.innerHTML = `
      <tr>
        <th>书名</th>
        <th>评分</th>
        <th>加入时间</th>
      </tr>
    `;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        grouped[category].forEach(book => {
            const tr = document.createElement("tr");

            const nameTd = document.createElement("td");
            const link = document.createElement("a");
            link.textContent = book.name;
            link.href = `https://guiglc.github.io/ebook-pdf/${encodeURIComponent(book.category)}/${encodeURIComponent(book.name)}`;
            link.target = "_blank"; // 新标签页打开
            nameTd.appendChild(link);

            const scoreTd = document.createElement("td");
            scoreTd.textContent = book.score;

            const dateTd = document.createElement("td");
            dateTd.textContent = book.date || "未知";

            tr.appendChild(nameTd);
            tr.appendChild(scoreTd);
            tr.appendChild(dateTd);

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        section.appendChild(table);
        container.appendChild(section);
    }
}
