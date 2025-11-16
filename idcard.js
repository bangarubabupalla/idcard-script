/* =========================================================
   ID CARD SYSTEM — FINAL VERSION
   - Auto-download working in Blogger
   - Google Sheets + Drive update working
   - No duplicate code
   - No popup blocking
========================================================= */

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbxgBHMWzOMlgOucyYEQFXWFoQ3oEMwpsIZjJHNx_w9cIIcU7TBe_icRyBsbIMO_qrf6/exec";

/* ---------------- Backgrounds ---------------- */
const BG_NIE = "https://iili.io/f9vffEv.png";
const BG_NIST = "https://iili.io/f9vfC2p.png";
const BG_OLD_NIE = "https://iili.io/fHuJnBS.png";
const BG_OLD_NIST = "https://iili.io/fHuqfSI.png";

/* ---------------- Photo Positions ---------------- */
const photoNew = { x: 200, y: 220, width: 240, height: 240 };
const photoOld = { x: 412, y: 266, width: 188, height: 240 };

/* ---------------- State ---------------- */
let uploadedPhoto = null;
let isNewPhoto = false;

function q(id) { return document.getElementById(id); }

/* =========================================================
   CHECK ROLL
========================================================= */
function checkRollExists(roll, cb) {
  fetch(GAS_URL + "?roll=" + encodeURIComponent(roll))
    .then(r => r.json())
    .then(j => cb(j.status === "found"))
    .catch(() => cb(false));
}

/* =========================================================
   FORM DATA
========================================================= */
function getData() {
  const college = q("collegeSelect").value;

  return {
    college,
    name: q("name").value.trim(),
    roll: q("roll").value.trim(),
    course:
      (college === "OLD_NIE" || college === "OLD_NIST")
        ? q("courseOld").value
        : q("course").value,
    blood: q("blood").value.trim(),
    branch: q("branch").value.trim(),
    contact: q("contact").value.trim(),
    parentName: q("parentName").value.trim(),
    parentContact: q("parentContact").value.trim()
  };
}

