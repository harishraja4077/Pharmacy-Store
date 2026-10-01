/* ==========================================================================
   Stackly — DASHBOARD BEHAVIOUR
   Loaded AFTER script.js. Every module is defensive: if its root element is
   missing it returns immediately, so the same file is safe on every page.
   Vanilla ES5-style to match js/script.js.
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- email rule: must end with @gmail.com (mirrors script.js) ----- */
  var GMAIL_RE = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;
  var GMAIL_MSG = "Enter a valid Gmail address ending with @gmail.com";

  /* ---------- section action buttons are not built yet -> 404 ------------- */
  function toMissing(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    window.location.href = "404.html";
  }

  /* ---------- toast (mirrors script.js markup, owns its own queue) -------- */
  function toast(msg, kind) {
    var wrap = $(".toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      document.body.appendChild(wrap);
    }
    var tone = kind === "bad" ? "var(--coral)" : kind === "gold" ? "var(--gold)" : "var(--brand-2)";
    var glyph = kind === "bad"
      ? '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/>'
      : '<path d="M20 6 9 17l-5-5"/>';
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="' + tone +
      '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + glyph + "</svg><span>" + msg + "</span>";
    wrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 450);
    }, 3200);
  }

  /* ---------- assign the load-in stagger indices -------------------------- */
  function dIndex() {
    $$(".dside-nav > *").forEach(function (el, i) { el.style.setProperty("--i", i); });
    $$(".dmain > *").forEach(function (el, i) { el.style.setProperty("--i", i); });
  }

  /* ---------- sidebar: off-canvas on mobile, icon rail on desktop -------- */
  function dSide() {
    var side = $(".dside");
    if (!side) return;
    var burger = $("[data-side-open]");
    var closeBtn = $(".dside-x");
    var scrim = $(".dscrim");
    var rail = $("[data-rail]");
    var wide = window.matchMedia("(min-width: 1181px)");

    function isOpen() { return document.body.classList.contains("d-open"); }

    function openNav() {
      if (isOpen()) return;
      document.body.classList.add("d-open");
      document.body.classList.add("is-locked");
      if (burger) burger.setAttribute("aria-expanded", "true");
      if (closeBtn) closeBtn.focus();
    }
    function closeNav() {
      if (!isOpen()) return;
      document.body.classList.remove("d-open");
      document.body.classList.remove("is-locked");
      if (burger) burger.setAttribute("aria-expanded", "false");
    }

    if (burger) {
      burger.addEventListener("click", function () { isOpen() ? closeNav() : openNav(); });
    }
    if (closeBtn) closeBtn.addEventListener("click", closeNav);
    if (scrim) scrim.addEventListener("click", closeNav);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    /* never leave the body scroll-locked if the viewport grows back to desktop */
    function reflow() { if (wide.matches) closeNav(); }
    if (wide.addEventListener) wide.addEventListener("change", reflow);
    else if (wide.addListener) wide.addListener(reflow);

    /* icon rail toggle — desktop only, remembered for the session */
    try {
      if (window.sessionStorage.getItem("stackly_rail") === "1" && wide.matches) {
        document.body.classList.add("d-mini");
      }
    } catch (err) { /* storage unavailable — rail simply stays expanded */ }

    if (rail) {
      rail.addEventListener("click", function () {
        var mini = document.body.classList.toggle("d-mini");
        rail.setAttribute("aria-pressed", mini ? "true" : "false");
        try { window.sessionStorage.setItem("stackly_rail", mini ? "1" : "0"); } catch (err2) {}
        if (mini) toast("Sidebar collapsed to icons");
      });
    }
  }

  /* ---------- sticky top bar shadow -------------------------------------- */
  function dStuck() {
    var top = $(".dtop");
    if (!top) return;
    function onScroll() { top.classList.toggle("is-stuck", window.pageYOffset > 12); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- dropdowns --------------------------------------------------- */
  function dDrop() {
    var triggers = $$("[data-dd]");

    function closeAll(except) {
      triggers.forEach(function (t) {
        if (t === except) return;
        var p = $('[data-ddpanel="' + t.getAttribute("data-dd") + '"]');
        t.classList.remove("is-open");
        t.setAttribute("aria-expanded", "false");
        if (p) p.classList.remove("is-open");
      });
    }

    triggers.forEach(function (t) {
      t.addEventListener("click", function (e) {
        e.stopPropagation();
        var p = $('[data-ddpanel="' + t.getAttribute("data-dd") + '"]');
        var willOpen = !p.classList.contains("is-open");
        closeAll(t);
        t.classList.toggle("is-open", willOpen);
        t.setAttribute("aria-expanded", willOpen ? "true" : "false");
        if (p) p.classList.toggle("is-open", willOpen);
      });
    });

    document.addEventListener("click", function () { closeAll(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });
  }

  /* ---------- top bar search: not built yet -> 404 ----------------------- */
  function dSearch404() {
    $$(".dtop .dsearch input").forEach(function (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          toMissing(e);
        }
      });
    });
  }

  /* ---------- tabs + panels ----------------------------------------------- */
  function dTabs() {
    $$("[data-tabs]").forEach(function (group) {
      var key = group.getAttribute("data-tabs");
      group.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-tab]");
        if (!btn || !group.contains(btn)) return;
        $$("[data-tab]", group).forEach(function (b) { b.classList.remove("is-on"); });
        btn.classList.add("is-on");
        var want = btn.getAttribute("data-tab");
        /* panels keyed to the same group name get swapped */
        $$('[data-tabpanel][data-tabgroup="' + key + '"]').forEach(function (p) {
          var match = p.getAttribute("data-tabpanel") === want;
          p.hidden = !match;
          if (match) {
            p.classList.remove("in");
            void p.offsetWidth;
            p.classList.add("in");
          }
        });
      });
    });

    /* segmented controls (7D / 30D / 90D) also drive chart data labels */
    $$("[data-seg]").forEach(function (seg) {
      seg.addEventListener("click", function (e) {
        var btn = e.target.closest("button");
        if (!btn || !seg.contains(btn)) return;
        $$("button", seg).forEach(function (b) { b.classList.remove("is-on"); });
        btn.classList.add("is-on");
        var range = btn.getAttribute("data-range") || btn.getAttribute("data-r");
        var chart = seg.getAttribute("data-seg-chart") || seg.getAttribute("data-chart");
        if (chart) {
          var panel = $('.chart[data-chart="' + chart + '"]');
          if (panel) {
            var bars = $$(".chart-b", panel);
            bars.forEach(function (bar, i) {
              var h = bar.getAttribute("data-h-" + range);
              if (h) bar.style.setProperty("--h", h);
              bar.classList.remove("is-on");
              setTimeout(function () { bar.classList.add("is-on"); }, reduce ? 0 : 60 + i * 55);
            });
          }
        }
        toast("Showing " + btn.textContent.trim());
      });
    });
  }

  /* ---------- reorder shortcuts: filter by refill frequency --------------- */
  function dReorderFilters() {
    $$('[data-reorder-filter]').forEach(function (controls) {
      var grid = $('[data-reorder-items]');
      if (!grid) return;
      var cards = $$('.dprod', grid);
      var buttons = $$('[data-filter]', controls);

      controls.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-filter]');
        if (!btn || !controls.contains(btn)) return;

        buttons.forEach(function (button) {
          var selected = button === btn;
          button.classList.toggle('is-on', selected);
          button.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });

        var filter = btn.getAttribute('data-filter');
        cards.forEach(function (card) {
          card.hidden = filter !== 'all' && card.getAttribute('data-frequency') !== filter;
        });
      });
    });
  }

  /* ---------- reveal + draw ----------------------------------------------- */
  var PAINTABLE = ".dprog > i, .spark > i, .chart-b, .dring";

  function dDraw() {
    var scope = $(".dmain") || document.body;
    var nodes = $$(PAINTABLE, scope);
    if (!nodes.length) return;

    /* stagger chart columns so the bar chart grows left to right */
    nodes.forEach(function (n) {
      var host = n.closest(".chart");
      if (!host) return;
      var bars = host.__bars || (host.__bars = $$(".chart-b", host));
      var i = bars.indexOf(n);
      if (i > -1) n.style.transitionDelay = reduce ? "0ms" : i * 55 + "ms";
    });

    function paint(member) {
      if (member.classList.contains("dring")) {
        var p = member.getAttribute("data-p");
        if (p) member.style.setProperty("--p", p + "%");
      }
      member.classList.add("is-on");
    }

    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(paint);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.__paint();
        io.unobserve(en.target);
      });
    }, { threshold: 0.2 });

    /* observe one host per group so a single visible bar draws its whole chart */
    var groups = [];
    nodes.forEach(function (n) {
      /* a standalone .dring has no wrapper, so it hosts itself */
      var host = n.closest(".chart, .spark, .dprog") || n;
      if (groups.indexOf(host) === -1) groups.push(host);
    });

    groups.forEach(function (g) {
      g.__paint = function () {
        /* a group may be the paintable itself, e.g. a standalone .dring */
        if (g.matches && g.matches(PAINTABLE)) paint(g);
        $$(PAINTABLE, g).forEach(paint);
      };
      io.observe(g);
    });
  }

  /* ---------- table engine: search · filter · sort · paginate ------------- */
  function dTable() {
    $$("[data-table]").forEach(function (tbl) {
      var body = $("tbody", tbl);
      if (!body) return;
      var all = $$("tr", body);
      if (!all.length) return;

      var id = tbl.getAttribute("data-table");
      var pageSize = parseInt(tbl.getAttribute("data-page-size") || "0", 10);
      var page = 1;
      var sortKey = tbl.getAttribute("data-sort-key") || "";
      var sortDir = tbl.getAttribute("data-sort-dir") || "asc";

      /* -- controls: a filter bar may live inside the panel or beside it -- */
      var search = null;
      if (id) search = $('[data-tsearch][data-for="' + id + '"]');
      if (!search) search = $("[data-tsearch]", tbl);

      var bar = null;
      if (id) bar = $('[data-tfilter][data-for="' + id + '"]');
      if (!bar) bar = $("[data-tfilter]", tbl);

      var countEl = id ? $('[data-rows][data-for="' + id + '"]') : null;
      if (!countEl) countEl = $("[data-rows]", tbl);
      var totalEl = id ? $('[data-total][data-for="' + id + '"]') : null;
      if (!totalEl) totalEl = $("[data-total]", tbl);

      var pgWrap = id ? $('[data-pag][data-for="' + id + '"]') : null;
      if (!pgWrap) pgWrap = $("[data-pag]", tbl);

      var query = "";
      var filter = "all";

      /* -- helpers -- */
      function value(row, i) {
        var cell = row.children[i];
        if (!cell) return "";
        var v = cell.getAttribute("data-v");
        if (v !== null) return v;
        return (cell.textContent || "").replace(/\s+/g, " ").trim();
      }
      function num(v) {
        var s = String(v).trim();
        /* only treat a value as numeric when it really is one, so that
           "#MC-47980" and "18 Sep 2026" are left to localeCompare instead of
           being coerced to -47980 and 182026 */
        if (!/^-?[\d.,]+%?$/.test(s)) return null;
        var n = parseFloat(s.replace(/,/g, "").replace(/%$/, ""));
        return isNaN(n) ? null : n;
      }
      function matches(row) {
        var st = row.getAttribute("data-status") || "";
        if (filter !== "all" && st.toLowerCase() !== filter.toLowerCase()) return false;
        if (!query) return true;
        return (row.getAttribute("data-search") || row.textContent || "")
          .toLowerCase().indexOf(query) !== -1;
      }
      function sortRows(rows) {
        if (!sortKey) return rows;
        var col = -1;
        $$("thead th", tbl).forEach(function (th, i) {
          if (th.getAttribute("data-sort") === sortKey) col = i;
        });
        rows.sort(function (a, b) {
          /* prefer an explicit per-row value, fall back to the matching cell */
          var va = a.getAttribute("data-k-" + sortKey);
          var vb = b.getAttribute("data-k-" + sortKey);
          if (va === null || vb === null) {
            va = col >= 0 ? value(a, col) : "";
            vb = col >= 0 ? value(b, col) : "";
          }
          var na = num(va), nb = num(vb);
          var out;
          if (na !== null && nb !== null) out = na - nb;
          else out = String(va).localeCompare(String(vb), undefined, { numeric: true });
          return sortDir === "desc" ? -out : out;
        });
        return rows;
      }

      /* -- paint -- */
      function paint() {
        /* sort a copy of every row and move the real nodes into that order --
           hidden alone cannot express a sort, the document order has to change */
        var ordered = sortRows(all.slice());
        var frag = document.createDocumentFragment();
        ordered.forEach(function (r) { frag.appendChild(r); });
        body.appendChild(frag);

        var rows = ordered.filter(matches);
        var pages = pageSize > 0 ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1;
        if (page > pages) page = pages;
        var slice = pageSize > 0 ? rows.slice((page - 1) * pageSize, page * pageSize) : rows;

        all.forEach(function (r) { r.hidden = true; });
        slice.forEach(function (r, i) {
          r.hidden = false;
          r.style.opacity = "";
          if (!reduce) {
            r.animate
              ? r.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
                  { duration: 420, delay: i * 45, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" })
              : null;
          }
        });

        if (countEl) countEl.textContent = rows.length;
        if (totalEl) totalEl.textContent = all.length;

        if (pgWrap) {
          pgWrap.hidden = pages <= 1 && pageSize === 0;
          renderPager(pgWrap, pages, page);
        }
      }

      function renderPager(wrap, pages, cur) {
        var list = $(".dpag-list", wrap);
        if (!list) return;
        var html = '<button class="dpag-btn" data-pg-step="-1"' + (cur === 1 ? " disabled" : "") +
          ' aria-label="Previous page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>';
        for (var i = 1; i <= pages; i++) {
          /* windowed page numbers: 1 … n-1 n n+1 … last */
          if (pages > 6 && i > 2 && i < pages - 1 && Math.abs(i - cur) > 1) {
            if (i === 3 || i === pages - 2) html += '<span class="dpag-btn" style="box-shadow:none;background:none">…</span>';
            continue;
          }
          html += '<button class="dpag-btn' + (i === cur ? " is-on" : "") + '" data-pg="' + i + '">' + i + "</button>";
        }
        html += '<button class="dpag-btn" data-pg-step="1"' + (cur === pages ? " disabled" : "") +
          ' aria-label="Next page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>';
        list.innerHTML = html;
      }

      /* -- events -- */
      if (search) {
        var t = null;
        search.addEventListener("input", function () {
          clearTimeout(t);
          t = setTimeout(function () {
            query = search.value.trim().toLowerCase();
            page = 1;
            paint();
          }, 180);
        });
      }

      if (bar) {
        bar.addEventListener("click", function (e) {
          var b = e.target.closest("[data-f]");
          if (!b || !bar.contains(b)) return;
          $$("[data-f]", bar).forEach(function (x) { x.classList.remove("is-on"); });
          b.classList.add("is-on");
          filter = b.getAttribute("data-f") || "all";
          page = 1;
          paint();
        });
      }

      $$("thead th[data-sort]", tbl).forEach(function (th) {
        th.addEventListener("click", function () {
          var key = th.getAttribute("data-sort");
          if (sortKey === key) sortDir = sortDir === "asc" ? "desc" : "asc";
          else { sortKey = key; sortDir = "asc"; }
          $$("thead th", tbl).forEach(function (x) { x.classList.remove("is-sort-asc", "is-sort-desc"); });
          th.classList.add(sortDir === "asc" ? "is-sort-asc" : "is-sort-desc");
          paint();
        });
      });

      if (pgWrap) {
        pgWrap.addEventListener("click", function (e) {
          var b = e.target.closest("[data-pg],[data-pg-step]");
          if (!b || b.disabled) return;
          var pages = pageSize > 0 ? Math.max(1, Math.ceil(all.filter(matches).length / pageSize)) : 1;
          if (b.hasAttribute("data-pg-step")) {
            page += parseInt(b.getAttribute("data-pg-step"), 10);
          } else {
            page = parseInt(b.getAttribute("data-pg"), 10);
          }
          if (page < 1) page = 1;
          if (page > pages) page = pages;
          paint();
        });
      }

      paint();
    });
  }

  /* ---------- generic row filter for non-table lists --------------------- */
  function dRows() {
    $$("[data-rowfilter]").forEach(function (scope) {
      var bar = $("[data-rf]", scope);
      var items = $$("[data-rfcat]", scope);
      var out = $("[data-rfcount]", scope);
      if (!bar || !items.length) return;

      bar.addEventListener("click", function (e) {
        var b = e.target.closest("[data-rfkey]");
        if (!b || !bar.contains(b)) return;
        $$("[data-rfkey]", bar).forEach(function (x) { x.classList.remove("is-on"); });
        b.classList.add("is-on");
        var want = b.getAttribute("data-rfkey");
        var n = 0;
        items.forEach(function (it) {
          var on = want === "all" || (it.getAttribute("data-rfcat") || "") === want;
          it.hidden = !on;
          if (on) n++;
        });
        if (out) out.textContent = n;
      });
    });
  }

  /* ---------- quantity steppers ------------------------------------------ */
  function dQty() {
    $$("[data-qty]").forEach(function (box) {
      box.addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (!b || !box.contains(b)) return;
        var out = $("b", box);
        var min = parseInt(box.getAttribute("data-min") || "1", 10);
        var max = parseInt(box.getAttribute("data-max") || "99", 10);
        var v = parseInt(out.textContent, 10) + (b.getAttribute("data-step") === "+" ? 1 : -1);
        if (v < min) v = min;
        if (v > max) v = max;
        out.textContent = v;
        if (!reduce) {
          out.style.animation = "dPop .42s cubic-bezier(.34,1.56,.64,1)";
          setTimeout(function () { out.style.animation = ""; }, 440);
        }
        var minB = $('[data-step="-"]', box), maxB = $('[data-step="+"]', box);
        if (minB) minB.disabled = v <= min;
        if (maxB) maxB.disabled = v >= max;
      });
    });
  }

  /* ---------- add-to-list buttons + wish hearts: not built yet -> 404 ------ */
  function dAdd() {
    $$("[data-dadd]").forEach(function (b) {
      b.addEventListener("click", function (e) { toMissing(e); });
    });

    $$("[data-wtog]").forEach(function (b) {
      b.addEventListener("click", function (e) { toMissing(e); });
    });

    /* save buttons: validate gmail-only email fields first, then -> 404 */
    $$("[data-dsave]").forEach(function (b) {
      var panel = b.closest(".panel");
      var fields = panel ? $$("[required]", panel) : [];

      b.addEventListener("click", function () {
        var bad = false;
        var firstBad = null;
        fields.forEach(function (el) {
          var value = (el.value || "").trim();
          var msg = el.type === "email"
            ? (!value ? "Email address is required" : !GMAIL_RE.test(value) ? GMAIL_MSG : "")
            : (el.type === "checkbox" ? !el.checked : !value)
              ? (el.getAttribute("data-required-error") || "This field is required")
              : "";
          el.classList.toggle("is-bad", !!msg);
          var err = el.parentNode && el.parentNode.querySelector(".err");
          if (err) {
            if (msg) err.textContent = msg;
            err.classList.toggle("show", !!msg);
          }
          if (msg) {
            bad = true;
            if (!firstBad) firstBad = el;
          }
        });
        if (bad) {
          if (firstBad) firstBad.focus();
          toast("Please complete the required fields and correct highlighted details.", "bad");
          return;
        }
        toMissing();
      });

      fields.forEach(function (el) {
        function clearError() {
          var value = (el.value || "").trim();
          var valid = el.type === "email" ? GMAIL_RE.test(value) : (el.type === "checkbox" ? el.checked : !!value);
          if (!valid) return;
          el.classList.remove("is-bad");
          var err = el.parentNode && el.parentNode.querySelector(".err");
          if (err) err.classList.remove("show");
        }
        el.addEventListener("input", clearError);
        el.addEventListener("change", clearError);
      });
    });
  }

  /* ---------- switch rows -------------------------------------------------- */
  function dSwitch() {
    $$(".dswitch input").forEach(function (i) {
      i.addEventListener("change", function () {
        var row = i.closest(".dswitch");
        var label = row ? ($(".dswitch-tx b", row) || {}).textContent : "Setting";
        toast(label + " " + (i.checked ? "enabled" : "disabled"));
      });
    });
  }

  /* ---------- upload drop zones ------------------------------------------- */
  function dUpload() {
    $$(".drop").forEach(function (zone) {
      var input = $("input[type=file]", zone);
      if (!input) return;
      var b = $("b", zone), small = $("small", zone);
      zone.addEventListener("dragover", function (e) { e.preventDefault(); zone.classList.add("is-full"); });
      zone.addEventListener("dragleave", function () { zone.classList.remove("is-full"); });
      zone.addEventListener("drop", function (e) {
        e.preventDefault();
        zone.classList.remove("is-full");
        var f = e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) accept(f.name + " (" + Math.round(f.size / 1024) + " KB)");
      });
      input.addEventListener("change", function () {
        var f = input.files && input.files[0];
        if (f) accept(f.name + " (" + Math.round(f.size / 1024) + " KB)");
      });
      function accept(name) {
        zone.classList.add("is-full");
        if (b) b.textContent = "File received";
        if (small) small.textContent = name + " · queued for pharmacist review";
        toast("Upload received. A pharmacist will verify it shortly.");
      }
    });
  }

  /* ---------- demo actions ------------------------------------------------- */
  function dActions() {
    $$("[data-do]").forEach(function (b) {
      b.addEventListener("click", function (e) { toMissing(e); });
    });

    /* table row actions (approve / print / archive …) */
    $$("[data-rowact]").forEach(function (b) {
      b.addEventListener("click", function (e) { toMissing(e); });
    });
  }

  /* ---------- print ------------------------------------------------------- */
  function dPrint() {
    $$("[data-print]").forEach(function (b) {
      b.addEventListener("click", function (e) { toMissing(e); });
    });
  }

  /* ---------- signed-in account ---------------------------------------------
     signin.html / signup.html store the address that signed in; every dashboard
     then reports that same address instead of a hard-coded placeholder. */
  var SESSION_KEY = "stackly_session";

  function readSession() {
    try {
      var s = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null");
      return s && s.email ? s : null;
    } catch (e) { return null; }
  }

  /* "meera.nair" -> "Meera Nair" so the name and the avatar stay in step */
  function accountName(email) {
    return String(email).split("@")[0]
      .split(/[._+-]+/)
      .filter(Boolean)
      .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); })
      .join(" ");
  }

  function accountInitials(name) {
    var parts = name.split(" ").filter(Boolean);
    if (!parts.length) return "";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function dSession() {
    var s = readSession();
    if (!s) return;
    var name = accountName(s.email);
    var mail = s.email;
    var parts = name.split(" ").filter(Boolean);
    var first = parts[0] || "";
    var init = accountInitials(name);

    /* the account card in the sidebar: initials, name and the signed-in address */
    var side = $(".dside-card");
    if (side) {
      var sideAva = $(".ava", side);
      if (sideAva && init) sideAva.textContent = init;
      var sideB = $(".dn-user-txt b", side);
      if (sideB && name) sideB.textContent = name;
      var sideMail = $(".dn-user-txt small", side);
      if (sideMail) {
        sideMail.textContent = mail;
        sideMail.setAttribute("title", mail);
      }
    }

    /* the account button in the top bar keeps its role, the name follows the session */
    var duser = $(".duser");
    if (duser) {
      var dAva = $(".ava", duser);
      if (dAva && init) dAva.textContent = init;
      var dB = $(".duser-tx b", duser);
      if (dB && first) dB.textContent = first;
      var dSmall = $(".duser-tx small", duser);
      if (dSmall) dSmall.setAttribute("title", mail);
    }

    /* "Your account" dropdown heading: full name over the address */
    var head = $('[data-ddpanel="usermenu"] .ddrop-hd');
    if (head) {
      var hB = $("b", head);
      if (hB && name) hB.textContent = name;
      var hS = $("span", head);
      if (hS) hS.textContent = mail;
    }

    /* profile form fields that carry the account address and name */
    var fFirst = $("[data-session-first]"), fLast = $("[data-session-last]");
    if (fFirst) fFirst.value = first;
    if (fLast) fLast.value = parts.slice(1).join(" ");
    $$("[data-session-mail]").forEach(function (el) {
      if ("value" in el) el.value = mail;
      else el.textContent = mail;
    });
  }

  /* signing out forgets the address, so the next visit starts clean */
  function dSignout() {
    $$('a[href="signin.html"]').forEach(function (a) {
      a.addEventListener("click", function () {
        try { window.localStorage.removeItem(SESSION_KEY); } catch (e) {}
      });
    });
  }

  /* ---------- boot --------------------------------------------------------- */
  function boot() {
    dIndex();
    dSide();
    dStuck();
    dDrop();
    dSearch404();
    dTabs();
    dReorderFilters();
    dTable();
    dRows();
    dDraw();
    dQty();
    dAdd();
    dSwitch();
    dUpload();
    dActions();
    dPrint();
    dSession();
    dSignout();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
