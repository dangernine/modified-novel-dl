// modified-novel-dl.js
// 수정된 novel-dl 스크립트: 각 요청 사이에 6초 딜레이를 넣어 분당 접속 횟수를 10회 이하로 제한합니다.
// 이 스크립트는 https://booktoki 도메인의 소설 에피소드 목록 페이지에서 실행되어야 합니다.

(async function() {
  async function fetchNovelContent(url) {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Failed to fetch content from " + url + ". Status: " + res.status);
      return null;
    }
    const txt = await res.text();
    const doc = (new DOMParser).parseFromString(txt, "text/html").querySelector("#novel_content");
    return doc ? cleanText(doc.innerHTML) : (console.error("Failed to find '#novel_content' on the page: " + url), null);
  }

  function unescapeHTML(html) {
    Object.entries({
      "&lt;": "<",
      "&gt;": ">",
      "&amp;": "&",
      "&quot;": '"',
      "&apos;": "'",
      "&#039;": "'",
      "&nbsp;": " ",
      "&ndash;": "–",
      "&mdash;": "—",
      "&lsquo;": "‘",
      "&rsquo;": "’",
      "&ldquo;": "“",
      "&rdquo;": "”"
    }).forEach(function(pair) {
      html = html.replace(new RegExp(pair[0], "g"), pair[1]);
    });
    return html;
  }

  function cleanText(html) {
    return unescapeHTML(
      html
        .replace(/<div>/g, "")
        .replace(/<\/div>/g, "")
        .replace(/<p>/g, "\n")
        .replace(/<\/p>/g, "\n")
        .replace(/<br\s*[\/]?>/g, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/ {2,}/g, " ")
        .replace(/\n{2,}/g, "\n\n")
    );
  }

  function createModal() {
    const modal = document.createElement("div");
    modal.id = "downloadProgressModal";
    modal.style.display = "block";
    modal.style.position = "fixed";
    modal.style.zIndex = "1";
    modal.style.left = "0";
    modal.style.top = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.overflow = "auto";
    modal.style.backgroundColor = "rgba(0,0,0,0.4)";
    const content = document.createElement("div");
    content.style.backgroundColor = "#fefefe";
    content.style.position = "relative";
    content.style.margin = "15% auto 0";
    content.style.padding = "20px";
    content.style.border = "1px solid #888";
    content.style.width = "50%";
    content.style.textAlign = "center";
    modal.appendChild(content);
    return { modal, modalContent: content };
  }

  async function downloadNovel(title, links, start) {
    let combined =
      title +
      "\n\nDownloaded with novel-dl,\nhttps://github.com/yeorinhieut/novel-dl\n";
    const delay = ms => new Promise(r => setTimeout(r, ms));
    const { modal, modalContent } = createModal();
    document.body.appendChild(modal);
    const progressBar = document.createElement("div");
    progressBar.style.width = "0%";
    progressBar.style.height = "10px";
    progressBar.style.backgroundColor = "#008CBA";
    progressBar.style.marginTop = "10px";
    progressBar.style.borderRadius = "3px";
    modalContent.appendChild(progressBar);
    const progressText = document.createElement("div");
    progressText.style.marginTop = "5px";
    modalContent.appendChild(progressText);
    const startTime = new Date();
    const total = links.length - start;
    for (let i = total; i >= 0; i--) {
      const episodeUrl = links[i];
      if (!episodeUrl.startsWith("https://booktoki")) {
        console.log("Skipping invalid episode link: " + episodeUrl);
        continue;
      }
      console.log("Downloading: " + title + " - Episode " + (total - i + 1) + "/" + (total + 1));
      const epContent = await fetchNovelContent(episodeUrl);
      if (!epContent) {
        console.error("Failed to fetch content for episode: " + episodeUrl);
        progressBar.style.display = "none";
        progressText.style.display = "none";
        const errDiv = document.createElement("div");
        errDiv.textContent = "An error occurred. Please check the console for details.";
        modalContent.appendChild(errDiv);
        return;
      }
      combined += epContent;
      const prog = ((total - i + 1) / (total + 1)) * 100;
      progressBar.style.width = prog + "%";
      const elapsed = new Date() - startTime;
      const estTotal = (elapsed / prog) * 100;
      const remaining = estTotal - elapsed;
      const remM = Math.floor(remaining / 60000);
      const remS = Math.floor((remaining % 60000) / 1000);
      progressText.textContent =
        "Downloading... " +
        prog.toFixed(2) +
        "%  -  Remaining Time: " +
        remM +
        "m " +
        remS +
        "s";
      await delay(6000);
    }
    document.body.removeChild(modal);
    const fileName = title + "(" + start + "~" + links.length + ").txt";
    const blob = new Blob([combined], { type: "text/plain" });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
    downloadLink.click();
  }

  function extractTitle() {
    const el = document.evaluate(
      '//*[@id="content_wrapper"]/div[1]/span',
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    return el ? el.textContent.trim() : null;
  }

  async function fetchPage(url) {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Failed to fetch page: " + url + ". Status: " + res.status);
      return null;
    }
    const txt = await res.text();
    return (new DOMParser).parseFromString(txt, "text/html");
  }

  async function runCrawler() {
    let url = window.location.href;
    const base = url.split("?")[0];
    url = base;
    if (!url.startsWith("https://booktoki")) {
      console.log("This script should be run on the novel episode list page.");
      return;
    }
    const title = extractTitle();
    if (!title) {
      console.log("Failed to extract the novel title.");
      return;
    }
    const pages = prompt("Enter the total number of pages for the novel:", "2");
    if (!pages || isNaN(pages)) {
      console.log("Invalid page number or user canceled the input.");
      return;
    }
    const totalPages = parseInt(pages, 10);
    let links = [];
    for (let p = 1; p <= totalPages; p++) {
      const pageUrl = url + "?spage=" + p;
      const doc = await fetchPage(pageUrl);
      if (doc) {
        const pageLinks = Array.from(doc.querySelectorAll(".item-subject")).map(el => el.getAttribute("href"));
        links.push(...pageLinks);
      }
    }
    const startEp = prompt("Enter the starting episode number (1 to " + links.length + "):", "1");
    if (!startEp || isNaN(startEp)) {
      console.log("Invalid episode number or user canceled the input.");
      return;
    }
    const startNum = parseInt(startEp, 10);
    if (startNum < 1 || startNum > links.length) {
      console.log("Invalid episode number. Please enter a number between 1 and the total number of episodes.");
    } else {
      console.log("Task Appended: Preparing to download " + title + " starting from episode " + startNum);
      await downloadNovel(title, links, startNum);
    }
  }

  await runCrawler();
})();
