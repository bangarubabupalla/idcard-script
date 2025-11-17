/* ============================================
   CONFIG
============================================ */
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwFeYUQTaW-xo_aznE0ImujW_T4p4589_AFqG9E1PzduIbwQaA1R3YEmNxEcwyp0RLD/exec";

/* Backgrounds */
const BG_NIE = "https://iili.io/f9vffEv.png";
const BG_NIST = "https://iili.io/f9vfC2p.png";
const BG_OLD_NIE = "https://iili.io/fHuJnBS.png";
const BG_OLD_NIST = "https://iili.io/fHuqfSI.png";

/* Photo positions */
const photoNew = { x: 200, y: 220, width: 240, height: 240 };
const photoOld = { x: 412, y: 266, width: 188, height: 240 };

let uploadedPhoto = null;  // Image object
let isNewPhoto = false;    // TRUE only when user uploads new image

function q(id) { return document.getElementById(id); }

/* ============================================
   CHECK ROLL
============================================ */
function checkRollExists(roll, cb) {
  fetch(GAS_URL + "?roll=" + encodeURIComponent(roll))
    .then(r => r.json())
    .then(j => cb(j.status === "found"))
    .catch(() => cb(false));
}

/* ============================================
   GET DATA
============================================ */
function getData() {
  const college = q("collegeSelect").value;

  return {
    college,
    name: q("name").value.trim(),
    roll: q("roll").value.trim(),
    course:
      college === "OLD_NIE" || college === "OLD_NIST"
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
   DRAW CARD
============================================ */
if (window.livePhoto) {
   photo = await loadImage(window.livePhoto);
}
function drawCard() {
  const canvas = q("idCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 638;
  canvas.height = 1016;

  const d = getData();

  let bg = BG_NIE;
  if (d.college === "NIST") bg = BG_NIST;
  if (d.college === "OLD_NIE") bg = BG_OLD_NIE;
  if (d.college === "OLD_NIST") bg = BG_OLD_NIST;

  const bgImg = new Image();
  bgImg.crossOrigin = "anonymous";

  bgImg.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    if (uploadedPhoto) {
      const p = (d.college === "OLD_NIE" || d.college === "OLD_NIST") ? photoOld : photoNew;

      ctx.save();
      ctx.beginPath();
      ctx.rect(p.x, p.y, p.width, p.height);
      ctx.clip();

      const iw = uploadedPhoto.width;
      const ih = uploadedPhoto.height;
      const scale = Math.max(p.width / iw, p.height / ih);
      const sw2 = p.width / scale;
      const sh2 = p.height / scale;
      const sx2 = (iw - sw2) / 2;
      const sy2 = (ih - sh2) / 2;

      ctx.drawImage(uploadedPhoto, sx2, sy2, sw2, sh2, p.x, p.y, p.width, p.height);
      ctx.restore();
    }
  };

  bgImg.src = bg;
}

/* ============================================
   SAVE TO SHEETS / DRIVE
============================================ */
function saveToSheet(photoBase64) {
  const data = getData();
  data.photoBase64 = photoBase64 || "";

  fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(r => r.json().catch(() => ({})))
    .then(() => {
      isNewPhoto = false;
    })
    .catch(() => {
      isNewPhoto = false;
    });
}

/* ============================================
   PHOTO UPLOAD HANDLER
============================================ */
document.getElementById("photoInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      uploadedPhoto = img;
      uploadedPhoto.base64 = event.target.result; // REQUIRED
      isNewPhoto = true;
      drawCard();
    };
    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

/* ============================================
   GENERATE BUTTON — SAVE + AUTO-DOWNLOAD PHOTO
============================================ */
document.getElementById("generateBtn").addEventListener("click", () => {
  drawCard();

  setTimeout(() => {
    let photoData = "";
    let downloadData = "";

    if (uploadedPhoto && uploadedPhoto.base64) {
      photoData = uploadedPhoto.base64;
      downloadData = uploadedPhoto.base64;
    }

    saveToSheet(photoData);

    if (downloadData) {
      const roll = q("roll").value.trim() || "PHOTO";
      const fileName = roll + "_photo.png";

      const win = window.open("", "_blank");
      win.document.write(`
        <html><body>
          <a id="dl" href="${downloadData}" download="${fileName}"></a>
          <script>
            document.getElementById('dl').click();
            setTimeout(() => window.close(), 200);
          <\/script>
        </body></html>
      `);
      win.document.close();
    }
  }, 300);
});

/* ============================================
   PNG / PDF / PRINT handlers
============================================ */
document.getElementById("downloadPngBtn").addEventListener("click", () => {
  drawCard();
  setTimeout(() => {
    const a = q("dlink");
    a.href = q("idCanvas").toDataURL("image/png");
    a.download = (q("roll").value || "IDCARD") + ".png";
    a.click();
  }, 300);
});

document.getElementById("downloadPdfBtn").addEventListener("click", () => {
  drawCard();
  setTimeout(() => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "pt", "a4");
    const img = q("idCanvas").toDataURL("image/png");

    const pw = pdf.internal.pageSize.getWidth() - 80;
    const ph = pdf.internal.pageSize.getHeight() - 80;
    const scale = Math.min(pw / 638, ph / 1016);
    const w = 638 * scale;
    const h = 1016 * scale;
    const x = (pdf.internal.pageSize.getWidth() - w) / 2;

    pdf.addImage(img, "PNG", x, 40, w, h);
    pdf.save((q("roll").value || "IDCARD") + ".pdf");
  }, 350);
});

/* ============================================
   PRINT HANDLER
============================================ */
document.getElementById("printBtn").addEventListener("click", async () => {
  drawCard();
  setTimeout(() => {
    const img = q("idCanvas").toDataURL("image/png");
    const win = window.open("", "_blank");
    win.document.write(`
      <img id="p" src="${img}" style="width:100%;max-width:800px;">
      <script>
        p.onload = () => { window.print(); setTimeout(()=>window.close(),500); };
      <\/script>
    `);
  }, 350);
});

/* ============================================
   FETCH RECORD
============================================ */
function fetchRecord() {
  const roll = q("roll").value.trim();
  if (!roll) return alert("Enter Roll Number");

  fetch(GAS_URL + "?roll=" + encodeURIComponent(roll))
    .then(r => r.json())
    .then(data => {
      if (data.status !== "found") return alert("No record found");

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

window.initIDCardGenerator = function () {
  drawCard();
};
