/* ============================================
   CONFIG
============================================ */
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbxgBHMWzOMlgOucyYEQFXWFoQ3oEMwpsIZjJHNx_w9cIIcU7TBe_icRyBsbIMO_qrf6/exec";

/* Backgrounds */
const BG_NIE = "https://iili.io/f9vffEv.png";
const BG_NIST = "https://iili.io/f9vfC2p.png";
const BG_OLD_NIE = "https://iili.io/fHuJnBS.png";
const BG_OLD_NIST = "https://iili.io/fHuqfSI.png";

/* Photo positions */
const photoNew = { x: 200, y: 220, width: 240, height: 240 };
const photoOld = { x: 412, y: 266, width: 188, height: 240 };

let uploadedPhoto = null;

function q(id) { return document.getElementById(id); }

/* ============================================
   FIELD SWITCHING (BRANCH removed for old)
============================================ */
function updateCollegeFields() {
  const col = q("collegeSelect").value;

  if (col === "OLD_NIE" || col === "OLD_NIST") {
    q("course").style.display = "none";
    q("courseOld").style.display = "block";
    q("blood").style.display = "block";
    q("branch").style.display = "none";    // ❌ BRANCH HIDDEN
  } else {
    q("course").style.display = "block";
    q("courseOld").style.display = "none";
    q("blood").style.display = "none";
    q("branch").style.display = "block";   // ✔ BRANCH VISIBLE
  }
}

/* ============================================
   DATA BUILDER  (BRANCH removed when old)
============================================ */
function getData() {
  const col = q("collegeSelect").value;

  return {
    college: col,
    name: q("name").value.trim(),
    roll: q("roll").value.trim(),
    course:
      col === "OLD_NIE" || col === "OLD_NIST"
        ? q("courseOld").value
        : q("course").value,
    blood: q("blood").value.trim(),
    branch:
      col === "OLD_NIE" || col === "OLD_NIST"
        ? ""                // ❌ NO BRANCH FOR OLD
        : q("branch").value.trim(),

    contact: q("contact").value.trim(),
    parentName: q("parentName").value.trim(),
    parentContact: q("parentContact").value.trim()
  };
}

/* ============================================
   DRAW CARD  (BRANCH removed when old)
============================================ */
function drawCard() {
  const c = q("idCanvas");
  const ctx = c.getContext("2d");
  const d = getData();

  let bg = BG_NIE;
  if (d.college === "NIST") bg = BG_NIST;
  if (d.college === "OLD_NIE") bg = BG_OLD_NIE;
  if (d.college === "OLD_NIST") bg = BG_OLD_NIST;

  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = () => {
    ctx.clearRect(0, 0, c.width, c.height);

    const scale = Math.max(c.width / img.width, c.height / img.height);
    const sw = c.width / scale;
    const sh = c.height / scale;
    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) / 2;

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);

    const New = {
      name: { x: 140, y: 512, color: "#EB490E", font: "bold 34px Segoe UI" },
      roll: { x: 250, y: 559, color: "#EB490E", font: "bold 30px Segoe UI" },
      course: { x: 170, y: 607, color: "#EB490E", font: "bold 30px Segoe UI" },
      branch: { x: 180, y: 655, color: "#EB490E", font: "bold 30px Segoe UI" },
      contact: { x: 255, y: 700, color: "#EB490E", font: "bold 30px Segoe UI" },
      parentName: { x: 262, y: 752, color: "#EB490E", font: "bold 30px Segoe UI" },
      parentContact: { x: 365, y: 802, color: "#EB490E", font: "bold 32px Segoe UI" }
    };

    const Old = {
      roll: { x: 170, y: 331, color: "#1B3A8A", font: "bold 32px Segoe UI" },
      course: { x: 150, y: 373, color: "#1B3A8A", font: "bold 32px Segoe UI" },
      blood: { x: 220, y: 416, color: "#1B3A8A", font: "bold 32px Segoe UI" },
      name: { y: 590, center: true, color: "#F02424", font: "bold 37px Segoe UI" },
      parentName: { x: 250, y: 665, color: "#1B3A8A", font: "bold 32px Segoe UI" },
      contact: { x: 240, y: 721, color: "#1B3A8A", font: "bold 32px Segoe UI" },
      parentContact: { x: 360, y: 772, color: "#1B3A8A", font: "bold 32px Segoe UI" }
    };

    const L = d.college === "OLD_NIE" || d.college === "OLD_NIST" ? Old : New;

    /* DRAW TEXT */
    for (let k in L) {
      const f = L[k];
      if (!d[k]) continue;

      ctx.font = f.font;
      ctx.fillStyle = f.color;

      if (f.center) {
        ctx.textAlign = "center";
        ctx.fillText(d[k], c.width / 2, f.y);
      } else {
        ctx.textAlign = "left";
        ctx.fillText(d[k], f.x, f.y);
      }
    }

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

      const iw = uploadedPhoto.width,
        ih = uploadedPhoto.height;
      const sc = Math.max(p.width / iw, p.height / ih);
      const sw2 = p.width / sc,
        sh2 = p.height / sc;
      const sx2 = (iw - sw2) / 2,
        sy2 = (ih - sh2) / 2;

      ctx.drawImage(uploadedPhoto, sx2, sy2, sw2, sh2, p.x, p.y, p.width, p.height);
      ctx.restore();
    }
  };

  img.src = bg;
}

