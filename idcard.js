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

/* ============================================
   CHECK IF ROLL EXISTS
============================================ */
function checkRollExists(roll, cb) {
  fetch(GAS_URL + "?roll=" + encodeURIComponent(roll))
    .then((r) => r.json())
    .then((j) => cb(j.status === "found"))
    .catch(() => cb(false));
}

/* ============================================
   SAVE TO GOOGLE SHEET + DRIVE
============================================ */
function saveToSheet(photoBase64) {
  const data = getData();
  data.photoBase64 = photoBase64;

  fetch(GAS_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(() => console.log("Saved to Google Sheets (no-cors)."))
    .catch((e) => console.log("ERR save:", e));
}

/* ============================================
   GET FORM DATA
============================================ */
function getData() {
  const college = document.getElementById("collegeSelect").value;
  return {
    college,
    name: document.getElementById("name").value,
    roll: document.getElementById("roll").value,
    course:
      college === "OLD_NIE" || college === "OLD_NIST"
        ? document.getElementById("courseOld").value
        : document.getElementById("course").value,
    blood: document.getElementById("blood").value,
    branch: document.getElementById("branch").value,
    contact: document.getElementById("contact").value,
    parentName: document.getElementById("parentName").value,
    parentContact: document.getElementById("parentContact").value
  };
}

/* ============================================
   DRAW CARD CANVAS
============================================ */
function drawCard() {
  const canvas = document.getElementById("idCanvas");
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
  bgImg.onload = function () {
    const scale = Math.max(
      canvas.width / bgImg.width,
      canvas.height / bgImg.height
    );
    const sw = canvas.width / scale;
    const sh = canvas.height / scale;
    const sx = (bgImg.width - sw) / 2;
    const sy = (bgImg.height - sh) / 2;

    ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    /* TEXT LAYOUTS */
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
        color: "#EB490E"
      },
      parentContact: {
        x: 365,
        y: 802,
        font: "bold 32px Segoe UI",
        color: "#EB490E"
      }
    };

    const layoutOld = {
      roll: { x: 170, y: 331, font: "bold 32px Segoe UI", color: "#1B3A8A" },
      course: { x: 150, y: 373, font: "bold 32px Segoe UI", color: "#1B3A8A" },
      blood: { x: 220, y: 416, font: "bold 32px Segoe UI", color: "#1B3A8A" },
      name: {
        center: true,
        y: 590,
        font: "bold 37px Segoe UI",
        color: "#F02424"
      },
      parentName: {
        x: 250,
        y: 665,
        font: "bold 32px Segoe UI",
        color: "#1B3A8A"
      },
      contact: {
        x: 240,
        y: 721,
        font: "bold 32px Segoe UI",
        color: "#1B3A8A"
      },
      parentContact: {
        x: 360,
        y: 772,
        font: "bold 32px Segoe UI",
        color: "#1B3A8A"
      }
    };

    const layout =
      d.college === "OLD_NIE" || d.college === "OLD_NIST"
        ? layoutOld
        : layoutDefault;

    /* DRAW TEXT */
    Object.keys(layout).forEach((k) => {
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

    /* DRAW PHOTO */
    if (uploadedPhoto) {
      const p =
        d.college === "OLD_NIE" || d.college === "OLD_NIST"
          ? photoOld
          : photoNew;

      ctx.save();
      ctx.beginPath();
      ctx.rect(p.x, p.y, p.width, p.height);
      ctx.clip();
      ctx.drawImage(uploadedPhoto, p.x, p.y, p.width, p.height);
      ctx.restore();
    }
  };

  bgImg.src = bg;
}

/* ============================================
   BASE64 FROM IMAGE
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
   INITIALIZE (CALLED FROM HTML)
============================================ */
function initIDCardGenerator() {
  const rollEl = document.getElementById("roll");

  rollEl.addEventListener("input", function () {
    let r = this.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    this.value = r.slice(0, 13);

    if (!r.length) return (fetchBtn.style.display = "none");

    checkRollExists(r, (exists) => {
      document.getElementById("fetchBtn").style.display = exists
        ? "block"
        : "none";
    });
  });

  /* CONTACT NUMBERS */
  document.getElementById("contact").addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
  });

  document
    .getElementById("parentContact")
    .addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").slice(0, 10);
    });

  /* PHOTO UPLOAD */
  document
    .getElementById("photoInput")
    .addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const img = new Image();
      img.onload = () => {
        uploadedPhoto = img;
        drawCard();
      };
      img.src = URL.createObjectURL(file);
    });

  /* COLLEGE SWITCH */
  document
    .getElementById("collegeSelect")
    .addEventListener("change", () => {
      const c = document.getElementById("collegeSelect").value;
      document.getElementById("branch").style.display =
        c === "OLD_NIE" || c === "OLD_NIST" ? "none" : "block";
      document.getElementById("blood").style.display =
        c === "OLD_NIE" || c === "OLD_NIST" ? "block" : "none";
      document.getElementById("course").style.display =
        c === "OLD_NIE" || c === "OLD_NIST" ? "none" : "block";
      document.getElementById("courseOld").style.display =
        c === "OLD_NIE" || c === "OLD_NIST" ? "block" : "none";

      drawCard();
    });

  /* BUTTONS */
  document.getElementById("generateBtn").addEventListener("click", () => {
    drawCard();
    setTimeout(() => {
      saveToSheet(uploadedPhoto ? getBase64(uploadedPhoto) : "");
    }, 250);
  });

  document.getElementById("printBtn").addEventListener("click", async () => {
    await drawCard();
    setTimeout(() => {
      const canvas = document.getElementById("idCanvas");
      const dataUrl = canvas.toDataURL("image/png");

      const win = window.open("", "_blank");
      win.document.write(`
        <img id="p" src="${dataUrl}" style="width:100%;max-width:800px;"/>
        <script>
        p.onload = function(){window.print();setTimeout(()=>window.close(),500)};
        <\/script>
      `);
    }, 400);
  });

  /* PNG */
  document
    .getElementById("downloadPngBtn")
    .addEventListener("click", () => {
      drawCard();
      setTimeout(() => {
        const a = document.getElementById("dlink");
        a.href = idCanvas.toDataURL("image/png");
        a.download =
          document.getElementById("roll").value.trim() || "IDCARD";
        a.click();
      }, 300);
    });

  /* PDF */
  document
    .getElementById("downloadPdfBtn")
    .addEventListener("click", () => {
      drawCard();
      setTimeout(() => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "pt", "a4");
        const img = idCanvas.toDataURL("image/png");

        const pw = pdf.internal.pageSize.getWidth() - 80;
        const ph = pdf.internal.pageSize.getHeight() - 80;
        const scale = Math.min(pw / 638, ph / 1016);

        const w = 638 * scale;
        const h = 1016 * scale;
        const x = (pdf.internal.pageSize.getWidth() - w) / 2;

        pdf.addImage(img, "PNG", x, 40, w, h);
        pdf.save(
          (document.getElementById("roll").value ||
            "IDCARD") + ".pdf"
        );
      }, 350);
    });

  /* RESET */
  document.getElementById("resetBtn").addEventListener("click", () => {
    document
      .querySelectorAll("#idcard-widget input")
      .forEach((i) => (i.value = ""));
    uploadedPhoto = null;
    drawCard();
  });

  /* INITIAL DRAW */
  drawCard();
}

/* ============================================
   FETCH EXISTING RECORD
============================================ */
function fetchRecord() {
  const roll = document.getElementById("roll").value.trim();
  if (!roll) return alert("Enter Roll Number");

  fetch(GAS_URL + "?roll=" + encodeURIComponent(roll))
    .then((r) => r.json())
    .then((data) => {
      if (data.status !== "found") return alert("No record found");

      document.getElementById("name").value = data.name;
      document.getElementById("contact").value = data.contact;
      document.getElementById("parentName").value = data.parentName;
      document.getElementById("parentContact").value = data.parentContact;
      document.getElementById("branch").value = data.branch;
      document.getElementById("blood").value = data.blood;

      document.getElementById("collegeSelect").value = data.college;

      if (
        data.college === "OLD_NIE" ||
        data.college === "OLD_NIST"
      ) {
        document.getElementById("courseOld").value = data.course;
      } else {
        document.getElementById("course").value = data.course;
      }

      if (data.photo) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          uploadedPhoto = img;
          drawCard();
        };
        img.src = data.photo;
      } else {
        uploadedPhoto = null;
      }

      document.getElementById("fetchBtn").style.display = "block";
      drawCard();
    });
}

