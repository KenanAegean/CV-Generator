const input = document.getElementById("htmlInput");
const preview = document.getElementById("preview");

input.addEventListener("input", () => {
  preview.innerHTML = input.value;
});

function downloadPDF() {
  html2pdf().from(preview).save("my_cv.pdf");
}

function testATS() {
  const content = preview.innerText.toLowerCase();
  const badWords = ["table", "image", "icon", "pdf", "word"];
  const found = badWords.filter(word => content.includes(word));
  alert(found.length
    ? `⚠️ Potential ATS issues found: ${found.join(", ")}`
    : "✅ Looks ATS-friendly!");
}
