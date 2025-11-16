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

/* PHOTO POSITIONS */
const photoNew = { x: 200, y: 220, width: 240, height: 240 };
const photoOld = { x: 412, y: 266, width: 188, height: 240 };

let uploadedPhoto = null;
let isNewPhoto = false;

/* ============================================
   UTILS
============================================ */
function q(id) {
  return document.getElementById(id);
}

function checkRollExists(roll, cb) {
  fetch(GAS_URL + "?roll=" + encodeURIComponent(roll))
    .then((r) => r.json())
    .then((j) => cb(j.status === "found"))
    .catch(() => cb(false));
}

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
    parentContact: q("parentContact").value.trim(),
  };
}

/* ============================================
   DRAW CARD
============================================ */
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
    const scale = Math.max(
      canvas.width / bgImg.width,
      canvas.height / bgImg.height
    );
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
      parentName: {
        x: 262,
        y: 752,
        font: "bold 30px Segoe UI",
        color: "#EB490E",
      },
      parentContact: {
        x: 365,
        y: 802,
        font: "bold 32px Segoe UI",
        color: "#EB490E",
      },
    };

    const layoutOld = {
      roll: { x: 170, y: 331, font: "bold 32px Segoe UI", color: "#1B3A8A" },
      course: { x: 150, y: 373, font: "bold 32px Segoe UI", color: "#1B3A8A" },
      blood: { x: 220, y: 416, font: "bold 32px Segoe UI", color: "#1B3A8A" },
      name: {
        center: true,
        y: 590,
        font: "bold 37px Segoe UI",
        color: "#F02424",
      },
      parentName: {
        x: 250,
        y: 665,
        font: "bold 32px Segoe UI",
        color: "#1B3A8A",
      },
      contact: {
        x: 240,
        y: 721,
        font: "bold 32px Segoe UI",
        color: "#1B3A8A",
      },
      parentContact: {
        x: 360,
        y: 772,
        font: "bold 32px Segoe UI",
        color: "#1B3A8A",
      },
    };

    const layout =
      d.college === "OLD_NIE" || d.college === "OLD_NIST"
        ? layoutOld
        : layoutDefault;

    Object.keys(layout).forEach((key) => {
      const f = layout[key];
      const val = d[key];
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
      const p =
        d.college === "OLD_NIE" || d.college === "OLD_NIST"
          ? photoOld
          : photoNew;

      ctx.save();
      ctx.beginPath();
      ctx.rect(p.x, p.y, p.width, p.height);
      ctx.clip();

      const iw = uploadedPhoto.width,
        ih = uploadedPhoto.height;
      const boxW = p.width,
        boxH = p.height;
      const scale = Math.max(boxW / iw, boxH / ih);
      const sw = boxW / scale,
        sh = boxH / scale;
      const sx = (iw - sw) / 2,
        sy = (ih - sh) / 2;

      ctx.drawImage(uploadedPhoto, sx, sy, sw, sh, p.x, p.y, boxW, boxH);
      ctx.restore();
    }
  };

  bgImg.src = bg;
}

/* ============================================
   CONVERT TO BASE64
============================================ */
function getBase64(img) {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;

  const x = c.getContext("2d");
  x.drawImage(img, 0, 0);

  return c.toDataURL("image/png");
}

