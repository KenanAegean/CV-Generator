const input       = document.getElementById("htmlInput");
const preview     = document.getElementById("preview");
const btnDownload = document.getElementById("downloadPDF");
const btnATS      = document.getElementById("testATS");
const btnTemplate  = document.getElementById("getTemplate");

// 1) parse & sync preview from the raw HTML string
function updatePreview() {
  const raw = input.value.trim();
  if (!raw) return preview.innerHTML = ""; 

  // if they pasted a full HTML document, grab only the <body>
  let parsed;
  try {
    const parser = new DOMParser();
    parsed = parser.parseFromString(raw, "text/html");
    preview.innerHTML = parsed.body?.innerHTML || raw;
  } catch {
    preview.innerHTML = raw;
  }
}

// live-update on every keystroke / paste
input.addEventListener("input", updatePreview);

// optional ATS-check
btnATS.addEventListener("click", () => {
  updatePreview();
  const text = preview.innerText.toLowerCase();
  const keywords = ["table", "image", "icon", "pdf", "word"];
  const found = keywords.filter(kw => text.includes(kw));
  alert(
    found.length
      ? `⚠️ Potential ATS issues: ${found.join(", ")}`
      : "✅ Looks ATS-friendly!"
  );
});

// 2) Download PDF
btnDownload.addEventListener("click", () => {
  updatePreview();
  downloadPDF();
});

function downloadPDF() {
  // clone the preview
  const clone = preview.cloneNode(true);
  clone.style.position = "absolute";
  clone.style.left     = "-9999px";
  clone.style.width    = "210mm";    // force A4 width
  clone.style.height   = "auto";
  clone.style.overflow = "visible";
  document.body.appendChild(clone);

  html2pdf()
    .set({
      margin:      [15, 15, 15, 15],
      filename:    "my_cv.pdf",
      image:       { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF:       { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak:   {
        mode:   ["css", "legacy"],
        before: ".page-break",
        avoid:  ["h1", "h2"]
      }
    })
    .from(preview)
    .save()
    .finally(() => document.body.removeChild(clone));
}

btnTemplate.addEventListener("click", () => {
  fetch("template.txt")
    .then(res => {
      if (!res.ok) throw new Error("Could not load template");
      return res.text();
    })
    .then(template => {
      input.value = template;
      updatePreview();
    })
    .catch(err => {
      console.error("Error fetching template:", err);
      alert("Sorry, could not load template.");
    });
});
