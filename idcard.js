/* ============================================
   GOOGLE APPS SCRIPT URL
============================================ */
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbxgBHMWzOMlgOucyYEQFXWFoQ3oEMwpsIZjJHNx_w9cIIcU7TBe_icRyBsbIMO_qrf6/exec";

/* BACKGROUND IMAGES (original) */
const BG_NIE = "https://iili.io/f9vffEv.png";
const BG_NIST = "https://iili.io/f9vfC2p.png";
const BG_OLD_NIE = "https://iili.io/fHuJnBS.png";
const BG_OLD_NIST = "https://iili.io/fHuqfSI.png";

/* PHOTO POSITIONS (original) */
const photoNew = { x: 200, y: 220, width: 240, height: 240 };
const photoOld = { x: 412, y: 266, width: 188, height: 240 };

let uploadedPhoto = null;

function q(id) { return document.getElementById(id); }

/* ============================================
   FIELD SWITCHING (ONLY CHANGE: hide BRANCH)
============================================ */
function updateCollegeFields() {

  const col = q("collegeSelect").value;

  if (col === "OLD_NIE" || col === "OLD_NIST") {

    q("course").style.display = "none";
    q("courseOld").style.display = "block";
    q("blood").style.display = "block";

    q("branch").style.display = "none";      // ❗ BRANCH HIDDEN

  } else {

    q("course").style.display = "block";
    q("courseOld").style.display = "none";
    q("blood").style.display = "none";

    q("branch").style.display = "block";     // ✔ BRANCH VISIBLE

  }
}