/* ============================================
   BLOGGER-SAFE PHOTO DOWNLOAD (IFRAME)
============================================ */
function triggerPhotoDownload(dataUrl, roll) {
  const f = document.getElementById("downFrame");
  const file = roll + "_photo.png";

  const html = `
  <html><body>
    <a id="dl" href="${dataUrl}" download="${file}"></a>
    <script>
      document.getElementById("dl").click();
    <\/script>
  </body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  f.src = url;
}

/* ============================================
   SAVE TO GOOGLE SHEETS + DRIVE
============================================ */
function saveToSheet(photoBase64) {
  const data = getData();
  data.photoBase64 = photoBase64 || "";

  fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify(data),
  })
    .then(() => console.log("Saved"))
    .catch(() => console.warn("no-cors but ok"));
}

/* ============================================
   INITIALIZER
============================================ */
function initIDCardGenerator() {
  q("roll").addEventListener("input", function () {
    let r = this.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    this.value = r.slice(0, 13);

    if (!r) return (q("fetchBtn").style.display = "none");

    checkRollExists(r, (exists) => {
      q("fetchBtn").style.display = exists ? "block" : "none";
    });
  });

  q("contact").addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
  });
  q("parentContact").addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
  });

  q("photoInput").addEventListener("change", (e) => {
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

  q("collegeSelect").addEventListener("change", () => {
    const c = q("collegeSelect").value;

    q("branch").style.display =
      c === "OLD_NIE" || c === "OLD_NIST" ? "none" : "block";
    q("blood").style.display =
      c === "OLD_NIE" || c === "OLD_NIST" ? "block" : "none";
    q("course").style.display =
      c === "OLD_NIE" || c === "OLD_NIST" ? "none" : "block";
    q("courseOld").style.display =
      c === "OLD_NIE" || c === "OLD_NIST" ? "block" : "none";

    drawCard();
  });

  /* GENERATE BUTTON */
  document.getElementById("photoInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {

            // Store loaded image
            uploadedPhoto = img;

            // This ensures BASE64 works
            uploadedPhoto.base64 = event.target.result;

            isNewPhoto = true;
            drawCard();
        };

        img.src = event.target.result; // base64 src
    };

    reader.readAsDataURL(file);
});

  /* PRINT */
  q("printBtn").addEventListener("click", () => {
    drawCard();
    setTimeout(() => {
      const img = q("idCanvas").toDataURL("image/png");
      const win = window.open();
      win.document.write(`
        <img id="p" src="${img}" style="width:100%">
        <script>
          p.onload = function(){ window.print(); setTimeout(()=>window.close(),500); };
        <\/script>
      `);
    }, 300);
  });

  /* PNG */
  q("downloadPngBtn").addEventListener("click", () => {
    drawCard();
    setTimeout(() => {
      const a = q("dlink");
      a.href = q("idCanvas").toDataURL("image/png");
      a.download = (q("roll").value || "IDCARD") + ".png";
      a.click();
    }, 250);
  });

  /* PDF */
  q("downloadPdfBtn").addEventListener("click", () => {
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

  /* RESET */
  q("resetBtn").addEventListener("click", () => {
    document
      .querySelectorAll("#idcard-widget input")
      .forEach((i) => (i.value = ""));

    uploadedPhoto = null;
    isNewPhoto = false;
    drawCard();
  });

  drawCard();
}

window.initIDCardGenerator = initIDCardGenerator;

/* FETCH EXISTING RECORD */
function fetchRecord() {
  const roll = q("roll").value.trim();
  if (!roll) return alert("Enter Roll Number");

  fetch(GAS_URL + "?roll=" + encodeURIComponent(roll))
    .then((r) => r.json())
    .then((data) => {
      if (data.status !== "found") return alert("Not found");

      q("name").value = data.name || "";
      q("contact").value = data.contact || "";
      q("parentName").value = data.parentName || "";
      q("parentContact").value = data.parentContact || "";
      q("branch").value = data.branch || "";
      q("blood").value = data.blood || "";
      q("collegeSelect").value = data.college || "NIE";

      if (data.college === "OLD_NIE" || data.college === "OLD_NIST")
        q("courseOld").value = data.course;
      else q("course").value = data.course;

      if (data.photo) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          uploadedPhoto = img;
          isNewPhoto = false;
          drawCard();
        };
        img.src = data.photo;
      } else {
        uploadedPhoto = null;
        isNewPhoto = false;
        drawCard();
      }

      q("fetchBtn").style.display = "block";
    });
}
