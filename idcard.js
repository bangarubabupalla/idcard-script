/* ============================================
   CONFIG
============================================ */
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbxgBHMWzOMlgOucyYEQFXWFoQ3oEMwpsIZjJHNx_w9cIIcU7TBe_icRyBsbIMO_qrf6/exec";

/* Background images */
const BG_NIE = "https://iili.io/f9vffEv.png";
const BG_NIST = "https://iili.io/f9vfC2p.png";
const BG_OLD_NIE = "https://iili.io/fHuJnBS.png";
const BG_OLD_NIST = "https://iili.io/fHuqfSI.png";

/* Photo positions */
const photoNew = { x: 200, y: 220, width: 240, height: 240 };
const photoOld = { x: 412, y: 266, width: 188, height: 240 };

/* Global photo */
let uploadedPhoto = null;

/* Short alias */
function q(id) { return document.getElementById(id); }

/* ============================================
   FIELD SWITCHING (Follows OLD GitHub behavior)
============================================ */
function updateCollegeFields() {
  const col = q("collegeSelect").value;

  if (col === "OLD_NIE" || col === "OLD_NIST") {
    q("course").style.display = "none";
    q("courseOld").style.display = "block";
    q("blood").style.display = "block";
  } else {
    q("course").style.display = "block";
    q("courseOld").style.display = "none";
    q("blood").style.display = "none";
  }
}

/* ============================================
   GET DATA
============================================ */
function getData() {
  const col = q("collegeSelect").value;

  return {
    college: col,
    name: q("name").value.trim(),
    roll: q("roll").value.trim(),
    course: (col === "OLD_NIE" || col === "OLD_NIST")
      ? q("courseOld").value
      : q("course").value,
    blood: q("blood").value.trim(),
    branch: q("branch").value.trim(),
    contact: q("contact").value.trim(),
    parentName: q("parentName").value.trim(),
    parentContact: q("parentContact").value.trim()
  };
}

/* ============================================
   DRAW ID CARD
============================================ */
function drawCard() {
  const canvas = q("idCanvas");
  const ctx = canvas.getContext("2d");

  const d = getData();

  /* SELECT BG */
  let bg = BG_NIE;
  if (d.college === "NIST") bg = BG_NIST;
  if (d.college === "OLD_NIE") bg = BG_OLD_NIE;
  if (d.college === "OLD_NIST") bg = BG_OLD_NIST;

  /* Load BG */
  const bgImg = new Image();
  bgImg.crossOrigin = "anonymous";

  bgImg.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* center-cropped background fit */
    const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
    const sw = canvas.width / scale;
    const sh = canvas.height / scale;
    const sx = (bgImg.width - sw) / 2;
    const sy = (bgImg.height - sh) / 2;

    ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    /* =============================
       TEXT LAYOUT (same as GitHub)
    ==============================*/
    const layoutNew = {
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

    const USE = (d.college === "OLD_NIE" || d.college === "OLD_NIST")
      ? layoutOld
      : layoutNew;

    /* Draw text */
    Object.keys(USE).forEach(key => {
      if (!d[key]) return;

      const f = USE[key];
      ctx.font = f.font;
      ctx.fillStyle = f.color;

      if (f.center) {
        ctx.textAlign = "center";
        ctx.fillText(d[key], canvas.width / 2, f.y);
      } else {
        ctx.textAlign = "left";
        ctx.fillText(d[key], f.x, f.y);
      }
    });

    /* Draw photo */
    if (uploadedPhoto) {
      const pos = (d.college === "OLD_NIE" || d.college === "OLD_NIST")
        ? photoOld
        : photoNew;

      ctx.save();
      ctx.beginPath();
      ctx.rect(pos.x, pos.y, pos.width, pos.height);
      ctx.clip();

      const iw = uploadedPhoto.width,
            ih = uploadedPhoto.height;

      const scale = Math.max(pos.width / iw, pos.height / ih);
      const sw2 = pos.width / scale;
      const sh2 = pos.height / scale;
      const sx2 = (iw - sw2) / 2;
      const sy2 = (ih - sh2) / 2;

      ctx.drawImage(uploadedPhoto, sx2, sy2, sw2, sh2, pos.x, pos.y, pos.width, pos.height);
      ctx.restore();
    }
  };

  bgImg.src = bg;
}

/* ============================================
   PHOTO UPLOAD
============================================ */
q("photoInput").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const r = new FileReader();
  r.onload = function(ev) {
    const img = new Image();
    img.onload = function() {
      uploadedPhoto = img;
      drawCard();
    };
    img.src = ev.target.result;
  };
  r.readAsDataURL(file);
});

/* ============================================
   PRINT FIX (always works)
============================================ */
q("printBtn").onclick = () => {
  drawCard();

  setTimeout(() => {
    const data = q("idCanvas").toDataURL("image/png");
    const w = window.open("", "_blank", "width=600,height=800");

    w.document.write(`
      <html>
      <body style="margin:0;padding:0;text-align:center;">
        <img id="pImg" src="${data}" style="width:100%;max-width:600px;">
        <script>
          const img=document.getElementById('pImg');
          img.onload=function(){ setTimeout(()=>print(),300); };
        <\/script>
      </body>
      </html>
    `);

    w.document.close();
  }, 300);
};

/* ============================================
   PNG DOWNLOAD
============================================ */
q("downloadPngBtn").onclick = () => {
  drawCard();
  setTimeout(() => {
    const a = q("dlink");
    a.href = q("idCanvas").toDataURL();
    a.download = (q("roll").value || "IDCARD") + ".png";
    a.click();
  }, 300);
};

/* ============================================
   PDF DOWNLOAD
============================================ */
q("downloadPdfBtn").onclick = () => {
  drawCard();
  setTimeout(() => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "pt", "a4");
    const img = q("idCanvas").toDataURL("image/png");

    pdf.addImage(img, "PNG", 20, 20, 400, 640);
    pdf.save((q("roll").value || "IDCARD") + ".pdf");
  }, 350);
};

/* ============================================
   RESET
============================================ */
q("resetBtn").onclick = () => {
  document.querySelectorAll("#idcard-widget-container input")
    .forEach(i => i.value = "");

  uploadedPhoto = null;
  drawCard();
};

/* ============================================
   LIVE PREVIEW
============================================ */
[
  "name", "roll", "branch", "contact",
  "parentName", "parentContact", "blood"
].forEach(id => {
  q(id).addEventListener("input", drawCard);
});

["collegeSelect", "course", "courseOld"]
  .forEach(id => q(id).addEventListener("change", () => {
    updateCollegeFields();
    drawCard();
  }));

/* ============================================
   EXPORT drawIDCard FOR HTML
============================================ */
window.drawIDCard = drawCard;

/* ============================================
   INITIALIZE
============================================ */
updateCollegeFields();
drawCard();
