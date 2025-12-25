document.addEventListener("DOMContentLoaded", async () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        } else {
          entry.target.classList.remove("show");
        }
      });
    },
    {
      threshold: 0.35,
      rootMargin: "0px 0px -10% 0px", // smoother trigger
    }
  );

  function observeReveals() {
    document.querySelectorAll(".reveal").forEach((el) => {
      observer.observe(el);
    });
  }

  observeReveals();

  // expose for dynamically added images
  window.observeReveals = observeReveals;

  const lines = document.querySelectorAll(".love-poem p");
  await loadWishes();
  await loadGallery();
  lines.forEach((line) => observer.observe(line));
});
/* ===== QOUTE ANIMATE ===== */
const el = document.getElementById("animatedText");
const raw = el.textContent;
el.textContent = "";

const seg =
  "Segmenter" in Intl
    ? new Intl.Segmenter("km", { granularity: "word" })
    : null;

const parts = seg
  ? Array.from(seg.segment(raw), (s) => s.segment)
  : raw.split(/(\s+)/); // fallback

let delayIndex = 0;

parts.forEach((part) => {
  if (part === "\n") {
    el.appendChild(document.createElement("br"));
    return;
  }

  // keep spaces as normal (don’t animate)
  if (/^\s+$/.test(part)) {
    el.appendChild(document.createTextNode(part));
    return;
  }

  const span = document.createElement("span");
  span.className = "w";
  span.textContent = part;
  span.style.animationDelay = `${delayIndex * 0.08}s`; // speed
  el.appendChild(span);

  delayIndex++;
});
/* ===== IMAGE MODAL ===== */
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");

document.querySelectorAll(".gallery img").forEach((img) => {
  img.onclick = () => {
    modal.classList.add("active");
    modalImg.src = img.src;
  };
});

// khmer Number
function toKhmerNumber(value) {
  const kh = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
  return String(value).replace(/\d/g, (d) => kh[d]);
}

function fmt(val, pad2 = true) {
  const s = pad2 ? String(val).padStart(2, "0") : String(val);
  return toKhmerNumber(s);
}

modal.onclick = () => modal.classList.remove("active");

/* ===== COUNTDOWN TIMER ===== */
// Cambodia timezone (UTC+7)
const weddingDate = new Date("2026-06-26T00:00:00+07:00").getTime();

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const messageEl = document.getElementById("weddingMessage");
const musicEl = document.getElementById("bgMusic");

function updateCountdown() {
  const now = Date.now();
  const distance = weddingDate - now;

  if (distance <= 0) {
    document.querySelector(".countdown").style.display = "none";
    messageEl.textContent = "❤️ យើងកំពុងរៀបអាពាហ៍ពិពាហ៍! 💍";
    messageEl.style.fontSize = "1.2rem";
    if (musicEl) musicEl.play().catch(() => {});
    clearInterval(timer);
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  daysEl.textContent = fmt(days, false); // days usually not padded
  hoursEl.textContent = fmt(hours);
  minutesEl.textContent = fmt(minutes);
  secondsEl.textContent = fmt(seconds);

  const pairs = [
    [daysEl, days, false],
    [hoursEl, hours, true],
    [minutesEl, minutes, true],
    [secondsEl, seconds, true],
  ];

  pairs.forEach(([el, val, pad2]) => {
    const newText = fmt(val, pad2);
    if (el.textContent !== newText) {
      el.textContent = newText;
      el.style.animation = "none";
      el.offsetHeight; // reflow
      el.style.animation = "fadeIn 0.5s ease forwards";
    }
  });
}

updateCountdown();
const timer = setInterval(updateCountdown, 1000);

/* ===== Gallery Load Image ===== */
async function loadGallery() {
  const gallery = document.getElementById("gallery");
  const imageFolder = "/assets/collections/";
  const imagesPerGroup = 2;
  const res = await fetch("/assets/manifest.json");
  const data = await res.json();

  for (let i = 0; i < data.images.length; i += imagesPerGroup) {
    const group = document.createElement("div");
    group.className = "gallery-item";

    data.images.slice(i, i + imagesPerGroup).forEach((file) => {
      const img = document.createElement("img");
      img.src = imageFolder + file;
      img.loading = "lazy";

      img.onclick = () => {
        modal.classList.add("active");
        modalImg.src = img.src;
      };

      group.appendChild(img);
    });

    gallery.appendChild(group);
  }
}

// setDefault Message
let defaultMessage = `💐 Congratulations To Eang Tithsophorn & Vun Dalin 💍`;
let dataWishList = [];

// Close modal
modal.addEventListener("click", () => modal.classList.remove("active"));

// ===== Elements =====
const congratsBtn = document.getElementById("congratsBtn");
const wishModal = document.getElementById("wishModal");
const wishClose = document.getElementById("wishClose");
const wishText = document.getElementById("wishText");
const wishSend = document.getElementById("wishSend");

const wishRandom = document.getElementById("wishRandom");

// Get one random message
function getRandomMessage() {
  return dataWishList[Math.floor(Math.random() * dataWishList.length)];
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Load wish
async function loadWishes() {
  const res = await fetch("/assets/manifest.json");
  const data = await res.json();
  const khmerWishes = data.words || [];
  const englishWishes = data.wordsEnglish || [];
  dataWishList = khmerWishes.concat(englishWishes);
  shuffleArray(dataWishList);
  defaultMessage = getRandomMessage();
}

// On click → insert random message
wishRandom.addEventListener("click", () => {
  wishText.value = getRandomMessage();
  // enable send button if you use disable logic
  if (typeof toggleSendButton === "function") {
    toggleSendButton();
  }

  wishText.focus();
});

// Open modal
congratsBtn.addEventListener("click", (e) => {
  e.preventDefault();
  wishModal.classList.add("active");
  wishModal.setAttribute("aria-hidden", "false");

  if (dataWishList.length > 0) {
    wishText.value = getRandomMessage();
  } else {
    wishText.value = defaultMessage;
  }
  toggleSendButton?.();
  setTimeout(() => {
    wishText.focus();
    wishText.setSelectionRange(wishText.value.length, wishText.value.length);
  }, 20);
});

// Close modal (X)
wishClose.addEventListener("click", () => closeWishModal());

// Close modal (click outside card)
wishModal.addEventListener("click", (e) => {
  if (e.target === wishModal) closeWishModal();
});

function toggleSendButton() {
  const hasText = wishText.value.trim().length > 0;
  wishSend.disabled = !hasText;
}

// run when user types
wishText.addEventListener("input", toggleSendButton);
// Close modal (Esc)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && wishModal.classList.contains("active")) {
    closeWishModal();
  }
});

