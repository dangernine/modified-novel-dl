/**
 * Minified by jsDelivr using Terser v5.37.0.
 * Original file: /gh/yeorinhieut/novel-dl@1.0.1/script.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
async function fetchNovelContent(e){const t=await fetch(e);if(!t.ok)return console.error(`Failed to fetch content from ${e}. Status: ${t.status}`),null;const o=await t.text(),n=(new DOMParser).parseFromString(o,"text/html").querySelector("#novel_content");return n?cleanText(n.innerHTML):(console.error(`Failed to find '#novel_content' on the page: ${e}`),null)}function unescapeHTML(e){return Object.entries({"&lt;":"<","&gt;":">","&amp;":"&","&quot;":'"',"&apos;":"'","&#039;":"'","&nbsp;":" ","&ndash;":"–","&mdash;":"—","&lsquo;":"‘","&rsquo;":"’","&ldquo;":"“","&rdquo;":"”"}).forEach((([t,o])=>{const n=new RegExp(t,"g");e=e.replace(n,o)})),e}function cleanText(e){return e=unescapeHTML(e=(e=(e=(e=(e=(e=(e=(e=e.replace(/<div>/g,"")).replace(/<\/div>/g,"")).replace(/<p>/g,"\n")).replace(/<\/p>/g,"\n")).replace(/<br\s*[/]?>/g,"\n")).replace(/<[^>]*>/g,"")).replace(/ {2,}/g," ")).replace(/\n{2,}/g,"\n\n"))}function createModal(){const e=document.createElement("div");e.id="downloadProgressModal",e.style.display="block",e.style.position="fixed",e.style.zIndex="1",e.style.left="0",e.style.top="0",e.style.width="100%",e.style.height="100%",e.style.overflow="auto",e.style.backgroundColor="rgba(0,0,0,0.4)";const t=document.createElement("div");return t.style.backgroundColor="#fefefe",t.style.position="relative",t.style.margin="15% auto 0",t.style.padding="20px",t.style.border="1px solid #888",t.style.width="50%",t.style.textAlign="center",e.appendChild(t),{modal:e,modalContent:t}}async function downloadNovel(e,t,o){let n=`${e}\n\nDownloaded with novel-dl,\nhttps://github.com/yeorinhieut/novel-dl\n`;const l=e=>new Promise((t=>setTimeout(t,e))),{modal:r,modalContent:a}=createModal();document.body.appendChild(r);const s=document.createElement("div");s.style.width="0%",s.style.height="10px",s.style.backgroundColor="#008CBA",s.style.marginTop="10px",s.style.borderRadius="3px",a.appendChild(s);const i=document.createElement("div");i.style.marginTop="5px",a.appendChild(i);const c=new Date,d=t.length-o;for(let o=d;o>=0;o--){const r=t[o];if(!r.startsWith("https://booktoki")){console.log(`Skipping invalid episode link: ${r}`);continue}const u=`Downloading: ${e} - Episode ${d-o+1}/${d+1}`;console.log(u);const p=await fetchNovelContent(r);if(!p){console.error(`Failed to fetch content for episode: ${r}`),s.style.display="none",i.style.display="none";const e=document.createElement("div");return e.textContent="An error occurred. Please check the console for details.",void a.appendChild(e)}n+=p;const h=(d-o+1)/(d+1)*100;s.style.width=`${h}%`;const g=new Date-c,m=g/h*100-g,f=Math.floor(m/6e4),y=Math.floor(m%6e4/1e3);i.textContent=`Downloading... ${h.toFixed(2)}%  -  Remaining Time: ${f}m ${y}s`,await l(6000)}document.body.removeChild(r);const u=`${e}(${o}~${t.length}).txt`,p=new Blob([n],{type:"text/plain"}),h=document.createElement("a");h.href=URL.createObjectURL(p),h.download=u,h.click()}function extractTitle(){const e=document.evaluate('//*[@id="content_wrapper"]/div[1]/span',document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;return e?e.textContent.trim():null}function extractEpisodeLinks(){const e=[];return document.querySelectorAll(".item-subject").forEach((t=>{const o=t.getAttribute("href");e.push(o)})),e}async function fetchPage(e){const t=await fetch(e);if(!t.ok)return console.error(`Failed to fetch page: ${e}. Status: ${t.status}`),null;const o=await t.text();return(new DOMParser).parseFromString(o,"text/html")}async function runCrawler(){let e=window.location.href;const t=e.split("?")[0];if(e=t,!e.startsWith("https://booktoki"))return void console.log("This script should be run on the novel episode list page.");const o=extractTitle();if(!o)return void console.log("Failed to extract the novel title.");const n=prompt("Enter the total number of pages for the novel:","2");if(!n||isNaN(n))return void console.log("Invalid page number or user canceled the input.");const l=parseInt(n,10),r=[];for(let t=1;t<=l;t++){const o=`${e}?spage=${t}`,n=await fetchPage(o);if(n){const e=Array.from(n.querySelectorAll(".item-subject")).map((e=>e.getAttribute("href")));r.push(...e)}}const a=prompt(`Enter the starting episode number (1 to ${r.length}):`,"1");if(!a||isNaN(a))return void console.log("Invalid episode number or user canceled the input.");const s=parseInt(a,10);s<1||s>r.length?console.log("Invalid episode number. Please enter a number between 1 and the total number of episodes."):(console.log(`Task Appended: Preparing to download ${e} starting from episode ${s}`),downloadNovel(e,r,s))}runCrawler();
//# sourceMappingURL=/sm/61a7ce8dd96f32b7cd2c54269a173558620518334308c89dd626b78380362ded.map
