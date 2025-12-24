document.addEventListener("DOMContentLoaded", () => {
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
    messageEl.textContent = "❤️ We’re getting married! ❤️";
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

  daysEl.textContent = days;
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");

  // Animate only when value changes
  const pairs = [
    [daysEl, days],
    [hoursEl, hours],
    [minutesEl, minutes],
    [secondsEl, seconds],
  ];

  pairs.forEach(([el, val]) => {
    if (el.textContent !== String(val).padStart(2, "0")) {
      el.textContent = String(val).padStart(2, "0");
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
  const imageFolder = "/assests/collections/";
  const imagesPerGroup = 2;
  const res = await fetch("/assests/manifest.json");
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
loadGallery();

// setDefault Message

// Close modal
modal.addEventListener("click", () => modal.classList.remove("active"));

const TELEGRAM_BOT_TOKEN = "8463447682:AAFOE_gow0ihmh7tG31cGCdQXq_BidlSj44";
const CHAT_ID = "-1003268717262";
const MESSAGE_THREAD_ID = ""; // optional

// ===== Elements =====
const congratsBtn = document.getElementById("congratsBtn");
const wishModal = document.getElementById("wishModal");
const wishClose = document.getElementById("wishClose");
const wishText = document.getElementById("wishText");
const wishSend = document.getElementById("wishSend");

const DEFAULT_MESSAGE = `💐 Congratulations To Eang Tithsophorn & Vun Dalin 💍`;

// Open modal
congratsBtn.addEventListener("click", (e) => {
  e.preventDefault();
  wishModal.classList.add("active");
  wishModal.setAttribute("aria-hidden", "false");

  wishText.value = DEFAULT_MESSAGE;
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
  wishSend.textContent = "Sending...";

  // Fire-and-forget (no response needed)
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      message_thread_id: MESSAGE_THREAD_ID || undefined,
      text: text,
    }),
  }).finally(() => {
    wishSend.disabled = false;
    wishSend.textContent = "Send";
    closeWishModal();

    // nice feedback
    congratsBtn.textContent = "💖 Thanks!";
    congratsBtn.style.pointerEvents = "none";
    congratsBtn.style.opacity = "0.75";
  });
});

 document.addEventListener("DOMContentLoaded", () => {
    const lines = document.querySelectorAll(".love-poem p");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          } else {
            entry.target.classList.remove("show"); // animate again on scroll back
          }
        });
      },
      { threshold: 0.4 }
    );

    lines.forEach((line) => observer.observe(line));
  });