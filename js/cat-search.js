/* Category search (Figma "Search" 15:6512): rotating placeholder carousel,
   live filtering of the active grid with staggered tile pop, clear button. */
(function () {
  var box = document.getElementById("catSearch");
  if (!box) return;
  var input = document.getElementById("catSearchInput");
  var clearBtn = document.getElementById("catSearchClear");
  var track = box.querySelector(".cs-ph-track");
  var canvas = document.querySelector(".cat-canvas");

  /* ---- rotating placeholder ---- */
  var STEP = 18;
  var idx = 0;
  var wordCount = track.children.length - 1; // last entry clones the first for a seamless loop
  setInterval(function () {
    if (box.classList.contains("has-value")) return;
    idx++;
    track.classList.add("roll");
    track.style.transform = "translateY(" + (-idx * STEP) + "px)";
  }, 2400);
  track.addEventListener("transitionend", function () {
    if (idx >= wordCount) {
      idx = 0;
      track.classList.remove("roll");
      track.style.transform = "translateY(0)";
    }
  });

  /* ---- searchable name per card ---- */
  var BRANDS = {
    croma: "Croma",
    dotkey: "Dot & Key DotKey",
    nykaa: "Nykaa",
    foxtale: "Foxtale",
    mamaearth: "Mamaearth",
    myntra: "Myntra",
    derma: "The Derma Co",
    amazon: "Amazon amazon.in",
    flipkart: "Flipkart",
    lavie: "Lavie World",
    caffeine: "mCaffeine"
  };
  var LOAN_LOGOS = {
    imgImage66644: "HDFC Bank Personal Loan",
    imgImage67799: "Axis Bank Personal Loan",
    imgImage67800: "Prefr Personal Loan",
    imgImage67800b: "Prefr Personal Loan",
    imgImage67801: "Fibe Personal Loan",
    imgImage67802: "Zype Personal Loan",
    imgImage67802b: "Tata Capital Personal Loan",
    imgImage67803: "Moneyview Personal Loan",
    imgImage67804: "Olyv Personal Loan",
    imgImage67805: "Zype Personal Loan"
  };
  function nameFor(card) {
    if (card.dataset.searchName !== undefined) return card.dataset.searchName;
    var name = "";
    var ccTitle = card.querySelector(".cc-title");
    if (ccTitle) name = ccTitle.textContent;
    if (!name) {
      var panel = card.querySelector(".panel");
      if (panel) {
        for (var i = 0; i < panel.classList.length; i++) {
          var m = panel.classList[i].match(/^panel--(.+)$/);
          if (m && BRANDS[m[1]]) { name = BRANDS[m[1]]; break; }
        }
      }
    }
    if (!name) {
      var logo = card.querySelector(".loan-logo img");
      if (logo) {
        var file = (logo.getAttribute("src") || "").split("/").pop().replace(/\.\w+$/, "");
        name = LOAN_LOGOS[file] || "";
      }
    }
    card.dataset.searchName = name.replace(/\s+/g, " ").trim();
    return card.dataset.searchName;
  }

  /* ---- empty state ---- */
  var empty = document.createElement("div");
  empty.className = "search-empty";
  empty.innerHTML =
    '<div class="se-ring"><img src="assets/c/imgSearch.svg" alt=""></div>' +
    '<div class="se-title"></div>' +
    '<div class="se-sub">Try a different brand or category</div>';
  canvas.appendChild(empty);

  /* ---- filtering ---- */
  var debounce;
  var lastQuery = "";
  function applyFilter(q) {
    var grid = document.querySelector(".grid-active");
    if (!grid) return;
    q = q.trim().toLowerCase();
    var shown = 0;
    for (var i = 0; i < grid.children.length; i++) {
      var card = grid.children[i];
      var hit = !q || nameFor(card).toLowerCase().indexOf(q) !== -1;
      card.classList.toggle("search-hide", !hit);
      if (hit) card.style.setProperty("--i", shown++);
    }
    grid.classList.remove("search-pop");
    void grid.offsetWidth; // restart the stagger animation
    if (q) grid.classList.add("search-pop");
    if (q && shown === 0) {
      empty.querySelector(".se-title").textContent =
        "No matches for “" + input.value.trim() + "”";
      empty.classList.add("show");
    } else {
      empty.classList.remove("show");
    }
  }

  input.addEventListener("input", function () {
    box.classList.toggle("has-value", input.value.length > 0);
    clearTimeout(debounce);
    debounce = setTimeout(function () {
      if (input.value === lastQuery) return;
      lastQuery = input.value;
      applyFilter(input.value);
    }, 140);
  });

  box.addEventListener("click", function () { input.focus(); });

  function clearSearch(refocus) {
    clearTimeout(debounce);
    input.value = "";
    lastQuery = "";
    box.classList.remove("has-value");
    applyFilter("");
    if (refocus) input.focus();
  }
  clearBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    clearSearch(true);
  });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") clearSearch(true);
  });

  /* reset silently when switching category via the sidebar */
  var rows = document.querySelectorAll(".sb-row");
  function resetAll() {
    if (!input.value && !lastQuery) return;
    clearTimeout(debounce);
    input.value = "";
    lastQuery = "";
    box.classList.remove("has-value");
    empty.classList.remove("show");
    var grids = document.querySelectorAll(".tile-grid, .cc-grid");
    for (var g = 0; g < grids.length; g++) {
      grids[g].classList.remove("search-pop");
      for (var c = 0; c < grids[g].children.length; c++) {
        grids[g].children[c].classList.remove("search-hide");
      }
    }
  }
  for (var r = 0; r < rows.length; r++) {
    rows[r].addEventListener("click", resetAll);
  }
})();