/* ============================================
   GET ALL FORM DATA
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

    branch: (col === "OLD_NIE" || col === "OLD_NIST")
      ? "" // ❗ Old college → no branch
      : q("branch").value.trim(),

    contact: q("contact").value.trim(),
    parentName: q("parentName").value.trim(),
    parentContact: q("parentContact").value.trim()
  };
}

/* ============================================
   DRAW CARD (ORIGINAL LAYOUTS)
============================================ */
function drawCard() {
  const c = q("idCanvas");
  const ctx = c.getContext("2d");
  const d = getData();

  /* Select BG */
  let bg = BG_NIE;
  if (d.college === "NIST") bg = BG_NIST;
  if (d.college === "OLD_NIE") bg = BG_OLD_NIE;
  if (d.college === "OLD_NIST") bg = BG_OLD_NIST;

  const bgImg = new Image();
  bgImg.crossOrigin = "anonymous";

  bgImg.onload = () => {

    ctx.clearRect(0, 0, c.width, c.height);

    // Center crop BG
    const scale = Math.max(c.width / bgImg.width, c.height / bgImg.height);
    const sw = c.width / scale;
    const sh = c.height / scale;
    const sx = (bgImg.width - sw) / 2;
    const sy = (bgImg.height - sh) / 2;

    ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, c.width, c.height);

    /* ORIGINAL NEW COLLEGE LAYOUT */
    const New = {
      name: { x: 140, y: 512, font: "bold 34px Segoe UI", color: "#EB490E" },
      roll: { x: 250, y: 559, font: "bold 30px Segoe UI", color: "#EB490E" },
      course: { x: 170, y: 607, font: "bold 30px Segoe UI", color: "#EB490E" },
      branch: { x: 180, y: 655, font: "bold 30px Segoe UI", color: "#EB490E" },
      contact: { x: 255, y: 700, font: "bold 30px Segoe UI", color: "#EB490E" },
      parentName: { x: 262, y: 752, font: "bold 30px Segoe UI", color: "#EB490E" },
      parentContact: { x: 365, y: 802, font: "bold 32px Segoe UI", color: "#EB490E" }
    };

    /* ORIGINAL OLD COLLEGE LAYOUT */
    const Old = {
      roll: { x: 170, y: 331, font: "bold 32px Segoe UI", color: "#1B3A8A" },
      course: { x: 150, y: 373, font: "bold 32px Segoe UI", color: "#1B3A8A" },
      blood: { x: 220, y: 416, font: "bold 32px Segoe UI", color: "#1B3A8A" },
      name: { center: true, y: 590, font: "bold 37px Segoe UI", color: "#F02424" },
      parentName: { x: 250, y: 665, font: "bold 32px Segoe UI", color: "#1B3A8A" },
      contact: { x: 240, y: 721, font: "bold 32px Segoe UI", color: "#1B3A8A" },
      parentContact: { x: 360, y: 772, font: "bold 32px Segoe UI", color: "#1B3A8A" }
    };

    const layout =
      d.college === "OLD_NIE" || d.college === "OLD_NIST" ? Old : New;

    /* Draw each text element */
    Object.keys(layout).forEach(k => {
      if (!d[k]) return;

      const f = layout[k];
      ctx.font = f.font;
      ctx.fillStyle = f.color;

      if (f.center) {
        ctx.textAlign = "center";
        ctx.fillText(d[k], c.width / 2, f.y);
      } else {
        ctx.textAlign = "left";
        ctx.fillText(d[k], f.x, f.y);
      }
    });

    /* Draw Photo */
    if (uploadedPhoto) {
      const p =
        d.college === "OLD_NIE" || d.college === "OLD_NIST"
          ? photoOld
          : photoNew;

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
   PHOTO UPLOAD (original)
============================================ */
q("photoInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      uploadedPhoto = img;
      uploadedPhoto.base64 = ev.target.result;
      drawCard();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

/* ============================================
   SAVE TO GOOGLE SHEETS (original)
============================================ */
function saveToSheet() {
  const data = getData();

  const payload = {
    ...data,
    photoBase64: uploadedPhoto ? uploadedPhoto.base64 : ""
  };

  fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(r => r.json())
    .then(j => alert(j.status))
    .catch(() => alert("Save failed"));
}

/* ============================================
   FETCH RECORD (original)
============================================ */
function fetchRecord() {
  const roll = q("roll").value.trim();
  if (!roll) return alert("Enter roll number");

  fetch(GAS_URL + "?roll=" + encodeURIComponent(roll))
    .then(r => r.json())
    .then(j => {
      if (j.status !== "found") return alert("No record found");

      q("name").value = j.name;
      q("contact").value = j.contact;
      q("parentName").value = j.parentName;
      q("parentContact").value = j.parentContact;
      q("blood").value = j.blood;
      q("collegeSelect").value = j.college;

      if (j.college === "OLD_NIE" || j.college === "OLD_NIST") {
        q("courseOld").value = j.course;
        q("branch").value = "";   // ❗ no branch for old
      } else {
        q("course").value = j.course;
        q("branch").value = j.branch;
      }

      if (j.photo) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          uploadedPhoto = img;
          drawCard();
        };
        img.src = j.photo;
      }

      updateCollegeFields();
      drawCard();
    });
}

/* ========== PRINT BUTTON (original fix) ========== */
q("printBtn").onclick = () => {
  drawCard();
  setTimeout(() => {
    const data = q("idCanvas").toDataURL("image/png");
    const w = window.open("");
    w.document.write(`<img src="${data}" style="width:100%;max-width:600px">`);
    w.print();
  }, 300);
};

/* PNG, PDF, RESET unchanged */
q("downloadPngBtn").onclick = () => {
  drawCard();
  setTimeout(() => {
    const a = q("dlink");
    a.href = q("idCanvas").toDataURL();
    a.download = (q("roll").value || "ID") + ".png";
    a.click();
  }, 300);
};

q("downloadPdfBtn").onclick = () => {
  drawCard();
  setTimeout(() => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "pt", "a4");
    pdf.addImage(q("idCanvas").toDataURL(), "PNG", 20, 20, 400, 640);
    pdf.save((q("roll").value || "ID") + ".pdf");
  }, 300);
};

q("generateBtn").onclick = saveToSheet;

q("resetBtn").onclick = () => {
  document.querySelectorAll("#idcard-widget-container input")
    .forEach(i => (i.value = ""));
  uploadedPhoto = null;
  drawCard();
};

["name","roll","branch","contact","parentName","parentContact","blood"]
  .forEach(id => q(id).addEventListener("input", drawCard));

["collegeSelect","course","courseOld"]
  .forEach(id => q(id).addEventListener("change", () => {
    updateCollegeFields();
    drawCard();
  }));

/* EXPORT */
window.drawIDCard = drawCard;

/* INIT */
updateCollegeFields();
drawCard();