/* =========================================================
   DRAW CARD
========================================================= */
function drawCard() {
  const canvas = q("idCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 638;
  canvas.height = 1016;

  const d = getData();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let bg = BG_NIE;
  if (d.college === "NIST") bg = BG_NIST;
  if (d.college === "OLD_NIE") bg = BG_OLD_NIE;
  if (d.college === "OLD_NIST") bg = BG_OLD_NIST;

  const bgImg = new Image();
  bgImg.crossOrigin = "anonymous";

  bgImg.onload = () => {
    const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
    const sw = canvas.width / scale;
    const sh = canvas.height / scale;
    const sx = (bgImg.width - sw) / 2;
    const sy = (bgImg.height - sh) / 2;

    ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    const layoutDefault = {
      name: { x: 140, y: 512, font: "bold 34px Segoe UI", color: "#EB490E" },
      roll: { x: 250, y: 559, font: "bold 30px Segoe UI", color: "#EB490E" },
      course: { x: 170, y: 607, font: "bold 30px Segoe UI", color: "#EB490E" },
      branch: { x: 180, y: 655, font: "bold 30px Segoe UI", color: "#EB490E" },
      contact: { x: 255, y: 700, font: "bold 30px Segoe UI", color: "#EB490E" },
      parentName: { x: 262, y: 752, font: "bold 30px Segoe UI", color: "#EB490E" },
      parentContact: { x: 365, y: 802, font: "bold 32px Segoe UI", color: "#EB490E" }
    };

    const layoutOld = {
      roll: { x: 170, y: 331, font: "bold 32px Segoe UI", color: "#1B3A8A" },
      course: { x: 150, y: 373, font: "bold 32px Segoe UI", color: "#1B3A8A" },
      blood: { x: 220, y: 416, font: "bold 32px Segoe UI", color: "#1B3A8A" },
      name: { center: true, y: 590, font: "bold 37px Segoe UI", color: "#F02424" },
      parentName: { x: 250, y: 665, font: "bold 32px Segoe UI", color: "#1B3A8A" },
      contact: { x: 240, y: 721, font: "bold 32px Segoe UI", color: "#1B3A8A" },
      parentContact: { x: 360, y: 772, font: "bold 32px Segoe UI", color: "#1B3A8A" }
    };

    const layout = (d.college === "OLD_NIE" || d.college === "OLD_NIST")
      ? layoutOld
      : layoutDefault;

    Object.keys(layout).forEach(k => {
      const f = layout[k];
      const val = d[k];
      if (!val) return;
      ctx.font = f.font;
      ctx.fillStyle = f.color;

      if (f.center) {
        ctx.textAlign = "center";
        ctx.fillText(val, canvas.width / 2, f.y);
        ctx.textAlign = "start";
      } else {
        ctx.fillText(val, f.x, f.y);
      }
    });

    /* Draw photo */
    if (uploadedPhoto) {
      const p = (d.college === "OLD_NIE" || d.college === "OLD_NIST")
        ? photoOld
        : photoNew;

      ctx.save();
      ctx.beginPath();
      ctx.rect(p.x, p.y, p.width, p.height);
      ctx.clip();

      const iw = uploadedPhoto.width;
      const ih = uploadedPhoto.height;
      const scaleP = Math.max(p.width / iw, p.height / ih);

      const sw = p.width / scaleP;
      const sh = p.height / scaleP;
      const sx = (iw - sw) / 2;
      const sy = (ih - sh) / 2;

      ctx.drawImage(uploadedPhoto, sx, sy, sw, sh, p.x, p.y, p.width, p.height);
      ctx.restore();
    }
  };

  bgImg.src = bg;
}

/* =========================================================
   IMAGE TO BASE64
========================================================= */
function getBase64(img) {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  c.getContext("2d").drawImage(img, 0, 0);
  return c.toDataURL("image/png");
}

/* =========================================================
   FIRE DOWNLOAD EVENT FOR BLOGGER
========================================================= */
function triggerPhotoDownload(dataUrl, roll) {
    const fileName = roll + "_photo.png";

    // Force download via iframe (Blogger-safe)
    const iframe = document.getElementById("downFrame");

    const html = `
        <html><body>
            <a id="dl" href="${dataUrl}" download="${fileName}"></a>
            <script>
                document.getElementById('dl').click();
            <\/script>
        </body></html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    iframe.src = url; // Forces download silently
}

/* =========================================================
   SAVE TO GOOGLE SHEETS + DRIVE
========================================================= */
function saveToSheet(photoBase64) {
  const data = getData();
  data.photoBase64 = photoBase64 || "";

  fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).catch(() => {});
}

/* =========================================================
   INITIALIZE
========================================================= */
function initIDCardGenerator() {

  /* Roll number */
  q("roll").addEventListener("input", function () {
    let r = this.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    this.value = r.slice(0, 13);

    if (!r) return q("fetchBtn").style.display = "none";

    checkRollExists(r, exists => {
      q("fetchBtn").style.display = exists ? "block" : "none";
    });
  });

  /* Number fields */
  q("contact").addEventListener("input", () => q("contact").value =
    q("contact").value.replace(/\D/g, "").slice(0, 10));
  q("parentContact").addEventListener("input", () => q("parentContact").value =
    q("parentContact").value.replace(/\D/g, "").slice(0, 10));

  /* Photo upload */
  q("photoInput").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      uploadedPhoto = img;
      isNewPhoto = true;
      drawCard();
    };
    img.src = URL.createObjectURL(file);
  });

  /* College switch */
  q("collegeSelect").addEventListener("change", () => {
    const c = q("collegeSelect").value;

    q("branch").style.display = (c === "OLD_NIE" || c === "OLD_NIST")
      ? "none" : "block";

    q("blood").style.display = (c === "OLD_NIE" || c === "OLD_NIST")
      ? "block" : "none";

    q("course").style.display = (c === "OLD_NIE" || c === "OLD_NIST")
      ? "none" : "block";

    q("courseOld").style.display = (c === "OLD_NIE" || c === "OLD_NIST")
      ? "block" : "none";

    drawCard();
  });

  /* =========================================================
     GENERATE — draw → save → auto-download (Blogger-safe)
  ========================================================= */
document.getElementById("generateBtn").addEventListener("click", () => {
  drawCard();

  setTimeout(() => {

    let photoData = "";
    let downloadData = "";

    // Only new uploads have blob URL
    if (uploadedPhoto && uploadedPhoto.src.startsWith("blob:")) {
      photoData = getBase64(uploadedPhoto);
      downloadData = photoData;
    }

    // Save to Google Sheet + Drive
    saveToSheet(photoData);

    // ⭐ FIRE SPECIAL EVENT FOR BLOGGER ⭐
    if (downloadData) {
      const roll = document.getElementById("roll").value.trim() || "IDCARD";
      triggerPhotoDownload(downloadData, roll);
    }

  }, 300);
});
/* =========================================================
   FETCH RECORD
========================================================= */
function fetchRecord() {
  const roll = q("roll").value.trim();
  if (!roll) return alert("Enter Roll Number");

  fetch(GAS_URL + "?roll=" + encodeURIComponent(roll))
    .then(r => r.json())
    .then(data => {
      if (data.status !== "found") return alert("Not found");

      q("name").value = data.name;
      q("contact").value = data.contact;
      q("parentName").value = data.parentName;
      q("parentContact").value = data.parentContact;
      q("branch").value = data.branch;
      q("blood").value = data.blood;

      q("collegeSelect").value = data.college;

      if (data.college === "OLD_NIE" || data.college === "OLD_NIST")
        q("courseOld").value = data.course;
      else
        q("course").value = data.course;

      if (data.photo) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          uploadedPhoto = img;
          isNewPhoto = false;
          drawCard();
        };
        img.src = data.photo;
      }

      q("fetchBtn").style.display = "block";
      drawCard();
    });
}

/* expose */
window.initIDCardGenerator = initIDCardGenerator;
