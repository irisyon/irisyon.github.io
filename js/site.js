/* ============================================================
   site.js — the gallery experience
   mobile nav · scroll-snap gallery · blur-up · custom cursor ·
   magnetic buttons · inspection lightbox
   Degrades gracefully (no JS / touch / reduced motion).
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(pointer: fine)").matches;

  function $(s, c) { return (c || document).querySelector(s); }
  function $all(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function pad(n) { return String(n).padStart(2, "0"); }
  function tinyPath(src) { return src.replace("assets/works/", "assets/works/tiny/"); }
  function fullPath(src) { return src.replace("assets/works/", "assets/works/full/"); }
  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = $(".nav__toggle"), nav = $("#primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") nav.classList.remove("is-open"); });
  }

  /* ---------- Footer year ---------- */
  var yr = $("[data-year]"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Projects: tab switcher + live tool embeds ---------- */
  var projTabs = $("[data-proj-tabs]");
  if (projTabs) {
    var projPanels = $all(".proj-panel");
    var showProj = function (key) {
      $all(".proj-tab", projTabs).forEach(function (t) {
        var on = t.getAttribute("data-proj") === key;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      projPanels.forEach(function (p) {
        var on = p.getAttribute("data-panel") === key;
        p.hidden = !on;
        p.classList.toggle("is-active", on);
      });
    };
    $all(".proj-tab", projTabs).forEach(function (tab) {
      tab.addEventListener("click", function () {
        var key = tab.getAttribute("data-proj");
        showProj(key);
        try { history.replaceState(null, "", "#" + key); } catch (e) {}
      });
    });
    var hk = (location.hash || "").replace("#", "");
    if (hk && $('.proj-tab[data-proj="' + hk + '"]', projTabs)) showProj(hk);
  }

  // click-to-load the embedded Synapse suite — keeps the page completely light until the user asks for it
  var embedFrame = $("[data-embed-frame]");
  if (embedFrame && embedFrame.getAttribute("data-src")) {
    var embedWrap = embedFrame.closest(".embed__frame");
    var loadEmbed = function () {
      if (!embedFrame.getAttribute("src")) {
        embedFrame.setAttribute("src", embedFrame.getAttribute("data-src"));
        if (embedWrap) embedWrap.classList.add("is-on");
      }
    };
    if (embedWrap) embedWrap.addEventListener("click", loadEmbed, { once: true });
  }

  /* ---------- Lazy-load + autoplay the output video only when it nears the viewport ---------- */
  var lazyVid = $("[data-lazy-video]");
  if (lazyVid) {
    var vsrc = $("source", lazyVid);
    var startVid = function () {
      if (vsrc && vsrc.getAttribute("data-src") && !vsrc.getAttribute("src")) {
        vsrc.setAttribute("src", vsrc.getAttribute("data-src"));
        lazyVid.load();
        var pr = lazyVid.play(); if (pr && pr.catch) pr.catch(function () {});
      }
    };
    if ("IntersectionObserver" in window) {
      var vio = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { if (e.isIntersecting) { startVid(); vio.disconnect(); } });
      }, { rootMargin: "300px" });
      vio.observe(lazyVid);
    } else { startVid(); }
  }

  /* ---------- Contact form (sends straight to the inbox via Web3Forms) ---------- */
  var cform = $("[data-contact-form]");
  if (cform) {
    cform.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = $("[data-form-note]", cform);
      var btn = cform.querySelector(".btn");
      var key = ((cform.access_key && cform.access_key.value) || "").trim();
      var email = (cform.email.value || "").trim();
      var subject = (cform.subject && cform.subject.value || "").trim() || "New message from your portfolio";
      var message = (cform.message.value || "").trim();
      if (!email || !message) return;
      if (!key || /REPLACE/i.test(key)) {
        if (note) note.textContent = "form isn't connected yet — add your Web3Forms key (see README).";
        return;
      }
      if (note) { note.textContent = "sending…"; note.className = "contact-form__note"; }
      if (btn) btn.disabled = true;
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          access_key: key,
          subject: subject,
          from_name: "Portfolio — " + email,
          replyto: email,
          email: email,
          message: message,
          botcheck: cform.botcheck ? cform.botcheck.checked : false
        })
      }).then(function (r) { return r.json(); }).then(function (data) {
        if (data && data.success) {
          if (note) { note.textContent = "✓ thanks — your message is on its way to my inbox."; note.className = "contact-form__note is-ok"; }
          cform.reset();
          if (btn) btn.textContent = "sent ✓";   // leave disabled as a clear confirmation
        } else {
          if (note) { note.textContent = "couldn't send — please email irisyon@berkeley.edu directly."; note.className = "contact-form__note is-err"; }
          if (btn) btn.disabled = false;
        }
      }).catch(function () {
        if (note) { note.textContent = "couldn't send — please email irisyon@berkeley.edu directly."; note.className = "contact-form__note is-err"; }
        if (btn) btn.disabled = false;
      });
    });
  }

  /* ---------- Lightbox data (from ARTWORKS, else from the page) ---------- */
  var lbWorks = window.ARTWORKS
    ? window.ARTWORKS.map(function (a) {
        return {
          display: a.img, full: fullPath(a.img),
          title: a.title + (a.year && a.year !== "n.d." ? ", " + a.year : ""),
          sub: [a.medium, a.size].filter(Boolean).join("   ·   "),
          alt: a.title
        };
      })
    : $all(".frame__art").map(function (img) {
        return {
          display: img.getAttribute("src"), full: fullPath(img.getAttribute("src")),
          title: img.getAttribute("data-title") || "", sub: img.getAttribute("data-sub") || "",
          alt: img.alt || ""
        };
      });

  var openLightbox = function () {};

  /* ---------- Inspection lightbox ---------- */
  if (lbWorks.length) {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML =
      '<button class="lightbox__close" aria-label="Close">&times;</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" aria-label="Previous">&#8249;</button>' +
      '<button class="lightbox__nav lightbox__nav--next" aria-label="Next">&#8250;</button>' +
      '<div class="lightbox__stage"><img class="lightbox__img" alt=""></div>' +
      '<div class="lightbox__bar">' +
        '<p class="lightbox__counter"></p>' +
        '<p class="lightbox__cap"></p>' +
        '<p class="lightbox__hint">Click image to zoom &middot; &larr; &rarr; to browse</p>' +
      "</div>";
    document.body.appendChild(box);

    var lbImg = $(".lightbox__img", box), lbCap = $(".lightbox__cap", box),
        lbCount = $(".lightbox__counter", box), lbStage = $(".lightbox__stage", box);
    var cur = 0, zoomed = false, single = lbWorks.length < 2;
    $(".lightbox__nav--prev", box).style.display = single ? "none" : "";
    $(".lightbox__nav--next", box).style.display = single ? "none" : "";

    function show(i) {
      cur = (i % lbWorks.length + lbWorks.length) % lbWorks.length;
      var w = lbWorks[cur];
      setZoom(false);
      lbImg.src = w.display;
      lbImg.alt = w.alt;
      var pre = new Image();
      pre.onload = function () { if (lbWorks[cur] === w) lbImg.src = w.full; };
      pre.src = w.full;
      lbCap.innerHTML = w.title ? "<b>" + esc(w.title) + "</b>" + (w.sub ? "<br>" + esc(w.sub) : "") : "";
      lbCount.textContent = single ? "" : pad(cur + 1) + " / " + pad(lbWorks.length);
    }
    function setZoom(on, e) {
      zoomed = !!on;
      lbImg.classList.toggle("is-zoomed", zoomed);
      box.classList.toggle("is-zoomed", zoomed);
      if (!zoomed) lbImg.style.transform = ""; else pan(e);
    }
    function pan(e) {
      if (!zoomed || !e) return;
      var r = lbStage.getBoundingClientRect(), s = 2.3;
      var px = clamp((e.clientX - r.left) / r.width, 0, 1), py = clamp((e.clientY - r.top) / r.height, 0, 1);
      lbImg.style.transform = "translate(" + ((0.5 - px) * r.width * (s - 1) / s) + "px," +
                              ((0.5 - py) * r.height * (s - 1) / s) + "px) scale(" + s + ")";
    }
    var idleTimer;
    function poke() {
      box.classList.remove("is-idle");
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () { if (box.classList.contains("is-open")) box.classList.add("is-idle"); }, 2400);
    }
    box.addEventListener("mousemove", poke);
    openLightbox = function (i) {
      show(i || 0);
      box.classList.add("is-open");
      document.body.style.overflow = "hidden";
      root.classList.remove("cursor-on");
      poke();
    };
    function close() {
      box.classList.remove("is-open", "is-idle");
      clearTimeout(idleTimer);
      document.body.style.overflow = "";
      if (fine && !reduce) root.classList.add("cursor-on");
      setZoom(false);
    }
    $(".lightbox__nav--prev", box).addEventListener("click", function (e) { e.stopPropagation(); show(cur - 1); });
    $(".lightbox__nav--next", box).addEventListener("click", function (e) { e.stopPropagation(); show(cur + 1); });
    $(".lightbox__close", box).addEventListener("click", close);
    lbImg.addEventListener("click", function (e) { e.stopPropagation(); setZoom(!zoomed, e); });
    lbStage.addEventListener("mousemove", pan);
    box.addEventListener("click", function (e) { if (e.target === box || e.target === lbStage) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft" && !single) show(cur - 1);
      else if (e.key === "ArrowRight" && !single) show(cur + 1);
    });
    var tsx = 0;
    lbStage.addEventListener("touchstart", function (e) { tsx = e.touches[0].clientX; }, { passive: true });
    lbStage.addEventListener("touchend", function (e) {
      if (zoomed || single) return;
      var dx = e.changedTouches[0].clientX - tsx;
      if (Math.abs(dx) > 50) show(dx < 0 ? cur + 1 : cur - 1);
    });
  }

  /* ---------- Gallery: scroll-snap through the works (image left / info right) ---------- */
  var sliderMount = $("[data-slider]");
  if (sliderMount && window.ARTWORKS && window.ARTWORKS.length) {
    var startW = parseInt(new URLSearchParams(location.search).get("w"), 10);
    buildSlider(sliderMount, window.ARTWORKS, isNaN(startW) ? 0 : startW);
  } else {
    $all(".frame__art").forEach(function (img, i) {
      img.addEventListener("click", function () { openLightbox(i); });
    });
  }

  function buildSlider(mount, works, start) {
    var n = works.length;
    // show works at relative real-world scale (largest painting reads biggest)
    var longs = works.map(function (w) {
      var m = /([\d.]+)\s*[×x]\s*([\d.]+)\s*in/i.exec(w.size || "");
      return m ? Math.max(parseFloat(m[1]), parseFloat(m[2])) : 0;
    });
    var maxLong = Math.max.apply(null, longs.filter(Boolean).concat([1]));
    var scales = works.map(function (w, i) {
      return w.scale != null ? w.scale : (longs[i] ? Math.max(0.44, longs[i] / maxLong) : 1);
    });
    function applyBorder(img, b) {
      var drop = "0 22px 55px rgba(13,13,12,0.16)";
      if (b && b.mat) {
        img.style.border = (b.matW || 16) + "px solid " + b.mat;
        img.style.boxShadow = (b.frame ? "0 0 0 " + (b.frameW || 7) + "px " + b.frame + ", " : "") + drop;
      } else if (b && b.frame) {
        img.style.border = (b.frameW || 8) + "px solid " + b.frame;
        if (b.frameTopW != null) img.style.borderTopWidth = b.frameTopW + "px";
        img.style.boxShadow = drop;
      } else { img.style.border = "0"; img.style.boxShadow = drop; }
    }
    function indexHtml(active) {
      return works.map(function (w, i) {
        return '<button class="gv__ix' + (i === active ? " is-active" : "") + '" data-i="' + i + '">' +
          '<span class="n">' + pad(i + 1) + '</span><span class="t">' + esc(w.title) + "</span></button>";
      }).join("");
    }
    var cue = '<svg width="14" height="20" viewBox="0 0 14 20" fill="none" stroke="currentColor" ' +
      'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 1v14M2 10l5 5 5-5"/></svg>';

    // one full-screen section per work — image left, info right
    mount.innerHTML = works.map(function (w, i) {
      var meta = [w.medium, w.size].filter(Boolean).join("  /  ");
      var title = esc(w.title) + (w.year && w.year !== "n.d." ? ' <span>' + esc(w.year) + "</span>" : "");
      var sub = [w.medium, w.size].filter(Boolean).join("   ·   ");
      return '<section class="gv__work" data-i="' + i + '">' +
          '<div class="gv__stage">' +
            '<img class="gv__art" decoding="async" alt="' + esc(w.title) + '"' +
              ' data-title="' + esc(w.title) + '" data-sub="' + esc(sub) + '">' +
          "</div>" +
          '<div class="gv__panel">' +
            '<p class="gv__role">Painter + Creative Technologist</p>' +
            '<p class="gv__count">' + pad(i + 1) + " / " + pad(n) + "</p>" +
            '<h2 class="gv__title">' + title + "</h2>" +
            '<p class="gv__meta">' + esc(meta) + "</p>" +
            (w.description ? '<button class="gv__about" data-i="' + i + '">read about this work <span>&rarr;</span></button>' : "") +
            '<nav class="gv__index">' + indexHtml(i) + "</nav>" +
            (i < n - 1 ? '<div class="gv__cue">' + cue + (i === 0 ? "<span>scroll</span>" : "") + "</div>" : "") +
          "</div>" +
        "</section>";
    }).join("");

    var sections = $all(".gv__work", mount);
    $all(".gv__art", mount).forEach(function (img, i) {
      img.style.setProperty("--scale", scales[i]);
      applyBorder(img, works[i].border);
      img.loading = i === 0 ? "eager" : "lazy";
      img.src = works[i].img;
      img.addEventListener("click", function () { openLightbox(i); });
    });
    $all(".gv__ix", mount).forEach(function (b) {
      b.addEventListener("click", function () {
        var t = sections[parseInt(b.getAttribute("data-i"), 10)];
        if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });
    });

    // reading overlay — "read about this work" for works that carry a description
    var reader = document.createElement("div");
    reader.className = "reader";
    reader.innerHTML =
      '<button class="reader__close" aria-label="Close">&times;</button>' +
      '<div class="reader__panel" role="dialog" aria-modal="true" aria-label="About the work">' +
        '<p class="reader__eyebrow">about the work</p>' +
        '<h3 class="reader__title"></h3>' +
        '<div class="reader__body"></div>' +
      "</div>";
    document.body.appendChild(reader);
    var rTitle = $(".reader__title", reader), rBody = $(".reader__body", reader), rPanel = $(".reader__panel", reader);
    function openReader(i) {
      var w = works[i]; if (!w || !w.description) return;
      rTitle.textContent = w.title;
      var paras = Array.isArray(w.description) ? w.description : [w.description];
      rBody.innerHTML = paras.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
      rPanel.scrollTop = 0;
      reader.classList.add("is-open");
      document.body.style.overflow = "hidden";
      root.classList.remove("cursor-on");
    }
    function closeReader() {
      reader.classList.remove("is-open");
      document.body.style.overflow = "";
      if (fine && !reduce) root.classList.add("cursor-on");
    }
    $(".reader__close", reader).addEventListener("click", closeReader);
    reader.addEventListener("click", function (e) { if (e.target === reader) closeReader(); });
    $all(".gv__about", mount).forEach(function (b) {
      b.addEventListener("click", function () { openReader(parseInt(b.getAttribute("data-i"), 10)); });
    });

    // keyboard: arrows move between works (scroll-snap handles wheel / trackpad / touch)
    document.addEventListener("keydown", function (e) {
      if (reader.classList.contains("is-open")) { if (e.key === "Escape") closeReader(); return; }
      if (!mount.isConnected || document.querySelector(".lightbox.is-open")) return;
      var dir = (e.key === "ArrowDown" || e.key === "ArrowRight") ? 1
              : (e.key === "ArrowUp" || e.key === "ArrowLeft") ? -1 : 0;
      if (!dir) return;
      var i = clamp(Math.round(mount.scrollTop / (mount.clientHeight || 1)) + dir, 0, n - 1);
      if (sections[i]) { e.preventDefault(); sections[i].scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }
    });

    // honour ?w= — open on that work
    var s = (start % n + n) % n;
    if (s > 0 && sections[s]) requestAnimationFrame(function () { sections[s].scrollIntoView({ block: "start" }); });
  }

  /* ---------- Home: interactive index ---------- */
  var homeIndex = $("[data-home-index]");
  if (homeIndex && window.ARTWORKS) {
    var previewWrap = $("[data-home-preview]");
    var pimgs = [];
    var hLongs = window.ARTWORKS.map(function (a) {
      var m = /([\d.]+)\s*[×x]\s*([\d.]+)\s*in/i.exec(a.size || "");
      return m ? Math.max(parseFloat(m[1]), parseFloat(m[2])) : 0;
    });
    var hMax = Math.max.apply(null, hLongs.filter(Boolean).concat([1]));
    window.ARTWORKS.forEach(function (a, i) {
      var item = document.createElement("a");
      item.className = "home__ix";
      item.href = "gallery.html?w=" + i;
      item.innerHTML = '<span class="n">' + pad(i + 1) + '</span><span class="t">' + esc(a.title) + "</span>";
      homeIndex.appendChild(item);
      var pim = document.createElement("img");
      pim.className = "home__preview-img"; pim.alt = a.title; pim.decoding = "async";
      pim.style.setProperty("--scale", hLongs[i] ? Math.max(0.44, hLongs[i] / hMax) : 1);
      if (previewWrap) previewWrap.appendChild(pim);
      pimgs.push(pim);
      var activate = function () {
        if (!pim.getAttribute("src")) pim.src = a.img;
        $all(".home__ix", homeIndex).forEach(function (x) { x.classList.remove("is-active"); });
        item.classList.add("is-active");
        pimgs.forEach(function (p, k) { p.classList.toggle("is-shown", k === i); });
      };
      item.addEventListener("mouseenter", activate);
      item.addEventListener("focus", activate);
    });
    var first = homeIndex.querySelector(".home__ix");
    if (first && pimgs[0]) { first.classList.add("is-active"); pimgs[0].src = window.ARTWORKS[0].img; pimgs[0].classList.add("is-shown"); }
  }

  /* ---------- Blur-up loading (static images only, e.g. the entrance) ---------- */
  $all(".frame__art").forEach(function (img) {
    var wrap = img.parentElement;
    if (!wrap.classList.contains("frame__art-wrap")) {
      wrap = document.createElement("span");
      wrap.className = "frame__art-wrap";
      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);
    }
    var src = img.getAttribute("src");
    if (src) wrap.style.backgroundImage = "url('" + tinyPath(src) + "')";
    var done = function () { img.classList.add("is-loaded"); wrap.classList.add("is-loaded"); };
    if (img.complete && img.naturalWidth > 0) done();
    else { img.addEventListener("load", done, { once: true }); img.addEventListener("error", done, { once: true }); setTimeout(done, 4000); }
  });

  /* ---------- Scroll reveals (interior pages) ---------- */
  var reveals = $all("[data-reveal]");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Masthead refines on scroll ---------- */
  var masthead = $(".masthead");
  if (masthead) {
    var tick = false;
    addEventListener("scroll", function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () { masthead.classList.toggle("is-scrolled", scrollY > 40); tick = false; });
    }, { passive: true });
  }

  /* ---------- Custom cursor ---------- */
  if (fine && !reduce) {
    root.classList.add("cursor-on");
    var dot = document.createElement("div"); dot.className = "cursor-dot";
    var ring = document.createElement("div"); ring.className = "cursor-ring";
    ring.innerHTML = '<svg class="cursor-glass" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.5" stroke-linecap="round">' +
      '<circle cx="10" cy="10" r="7"/><line x1="15.2" y1="15.2" x2="20.5" y2="20.5"/></svg>';
    dot.style.opacity = ring.style.opacity = "0";
    document.body.appendChild(dot); document.body.appendChild(ring);

    var mx = innerWidth / 2, my = innerHeight / 2, rxv = mx, ryv = my;
    (function loop() {
      rxv = lerp(rxv, mx, 0.18); ryv = lerp(ryv, my, 0.18);
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      ring.style.transform = "translate(" + rxv + "px," + ryv + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.opacity = ring.style.opacity = "";
      var t = e.target;
      if (t.closest && t.closest(".frame__art, .gv__art")) {
        ring.classList.add("on-art"); ring.classList.remove("on-link"); dot.classList.add("is-hidden");
      } else if (t.closest && t.closest("a,button,.btn,[role=button]")) {
        ring.classList.add("on-link"); ring.classList.remove("on-art"); dot.classList.remove("is-hidden");
      } else {
        ring.classList.remove("on-art", "on-link"); dot.classList.remove("is-hidden");
      }
    });
    document.addEventListener("mouseleave", function () { dot.style.opacity = ring.style.opacity = "0"; });

    $all(".btn").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22) + "px," +
                              ((e.clientY - r.top - r.height / 2) * 0.35) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }
})();
