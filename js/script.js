var WHATSAPP = "6592221935";
function parseCSV(text) {
  var rows = [], row = [], cell = "", quoted = false;
  for (var i = 0; i < text.length; i++) {
    var c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  var head = rows.shift().map(function (h) { return h.trim(); });
  return rows.filter(function (r) { return r.join("").trim(); }).map(function (r) {
    var o = {};
    head.forEach(function (h, i) { o[h] = (r[i] || "").trim(); });
    return o;
  });
}

function esc(t) {
  return String(t || "").replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function loadCSV(path) {
  return fetch(path).then(function (r) { return r.text(); }).then(parseCSV);
}

function showProperties(list) {
  const track = document.getElementById("portfolio-list");
  const prevBtn = document.getElementById("portfolio-prev");
  const nextBtn = document.getElementById("portfolio-next");
  const dotsContainer = document.getElementById("portfolio-dots");
  if (!track) return;
  if (!list.length) {
    track.innerHTML = '<div class="empty">Properties coming soon.</div>';
    if (dotsContainer) dotsContainer.innerHTML = "";
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }
  track.innerHTML = list.map(function (p) {
    const img = p.photo
      ? ' style="background-image:url(\'assets/photos/' + esc(p.photo) + '\')"'
      : "";

    return '<article class="card property-card">' +
      '<div class="photo"' + img + '>' +
      (p.tag ? '<span class="tag">' + esc(p.tag) + '</span>' : "") +
      '</div>' +
      '<div class="body">' +
      '<p class="meta">' + esc(p.meta) + '</p>' +
      '<h3>' + esc(p.title) + '</h3>' +
      '<div class="price">' + esc(p.price) + '</div>' +
      '<p>' + esc(p.text) + '</p>' +
      '</div></article>';
  }).join("");
  initPortfolioCarousel();
}

function initPortfolioCarousel() {
  const track = document.getElementById("portfolio-list");
  const viewport = document.querySelector(".portfolio-viewport");
  const prevBtn = document.getElementById("portfolio-prev");
  const nextBtn = document.getElementById("portfolio-next");
  const dotsContainer = document.getElementById("portfolio-dots");

  if (!track || !viewport || !prevBtn || !nextBtn) return;

  const cards = Array.from(track.querySelectorAll(".property-card"));
  let currentPage = 0;
  let visibleCards = 3;
  let totalPages = 1;

  if (cards.length === 0) return;

  function updateLayout() {
    if (window.innerWidth <= 600) {
      visibleCards = 1;
    } else if (window.innerWidth <= 900) {
      visibleCards = 2;
    } else {
      visibleCards = 3;
    }

    totalPages = Math.max(
      1,
      Math.ceil(cards.length / visibleCards)
    );

    currentPage = Math.min(currentPage, totalPages - 1);

    dotsContainer.innerHTML = "";

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement("button");

      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `Go to page ${i + 1}`);
      dot.addEventListener("click", () => {
        currentPage = i;
        updateCarousel();
      });

      dotsContainer.appendChild(dot);
    }

    updateCarousel();
  }

  function updateCarousel() {
    const cardWidth = cards[0].getBoundingClientRect().width;
    const trackStyle = getComputedStyle(track);
    const gap = parseFloat(trackStyle.gap) || 0;

    const offset = currentPage * visibleCards * (cardWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;

    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages - 1;

    Array.from(dotsContainer.children).forEach((dot, i) => {
      dot.classList.toggle("active", i === currentPage);
      dot.setAttribute("aria-current",
        i === currentPage ? "true" : "false"
      );
    });
  }

  prevBtn.addEventListener("click", () => {
    if (currentPage > 0) {
      currentPage--;
      updateCarousel();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages - 1) {
      currentPage++;
      updateCarousel();
    }
  });

  window.addEventListener("resize", updateLayout);

  updateLayout();
}



function showVideos(list) {
  var box = document.getElementById("video-list");

  if (!list.length) {
    box.innerHTML = '<div class="empty">Videos coming soon.</div>';
    return;
  }

  box.innerHTML = list.map(function (v, index) {
    var cover = v.cover
      ? "assets/photos/" + esc(v.cover)
      : "";

    var isLink = /^https?:\/\//i.test(v.file);

    var media = isLink
      ? '<a class="photo video-preview" href="' + esc(v.file) +
        '" target="_blank" rel="noopener noreferrer" aria-label="Watch video">' +
        '<img src="' + cover + '" alt="' + esc(v.title) + '" loading="lazy">' +
        '<span class="play">&#9654;</span></a>'
      : '<div class="photo video-preview" data-video="assets/videos/' +
        esc(v.file) + '">' +
        '<img src="' + cover + '" alt="' + esc(v.title) + '" loading="lazy">' +
        '<button class="play" type="button" aria-label="Play ' +
        esc(v.title) + '">&#9654;</button></div>';

    return '<article class="card vcard">' +
      media +
      '<div class="body">' +
      '<p class="meta">' + esc(v.label) + '</p>' +
      '<h3>' + esc(v.title) + '</h3>' +
      '<p>' + esc(v.description) + '</p>' +
      '</div></article>';
  }).join("");

  box.querySelectorAll(".video-preview[data-video]").forEach(function (preview) {
    preview.querySelector(".play").addEventListener("click", function () {
      var video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.poster = preview.querySelector("img").src;

      var source = document.createElement("source");
      source.src = preview.dataset.video;
      source.type = "video/mp4";
      video.appendChild(source);

      preview.replaceWith(video);
      video.classList.add("video-player");
      video.play();
    });
  });
}


loadCSV("data/properties.csv").then(showProperties).catch(function () { showProperties([]); });
loadCSV("data/videos.csv").then(showVideos).catch(function () { showVideos([]); });

document.getElementById("valuation-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var d = Object.fromEntries(new FormData(e.target).entries());
  var msg = "Hi Kasper, I would like a property review.\nName: " + d.name + "\nMobile: " + d.phone +
    "\nType: " + d.type + "\nProperty: " + d.property + "\nSize: " + (d.size || "-") +
    "\nBedrooms: " + (d.beds || "-") + "\nNotes: " + (d.notes || "-");
  window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
});


document.addEventListener("DOMContentLoaded", () => {
  const revealElements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  revealElements.forEach((element) => {
    observer.observe(element);
  });
});