/* ========== PHOTO UPLOAD ========== */
q("photoInput").addEventListener("change", e => {
  const f = e.target.files[0];
  if (!f) return;

  const r = new FileReader();
  r.onload = ev => {
    const img = new Image();
    img.onload = () => {
      uploadedPhoto = img;
      uploadedPhoto.base64 = ev.target.result;
      drawCard();
    };
    img.src = ev.target.result;
  };
  r.readAsDataURL(f);
});

/* ========== SAVE (to Sheets + Drive) ========== */
function saveToSheet() {
  const d = getData();

  const payload = {
    ...d,
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

/* ========== FETCH RECORD ========== */
function fetchRecord() {
  const roll = q("roll").value.trim();
  if (!roll) return alert("Enter Roll Number");

  fetch(GAS_URL + "?roll=" + encodeURIComponent(roll))
    .then(r => r.json())
    .then(j => {
      if (j.status !== "found") return alert("Not found");

      q("name").value = j.name;
      q("contact").value = j.contact;
      q("parentName").value = j.parentName;
      q("parentContact").value = j.parentContact;
      q("blood").value = j.blood;

      q("collegeSelect").value = j.college;

      if (j.college === "OLD_NIE" || j.college === "OLD_NIST")
        q("courseOld").value = j.course;
      else
        q("course").value = j.course;

      if (j.college === "OLD_NIE" || j.college === "OLD_NIST")
        q("branch").value = ""; // ❌ Old colleges have no branch
      else q("branch").value = j.branch;

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

/* ========== PRINT FIX ========== */
q("printBtn").onclick = () => {
  drawCard();
  setTimeout(() => {
    const w = window.open("");
    w.document.write(`<img src="${q("idCanvas").toDataURL()}" style="width:100%;max-width:600px">`);
    w.print();
  }, 300);
};

/* ========== PNG, PDF, RESET, PREVIEW ========== */
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
    .forEach(e => (e.value = ""));
  uploadedPhoto = null;
  drawCard();
};

["name","roll","branch","contact","parentName","parentContact","blood"].forEach(id => {
  q(id).addEventListener("input", drawCard);
});

["collegeSelect","course","courseOld"].forEach(id => {
  q(id).addEventListener("change", () => {
    updateCollegeFields();
    drawCard();
  });
});

window.drawIDCard = drawCard;

updateCollegeFields();
drawCard();