function closeWishModal() {
  wishModal.classList.remove("active");
  wishModal.setAttribute("aria-hidden", "true");
}

// Send message
wishSend.addEventListener("click", () => {
  const text = wishText.value.trim();
  if (!text) {
    wishText.focus();
    return;
  }

  wishSend.disabled = true;
  wishSend.textContent = "កំពុងផ្ញើរ...";

  const telegramBotToken = "8463447682:AAFOE_gow0ihmh7tG31cGCdQXq_BidlSj44";
  const groupID = "-1003268717262";
  const messageThreadId = ""; // optional
  // Fire-and-forget (no response needed)
  fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: groupID,
      message_thread_id: messageThreadId || undefined,
      text: text,
    }),
  }).finally(() => {
    wishSend.disabled = false;
    wishSend.textContent = "ផ្ញើរ";
    closeWishModal();

    // nice feedback
    congratsBtn.textContent = "💖 អរគុណច្រើន!";
    congratsBtn.style.pointerEvents = "none";
    congratsBtn.style.opacity = "0.75";
  });
});

async function loadAgenda() {
  try {

    const htmlRes = await fetch("./components/wedding-agenda.html");
    document.getElementById("agenda").innerHTML = await htmlRes.text();


    const dataRes = await fetch("assets/manifest.json");
    const data = await dataRes.json();


    renderAgenda(data.agenda);

  } catch (err) {
    console.error(err);
    document.getElementById("agenda").innerHTML =
      "<p style='color:#d7c38a'>Failed to load agenda</p>";
  }
}

loadAgenda();

function connectorHTML() {
  return `
    <div class="connector" aria-hidden="true">
      <div class="seg"></div>
      <div class="kbach">
        <span class="top"></span>
        <span class="bottom"></span>
        <i class="left"></i>
        <i class="right"></i>
      </div>
      <div class="seg"></div>
    </div>
  `;
}

function stopHTML(item) {
  const compactClass = item.compact ? " compact" : "";
  return `
    <div class="stop${compactClass}">
      <div class="time">${item.time}</div>
      <div class="desc">${item.desc}</div>
    </div>
  `;
}

function locationHTML(item) {
  return `
    <div class="location">
      <div class="time">${item.time}</div>
      <div class="place">${item.place}</div>
      <div class="addr">${item.addr}</div>
      ${item.note ? `<div class="note">${item.note}</div>` : ""}
    </div>
  `;
}

function renderAgenda(list) {
  const timeline = document.getElementById("timeline");
  if (!timeline) {
    console.error("No #timeline found (agenda HTML not loaded yet).");
    return;
  }

  timeline.innerHTML = "";
  list.forEach((item, index) => {
    if (item.type === "stop") timeline.insertAdjacentHTML("beforeend", stopHTML(item));
    else if (item.type === "location") timeline.insertAdjacentHTML("beforeend", locationHTML(item));

    if (index !== list.length - 1) timeline.insertAdjacentHTML("beforeend", connectorHTML());
  });
}