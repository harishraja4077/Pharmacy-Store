(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- email rule: must end with @gmail.com ---------------- */
  var EMAIL_RE = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;
  var EMAIL_MSG = "Enter a valid Gmail address ending with @gmail.com";

  function emailError(el) {
    var v = (el.value || "").trim();
    if (!v) return el.hasAttribute("required") ? "Email address is required" : "";
    return EMAIL_RE.test(v) ? "" : EMAIL_MSG;
  }

  /* paints the inline message under an email field, returns true when valid */
  function emailCheck(el, force) {
    var msg = emailError(el);
    var bad = !!msg;
    el.classList.toggle("is-bad", bad);
    var err = el.parentNode && el.parentNode.querySelector(".err");
    if (err) {
      if (bad) err.textContent = msg;
      err.classList.toggle("show", bad);
    }
    if (bad && force && typeof el.focus === "function") el.focus();
    return !bad;
  }

  /* ---------------- preloader ---------------- */
  function preloader() {
    var pre = $(".pre");
    if (!pre) return;
    var bar = $(".pre-bar i", pre);
    var p = 0;
    var timer = setInterval(function () {
      p = Math.min(p + Math.random() * 16 + 6, 100);
      if (bar) bar.style.width = p + "%";
      if (p >= 100) {
        clearInterval(timer);
        setTimeout(function () {
          pre.classList.add("is-done");
          document.body.classList.remove("is-locked");
          document.body.style.overflow = "";
          heroIntro();
        }, 320);
      }
    }, 190);
    document.body.classList.add("is-locked");
    setTimeout(function () { if (document.body.classList.contains("is-locked")) document.body.style.overflow = "hidden"; }, 10);
  }

  /* ---------------- hero intro ---------------- */
  function heroIntro() {
    if (reduce) return;
    $$(".hero .line-mask > span").forEach(function (el, i) {
      el.style.transitionDelay = 120 + i * 95 + "ms";
      el.classList.add("in");
    });
    $$(".hero [data-hi]").forEach(function (el, i) {
      el.style.animation = "fadeUp .9s cubic-bezier(.22,1,.36,1) both";
      el.style.animationDelay = 300 + i * 90 + "ms";
    });
  }

  /* ---------------- custom cursor + glow ---------------- */
  function cursor() {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    var dot = document.createElement("div"); dot.className = "cur-dot";
    var ring = document.createElement("div"); ring.className = "cur-ring";
    document.body.append(dot, ring);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var dx = mx, dy = my, rx = mx, ry = my;

    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      document.documentElement.style.setProperty("--mx", mx + "px");
      document.documentElement.style.setProperty("--my", my + "px");
      var hot = e.target.closest("a,button,.card,.mcard,.prod,.cattile,.person,.offer,.tst,.info-card,.pill,.mini-post");
      document.body.classList.toggle("cur-hot", !!hot);
    }, { passive: true });

    (function loop() {
      dx += (mx - dx) * .32; dy += (my - dy) * .32;
      rx += (mx - rx) * .16; ry += (my - ry) * .16;
      dot.style.transform = "translate(" + dx + "px," + dy + "px) translate(-50%,-50%)";
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- scroll progress + sticky header ---------------- */
  function scrollUI() {
    var bar = $(".prog");
    var hdr = $(".hdr");
    var top = $(".back-top");
    var last = 0;
    function upd() {
      var y = window.scrollY || document.documentElement.scrollTop;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
      if (hdr) hdr.classList.toggle("is-stuck", y > 24);
      if (top) top.classList.toggle("show", y > 620);
      last = y;
    }
    window.addEventListener("scroll", upd, { passive: true });
    upd();
    if (top) top.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ---------------- mobile drawer ---------------- */
  function drawer() {
    var btn = $(".burger");
    var dr = $(".drawer");
    if (!btn || !dr) return;
    function open() { dr.classList.add("is-open"); document.body.classList.add("is-locked"); }
    function close() { dr.classList.remove("is-open"); document.body.classList.remove("is-locked"); }
    btn.addEventListener("click", function () {
      dr.classList.contains("is-open") ? close() : open();
    });
    $(".drawer-scrim", dr).addEventListener("click", close);
    $$("a", dr).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ---------------- reveal on scroll ---------------- */
  function reveal() {
    var items = $$("[data-rv], .line-mask, .split");
    if (reduce) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el, i) {
      if (!el.style.getPropertyValue("--d")) {
        el.style.setProperty("--d", ((i % 6) * 80) + "ms");
      }
      io.observe(el);
    });
  }

  /* ---------------- text splitting ---------------- */
  function splitText() {
    $$(".split").forEach(function (el) {
      var text = el.textContent.trim();
      el.textContent = "";
      text.split(" ").forEach(function (word, i) {
        var s = document.createElement("span");
        s.textContent = word + (i < text.split(" ").length - 1 ? "\u00A0" : "");
        s.style.setProperty("--i", i);
        el.appendChild(s);
      });
    });
  }

  /* ---------------- counters ---------------- */
  function counters() {
    var els = $$("[data-count]");
    if (!els.length) return;
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        var target = parseFloat(el.getAttribute("data-count"));
        var dec = (el.getAttribute("data-dec") | 0);
        var suffix = el.getAttribute("data-suffix") || "";
        var dur = reduce ? 1 : 1700;
        var t0 = performance.now();
        (function step(now) {
          var k = Math.min((now - t0) / dur, 1);
          var e2 = 1 - Math.pow(1 - k, 3);
          el.textContent = (target * e2).toFixed(dec) + suffix;
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- tilt ---------------- */
  function tilt() {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    $$("[data-tilt]").forEach(function (el) {
      var max = parseFloat(el.getAttribute("data-tilt")) || 8;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          "perspective(900px) rotateX(" + (-py * max).toFixed(2) + "deg) rotateY(" +
          (px * max).toFixed(2) + "deg) translateY(-10px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transition = "transform .8s cubic-bezier(.22,1,.36,1)";
        el.style.transform = "";
        setTimeout(function () { el.style.transition = ""; }, 850);
      });
      el.style.transition = "transform .18s linear";
    });
  }

  /* ---------------- parallax ---------------- */
  function parallax() {
    if (reduce) return;
    var els = $$("[data-par]");
    if (!els.length) return;
    var ticking = false;
    function run() {
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        var mid = r.top + r.height / 2 - window.innerHeight / 2;
        var k = parseFloat(el.getAttribute("data-par")) || 0.12;
        el.style.transform = "translate3d(0," + (mid * k).toFixed(2) + "px,0)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(run); ticking = true; }
    }, { passive: true });
    run();
  }

  /* ---------------- marquee duplication ---------------- */
  function marquee() {
    $$(".marq-track").forEach(function (t) {
      t.innerHTML = t.innerHTML + t.innerHTML;
    });
  }

  /* ---------------- countdown ---------------- */
  function countdown() {
    var box = $("[data-countdown]");
    if (!box) return;
    var end = new Date(box.getAttribute("data-countdown")).getTime();
    function pad(n) { return n < 10 ? "0" + n : "" + n; }
    function tick() {
      var d = end - Date.now();
      if (d < 0) d = 0;
      var s = Math.floor(d / 1000);
      var dd = Math.floor(s / 86400);
      var hh = Math.floor((s % 86400) / 3600);
      var mm = Math.floor((s % 3600) / 60);
      var ss = s % 60;
      var map = { "cd-d": dd, "cd-h": hh, "cd-m": mm, "cd-s": ss };
      Object.keys(map).forEach(function (k) {
        var el = box.querySelector('[data-k="' + k + '"]');
        if (el) el.textContent = pad(map[k]);
      });
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------- testimonial slider ---------------- */
  function slider() {
    $$("[data-slider]").forEach(function (root) {
      var track = $(".tst-track", root);
      var slides = $$(".tst-slide", root);
      var prev = $("[data-prev]", root);
      var next = $("[data-next]", root);
      var dots = $$(".dot", root);
      if (!track || !slides.length) return;
      var idx = 0, timer = null;

      function per() {
        if (window.innerWidth <= 780) return 1;
        if (window.innerWidth <= 1080) return 2;
        return 3;
      }
      function maxIdx() { return Math.max(0, slides.length - per()); }

      function render() {
        idx = Math.min(idx, maxIdx());
        var w = slides[0].getBoundingClientRect().width;
        track.style.transform = "translateX(" + -(idx * (w + 26)) + "px)";
        dots.forEach(function (d, i) { d.classList.toggle("is-on", i === idx); });
        if (prev) prev.disabled = idx === 0;
        if (next) next.disabled = idx === maxIdx();
      }
      function go(n) { idx = Math.max(0, Math.min(n, maxIdx())); render(); }
      function play() { stop(); timer = setInterval(function () { go(idx >= maxIdx() ? 0 : idx + 1); }, 5200); }
      function stop() { if (timer) clearInterval(timer); }

      if (prev) prev.addEventListener("click", function () { go(idx - 1); play(); });
      if (next) next.addEventListener("click", function () { go(idx + 1); play(); });
      dots.forEach(function (d, i) { d.addEventListener("click", function () { go(i); play(); }); });
      root.addEventListener("mouseenter", stop);
      root.addEventListener("mouseleave", play);
      window.addEventListener("resize", render);
      render();
      if (!reduce) play();
    });
  }

  /* ---------------- accordion ---------------- */
  function accordion() {
    $$(".acc").forEach(function (acc) {
      var items = $$(".acc-i", acc);
      items.forEach(function (it) {
        var q = $(".acc-q", it);
        if (!q) return;
        q.addEventListener("click", function () {
          var open = it.classList.contains("is-open");
          if (acc.getAttribute("data-single") !== "no") {
            items.forEach(function (o) { o.classList.remove("is-open"); });
          }
          if (!open) it.classList.add("is-open");
        });
      });
    });
  }

  /* ---------------- blog filter ---------------- */
  function filter() {
    var wrap = $("[data-filter]");
    if (!wrap) return;
    var pills = $$("[data-f]", wrap);
    var items = $$("[data-cat]", wrap);
    var count = $("[data-count]", wrap);
    pills.forEach(function (p) {
      p.addEventListener("click", function () {
        var f = p.getAttribute("data-f");
        pills.forEach(function (x) { x.classList.remove("is-on"); });
        p.classList.add("is-on");
        var shown = 0;
        items.forEach(function (it) {
          var ok = f === "all" || it.getAttribute("data-cat") === f;
          it.style.display = ok ? "" : "none";
          if (ok) {
            shown++;
            it.classList.remove("in");
            void it.offsetWidth;
            it.classList.add("in");
          }
        });
        if (count) count.textContent = shown;
      });
    });
  }

  /* ---------------- missing pages -> 404 ----------------
     every control marked data-missing (and any future one) is wired in the
     capture phase so its own handler cannot cancel the redirect */
  var MISSING_PAGE = "404.html";
  function toMissing(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    window.location.href = MISSING_PAGE;
  }
  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target.closest("[data-missing]") : null;
    if (el) toMissing(e);
  }, true);

  /* ---------------- signed-in account ----------------
     The auth forms hand the address to the dashboards, so every dashboard
     can show the account that is actually signed in. */
  var SESSION_KEY = "stackly_session";

  function saveSession(email, role) {
    if (!email) return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        email: email, role: role || "", at: Date.now()
      }));
    } catch (e) {}
  }

  /* ---------------- cart ---------------- */
  function cart() {
    var KEY = "stackly_cart";
    var data = [];
    try { data = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { data = []; }
    var n = 0;
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
      n = data.reduce(function (a, b) { return a + b.q; }, 0);
      $$("[data-cart-count]").forEach(function (el) {
        el.textContent = n;
        el.hidden = n === 0;
      });
    }
    $$("[data-add]").forEach(function (b) {
      b.addEventListener("click", function () {
        var name = b.getAttribute("data-add");
        var found = data.filter(function (d) { return d.n === name; })[0];
        if (found) found.q++;
        else data.push({ n: name, q: 1 });
        save();
        b.classList.add("done");
        var ic = b.querySelector("svg");
        if (ic) ic.innerHTML = '<path d="M20 6 9 17l-5-5"/>';
        toast(name + " added to cart");
        setTimeout(function () {
          b.classList.remove("done");
          if (ic) ic.innerHTML = '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>';
        }, 1300);
      });
    });
    $$("[data-wish]").forEach(function (w) {
      w.addEventListener("click", function (e) { toMissing(e); });
    });
    save();
  }

  /* ---------------- toasts ---------------- */
  function toast(msg) {
    var wrap = $(".toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      document.body.appendChild(wrap);
    }
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span></span>';
    t.querySelector("span").textContent = msg;
    wrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("out");
      setTimeout(function () { t.remove(); }, 420);
    }, 3200);
  }

  /* ---------------- forms ---------------- */
  function forms() {
    $$("form[data-validate]").forEach(function (form) {
      var roles = $$('input[type="radio"][name="role"]', form);
      var label = $("[data-role-btn]", form);
      var note = $("[data-role-note]", form);

      function picked() {
        var on = $('input[type="radio"][name="role"]:checked', form);
        return on && roles.length ? on : null;
      }

      function paint() {
        var on = picked();
        if (!on) return;
        if (label && on.getAttribute("data-label")) label.textContent = on.getAttribute("data-label");
        if (note) note.textContent = on.getAttribute("data-note") || "";
      }

      roles.forEach(function (r) {
        r.addEventListener("change", paint);
      });
      if (roles.length) paint();

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var ok = true;
        var mailBad = false;
        $$("[required], input[type=email]", form).forEach(function (el) {
          if (el.type === "email") {
            if (!emailCheck(el)) { ok = false; mailBad = true; }
            return;
          }
          var bad = el.type === "checkbox" ? !el.checked : !el.value.trim();
          el.classList.toggle("is-bad", bad);
          var err = el.parentNode.querySelector(".err");
          if (err) err.classList.toggle("show", bad);
          if (bad) ok = false;
        });
        var fnote = $(".form-note", form);
        if (!ok) {
          if (fnote) {
            fnote.classList.add("is-bad");
            var span = fnote.querySelector("span");
            if (span) {
              span.textContent = mailBad
                ? EMAIL_MSG + "."
                : "Please fix the highlighted fields and try again.";
            }
          }
          return;
        }
        if (fnote) {
          fnote.classList.remove("is-bad");
          fnote.querySelector("span").textContent = "Sent. Our pharmacist will reach out shortly.";
        }
        var on = picked();
        /* an auth form hands off to a dashboard once the toast has been read:
           a role radio picks the destination, otherwise data-goto is the target */
        var goto = (on && on.getAttribute("data-goto")) || form.getAttribute("data-goto");
        if (goto) {
          /* remember which address signed in, the dashboards display it */
          var mail = $('input[type="email"]', form);
          saveSession(mail ? mail.value.trim() : "", (on && on.value) || "");
          var msg = (on && on.getAttribute("data-msg")) || form.getAttribute("data-validate") || "Sent successfully";
          toast(msg);
          setTimeout(function () { window.location.href = goto; }, 1100);
          return;
        }
        /* nothing is wired up behind this form yet -> 404 */
        toMissing();
      });
      $$(".inp", form).forEach(function (el) {
        el.addEventListener("input", function () {
          /* an email only re-checks once it is already flagged, so typing a new
             address never flashes red mid-word */
          if (el.type === "email") {
            if (el.classList.contains("is-bad")) emailCheck(el);
            return;
          }
          el.classList.remove("is-bad");
          var err = el.parentNode.querySelector(".err");
          if (err) err.classList.remove("show");
        });
        if (el.type === "email") {
          el.addEventListener("blur", function () {
            if (el.value.trim()) emailCheck(el);
          });
        }
      });
    });
  }

  /* ---------------- newsletter ---------------- */
  function newsletter() {
    $$("[data-news]").forEach(function (form) {
      var input = form.querySelector('input[type="email"]') || form.querySelector("input");
      var out = form.parentNode ? form.parentNode.querySelector(".news-err") : null;

      function clear() {
        if (out) out.classList.remove("show");
        if (input) input.classList.remove("is-bad");
      }

      if (input) {
        input.addEventListener("input", function () {
          if (input.classList.contains("is-bad") && EMAIL_RE.test(input.value.trim())) clear();
        });
        input.addEventListener("blur", function () {
          if (input.value.trim() && !EMAIL_RE.test(input.value.trim())) {
            if (out) { out.textContent = EMAIL_MSG; out.classList.add("show"); }
            input.classList.add("is-bad");
          }
        });
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var msg = input ? emailError(input) : EMAIL_MSG;
        if (msg) {
          if (out) { out.textContent = msg; out.classList.add("show"); }
          if (input) { input.classList.add("is-bad"); input.focus(); }
          toast(msg);
          return;
        }
        clear();
        toMissing();
      });
    });
  }

  /* ---------------- live hours ---------------- */
  function hours() {
    var rows = $$("[data-hours]");
    if (!rows.length) return;
    var day = new Date().getDay();
    rows.forEach(function (r) {
      var d = r.getAttribute("data-hours");
      if (String(day) === d || d === "all") r.classList.add("is-today");
    });
  }

  /* ---------------- 404: go back to the previous page ---------------- */
  function goBack() {
    $$("[data-back]").forEach(function (b) {
      b.addEventListener("click", function () {
        /* direct hits and fresh tabs have no history to return to,
           so the data-back value is the fallback */
        if (window.history.length > 1) window.history.back();
        else window.location.href = b.getAttribute("data-back") || "index.html";
      });
    });
  }

  /* ---------------- 404 easter egg ---------------- */
  function confetti() {
    var el = $("[data-confetti]");
    if (!el) return;
    el.addEventListener("click", function () {
      var colors = ["#0E9F6E", "#07B981", "#FF6B4A", "#E9B44C", "#2AA7E0"];
      for (var i = 0; i < 34; i++) {
        var p = document.createElement("i");
        p.style.position = "fixed";
        p.style.zIndex = 999;
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = "-20px";
        p.style.width = Math.random() * 9 + 5 + "px";
        p.style.height = Math.random() * 9 + 5 + "px";
        p.style.background = colors[i % colors.length];
        p.style.borderRadius = Math.random() > .5 ? "50%" : "2px";
        p.style.transition = "transform 1.6s cubic-bezier(.2,.7,.4,1), opacity 1.6s";
        document.body.appendChild(p);
        (function (node) {
          requestAnimationFrame(function () {
            node.style.transform = "translateY(" + (window.innerHeight + 60) + "px) rotate(" + (Math.random() * 900) + "deg)";
            node.style.opacity = "0";
          });
          setTimeout(function () { node.remove(); }, 1800);
        })(p);
      }
      toast("Nice. Try the search bar next time.");
    });
  }

  /* ---------------- magnetic buttons ---------------- */
  function magnetic() {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    $$("[data-mag]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.26;
        var y = (e.clientY - r.top - r.height / 2) * 0.34;
        el.style.transform = "translate(" + x + "px," + y + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transition = "transform .6s cubic-bezier(.34,1.56,.64,1)";
        el.style.transform = "";
        setTimeout(function () { el.style.transition = ""; }, 620);
      });
    });
  }

  /* ---------------- password reveal ---------------- */
  function revealPw() {
    $$("[data-eye]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var input = btn.parentNode.querySelector("input");
        if (!input) return;
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.style.color = show ? "var(--brand)" : "var(--muted)";
        btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
      });
    });
  }

  /* ---------------- boot ---------------- */
  function boot() {
    preloader();
    cursor();
    scrollUI();
    drawer();
    splitText();
    marquee();
    reveal();
    counters();
    tilt();
    parallax();
    countdown();
    slider();
    accordion();
    filter();
    cart();
    forms();
    newsletter();
    hours();
    goBack();
    confetti();
    magnetic();
    revealPw();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
