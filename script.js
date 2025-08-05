(() => {
  const input         = document.getElementById("htmlInput");
  const preview       = document.getElementById("preview");
  const btnDownload   = document.getElementById("downloadPDF");
  const btnATS        = document.getElementById("testATS");
  const btnTemplate   = document.getElementById("getTemplate");
  const btnCopy       = document.getElementById("copyHTML");
  const btnClear      = document.getElementById("clearInput");
  const btnSave       = document.getElementById("saveHTML");
  const btnLoad       = document.getElementById("loadHTML");
  const fileInput     = document.getElementById("loadFileInput");
  const STORAGE_KEY   = "cvMakerContent";

  function updatePreview() {
    const raw = input.value.trim();
    if (!raw) {
      preview.innerHTML = "";
      return;
    }
    try {
      const parser = new DOMParser();
      const doc    = parser.parseFromString(raw, "text/html");
      preview.innerHTML = doc.body?.innerHTML || raw;
    } catch {
      preview.innerHTML = raw;
    }
    localStorage.setItem(STORAGE_KEY, raw);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      input.value = saved;
      updatePreview();
    }
  });

  input.addEventListener("input", updatePreview);

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
        console.error("Error loading template:", err);
        alert("Sorry, could not load template.");
      });
  });

  btnCopy.addEventListener("click", () => {
    updatePreview();
    navigator.clipboard.writeText(input.value)
      .then(() => alert("✅ HTML copied to clipboard!"))
      .catch(() => alert("❌ Failed to copy HTML."));
  });

  btnClear.addEventListener("click", () => {
    if (confirm("Clear the editor? This cannot be undone.")) {
      input.value = "";
      updatePreview();
      localStorage.removeItem(STORAGE_KEY);
    }
  });

  // Save current CV HTML as a file
  btnSave.addEventListener("click", () => {
    const blob = new Blob([input.value], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "cv.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Trigger file input to load a saved CV HTML
  btnLoad.addEventListener("click", () => {
    fileInput.value = "";
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      input.value = reader.result;
      updatePreview();
    };
    reader.readAsText(file);
  });

  btnATS.addEventListener("click", () => {
    updatePreview();
    const text     = preview.innerText.toLowerCase();
    const keywords = ["table","image","icon","pdf","word"];
    const found    = keywords.filter(kw => text.includes(kw));
    alert(
      found.length
        ? `⚠️ Potential ATS issues: ${found.join(", ")}`
        : "✅ Looks ATS-friendly!"
    );
  });

  btnDownload.addEventListener("click", () => {
    updatePreview();
    downloadPDF();
  });

  function downloadPDF() {
    const clone = preview.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.left     = "-9999px";
    clone.style.width    = "210mm";
    clone.style.overflow = "visible";
    document.body.appendChild(clone);

    html2pdf()
      .set({
        margin:      [15,15,15,15],
        filename:    "my_cv.pdf",
        image:       { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF:       { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak:   { mode: ["css","legacy"], before: ".page-break", avoid: ["h1","h2"] }
      })
      .from(clone)
      .save()
      .finally(() => {
        document.body.removeChild(clone);
      });
  }
})();
