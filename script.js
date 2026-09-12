      /* COUNTERS — the real numbers already sit in the HTML (see index.html).
      This just animates on top of that; if it never runs, the page is
      already correct. */
      const counters = document.querySelectorAll(".count");
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
   
      function animateCount(el) {
        const target = Number(el.dataset.target);
        const suffix = el.dataset.suffix ?? "+";
        if (!Number.isFinite(target)) return;
   
        if (prefersReducedMotion) {
          el.textContent = target + suffix;
          return;
        }
   
        const DURATION = 1400;
        const start = performance.now();
   
        const step = (now) => {
          const progress = Math.min((now - start) / DURATION, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
          el.textContent = Math.round(target * eased) + (progress === 1 ? suffix : "");
          if (progress < 1) requestAnimationFrame(step);
        };
   
        requestAnimationFrame(step);
      }
   
      const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          obs.unobserve(entry.target); // fire exactly once — stops the re-trigger/drift bug
        });
      }, { threshold: 0.4 });
   
      counters.forEach((el) => counterObserver.observe(el));

   /* SECTION REVEAL */
   const sections = document.querySelectorAll("section");

   const sObs = new IntersectionObserver(e => {
     e.forEach(x => {
       if (x.isIntersecting) x.target.classList.add("show");
     });
   }, { threshold: 0.15 });

   sections.forEach(s => sObs.observe(s));



   /* VIDEO AUTO PLAY */
   const v = document.getElementById("v");

   const videoObs = new IntersectionObserver(e => {
     e.forEach(x => {
       if (x.isIntersecting) {
         v.play();
       } else {
         v.pause();
       }
     });
   }, { threshold: 0.5 });

   if (v) videoObs.observe(v);



 /* Extra safety net for the top-of-page fix in <head>: some mobile browsers
    re-apply scroll restoration after images/map tiles finish loading, or when
    a page is restored from the back/forward cache. */
//  window.addEventListener("load", () => window.scrollTo(0, 0));
//  window.addEventListener("pageshow", (e) => { if (e.persisted) window.scrollTo(0, 0); });

 const video = document.querySelector(".workshop-video");

 const observer = new IntersectionObserver((entries) => {
   entries.forEach(entry => {
     if (entry.isIntersecting) {
       video.play();
     } else {
       video.pause();
     }
   });
 }, {
   threshold: 0.6
 });

 observer.observe(video);

 const menuToggle = document.getElementById("menuToggle");
 const sidebar = document.getElementById("sidebar");
 const overlay = document.getElementById("overlay");
 const closeBtn = document.getElementById("closeBtn");

 function openMenu() {
   sidebar.classList.add("open");
   overlay.classList.add("show");
   document.body.classList.add("menu-open");
   sidebar.setAttribute("aria-hidden", "false");
 }

 function closeMenu() {
   sidebar.classList.remove("open");
   overlay.classList.remove("show");
   document.body.classList.remove("menu-open");
   sidebar.setAttribute("aria-hidden", "true");
 }

 menuToggle.addEventListener("click", openMenu);
 closeBtn.addEventListener("click", closeMenu);
 closeBtn.addEventListener("keydown", (e) => {
   if (e.key === "Enter" || e.key === " ") closeMenu();
 });
 overlay.addEventListener("click", closeMenu);

 sidebar.querySelectorAll("a").forEach((link) => {
   link.addEventListener("click", closeMenu);
 });

  /* WORKSHOP OPEN/CLOSED STATUS
    Source of truth: 0 = Sunday … 6 = Saturday. null = closed all day.
    Matches the printed hours in index.html: Mon–Thu & Sat–Sun 9AM–9PM, Friday closed. */
    const WORKSHOP_HOURS = {
      0: [9, 21], // Sunday
      1: [9, 21], // Monday
      2: [9, 21], // Tuesday
      3: [9, 21], // Wednesday
      4: [9, 21], // Thursday
      5: null,    // Friday — CLOSED
      6: [9, 21], // Saturday
    };
   
    function getWorkshopStatus() {
      // Evaluate "now" in Asia/Karachi, regardless of the visitor's own device
      // timezone — a diaspora customer checking from the UK should see the
      // same answer as someone standing outside the workshop.
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Karachi",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      }).formatToParts(new Date());
   
      const get = (type) => parts.find((p) => p.type === type).value;
      const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      const day = dayMap[get("weekday")];
      const time = Number(get("hour")) + Number(get("minute")) / 60;
   
      const todayHours = WORKSHOP_HOURS[day];
      if (!todayHours) return { open: false, label: "Closed Today" };
   
      const [opens, closes] = todayHours;
      if (time < opens) return { open: false, label: `Opens at ${opens}:00 AM` };
      if (time >= closes) return { open: false, label: "Closed Now" };
      return { open: true, label: "Open Now" };
    }
   
    function updateWorkshopStatus() {
      const { open: isOpen, label } = getWorkshopStatus();
   
      const statusText = document.getElementById("statusText");
      const statusDot = document.getElementById("statusDot");
      const statusBadge = document.getElementById("statusBadge");
      const heroStatus = document.getElementById("heroTimingStatus");
      const heroDot = document.getElementById("heroTimingDot");
      const popupStatus = document.getElementById("popupStatusText");
      const popupDot = document.getElementById("popupStatusDot");
      const chipStatus = document.getElementById("chipStatusText");
      const chipDot = document.getElementById("chipStatusDot");
   
      if (statusText) statusText.textContent = label;
      if (heroStatus) heroStatus.textContent = label;
      if (popupStatus) popupStatus.textContent = label;
      if (chipStatus) chipStatus.textContent = label;
   
      [statusDot, heroDot, popupDot, chipDot].forEach((dot) => {
        if (!dot) return;
        dot.classList.toggle("dot-open", isOpen);
        dot.classList.toggle("dot-closed", !isOpen);
      });
   
      if (statusBadge) {
        statusBadge.classList.toggle("open", isOpen);
        statusBadge.classList.toggle("closed", !isOpen);
      }
    }
   
    updateWorkshopStatus();
    setInterval(updateWorkshopStatus, 60000);


 /* WORKSHOP GALLERY SLIDER */
 const galleryTrack = document.getElementById("galleryTrack");
 const galleryPrev = document.getElementById("galleryPrev");
 const galleryNext = document.getElementById("galleryNext");

 if (galleryTrack && galleryPrev && galleryNext) {
   const scrollGallery = (dir) => {
     const slide = galleryTrack.querySelector(".gallery-slide-v2");
     const amount = slide ? slide.getBoundingClientRect().width + 16 : 300;
     galleryTrack.scrollBy({ left: dir * amount, behavior: "smooth" });
   };
   galleryPrev.addEventListener("click", () => scrollGallery(-1));
   galleryNext.addEventListener("click", () => scrollGallery(1));
 }

 /* REVIEW CARD READ MORE TOGGLE */
 document.querySelectorAll(".review-card .read-more").forEach((btn) => {
   btn.addEventListener("click", () => {
     const card = btn.closest(".review-card");
     card.classList.toggle("expanded");
     btn.textContent = card.classList.contains("expanded") ? "Show less" : "Read more";
   });
 });

 const navbarEl = document.querySelector(".navbar");
function handleNavScroll() {
 if (window.scrollY > 40) {
   navbarEl.classList.add("scrolled");
 } else {
   navbarEl.classList.remove("scrolled");
 }
}
window.addEventListener("scroll", handleNavScroll, { passive: true });
handleNavScroll();

/* DIRECTIONS BUTTON — builds a real route (not just a destination pin) by
  grabbing the visitor's current location first, so Google Maps shows an
  actual route + travel time instead of just dropping a pin. Bound via
  delegation on document since the button lives inside a MapLibre popup
  that's created dynamically.

  IMPORTANT: the tab is opened synchronously, at the moment of the click,
  and only *navigated* once geolocation resolves. Opening it after the
  async geolocation callback (the previous version) loses the browser's
  "this came from a real click" flag, so most browsers silently treat it
  as a blocked popup — which is why Directions looked broken even though
  the URL-building logic itself was correct. */
(function () {
  const SHOP_DEST = "33.129338,73.796815";

 function buildUrl(origin) {
   const originParam = origin ? `&origin=${origin}` : "";
   return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${SHOP_DEST}&travelmode=driving`;
 }

 function openDirections(btn) {
   const originalLabel = btn.textContent;

   // Open the tab RIGHT NOW, synchronously, while still inside the click
   // handler — this is what keeps it from being blocked as a popup.
   const newTab = window.open("", "_blank");
   if (newTab) {
     newTab.opener = null; // sever the opener link for security
     newTab.document.write(
       '<title>Opening directions…</title>' +
       '<body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;' +
       'font-family:sans-serif;color:#122C57;background:#F5EEE1;">Getting your location…</body>'
     );
   }

   const goTo = (url) => {
     if (newTab && !newTab.closed) {
       newTab.location.href = url;
     } else {
       // Popup was blocked or the user closed it already — fall back to
       // navigating the current tab so the click still does *something*.
       window.location.href = url;
     }
     btn.textContent = originalLabel;
     btn.disabled = false;
   };

   if (!("geolocation" in navigator)) {
     goTo(buildUrl(null));
     return;
   }

   btn.textContent = "Locating…";
   btn.disabled = true;

   navigator.geolocation.getCurrentPosition(
     (pos) => goTo(buildUrl(`${pos.coords.latitude},${pos.coords.longitude}`)),
     () => goTo(buildUrl(null)), // denied/unavailable — still go, just without a forced origin
     { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
   );
 }

 document.addEventListener("click", (e) => {
   const btn = e.target.closest("#popupDirectionsBtn");
   if (btn) openDirections(btn);
 });
})();

/* INTERACTIVE SHOP MAP (MapLibre) */
(function () {
 const mapEl = document.getElementById("shopMap");
 if (!mapEl || typeof maplibregl === "undefined") return;

 const SHOP_COORDS = [73.796815, 33.129338]; // [lng, lat]
 let shopMapStarted = false;

 function initShopMap() {
   if (shopMapStarted) return;
   shopMapStarted = true;

   const shopMap = new maplibregl.Map({
     container: "shopMap",
     /* Voyager has more visible detail (POIs, landmarks, colored roads) than
        the plain Positron style, while staying light enough to match the site. */
     style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
     center: SHOP_COORDS,
     zoom: 15.5,
     attributionControl: { compact: true },
   });

   shopMap.once("load", () => {
     const style = shopMap.getStyle();

     if (style && style.layers) {
       style.layers.forEach((layer) => {
         /* --- 1. Force English labels ---
            Skip layers whose text isn't name-based at all (route ref numbers,
            house numbers, elevation, etc.) — only rewrite ones that show a
            place/road/POI name, using this style's actual field key "name_en". */
         if (layer.type === "symbol") {
           const field = layer.layout && layer.layout["text-field"];
           if (field && /name/i.test(JSON.stringify(field))) {
             try {
               shopMap.setLayoutProperty(layer.id, "text-field", [
                 "coalesce",
                 ["get", "name_en"],
                 ["get", "name:en"],
                 ["get", "name"],
               ]);
             } catch (e) { /* not every "name"-looking layer supports this — ignore */ }
           }
         }
       });
     }

     /* --- 2. Brand-tinted colors on confirmed Voyager layer ids ---
        (checked against this style's real layers first, so nothing silently
        fails to apply or throws on a made-up layer id) */
     const colorLayer = (id, prop, value) => {
       if (shopMap.getLayer(id)) {
         try { shopMap.setPaintProperty(id, prop, value); } catch (e) { /* ignore */ }
       }
     };
     colorLayer("water", "fill-color", "#cfe3ef");             // soft brand-blue water
     colorLayer("landcover", "fill-color", "#e7f0e0");          // parks / wooded areas
     colorLayer("park_national_park", "fill-color", "#e7f0e0");
     colorLayer("park_nature_reserve", "fill-color", "#e7f0e0");
     colorLayer("landuse_residential", "fill-color", "#f7efe0"); // residential blocks, warm cream tint

     /* --- 3. ~150m translucent coverage ring in the brand orange —
        extra visual info: roughly the shop's immediate neighborhood --- */
     const toCircleGeoJSON = (center, radiusMeters, points = 64) => {
       const coords = [];
       const [lng, lat] = center;
       const latRad = (lat * Math.PI) / 180;
       const metersPerDegLng = 111320 * Math.cos(latRad);
       const metersPerDegLat = 110540;
       for (let i = 0; i <= points; i++) {
         const angle = (i / points) * 2 * Math.PI;
         coords.push([
           lng + (Math.cos(angle) * radiusMeters) / metersPerDegLng,
           lat + (Math.sin(angle) * radiusMeters) / metersPerDegLat,
         ]);
       }
       return { type: "Feature", geometry: { type: "Polygon", coordinates: [coords] }, properties: {} };
     };

     shopMap.addSource("shop-coverage", { type: "geojson", data: toCircleGeoJSON(SHOP_COORDS, 150) });
     shopMap.addLayer({
       id: "shop-coverage-fill",
       type: "fill",
       source: "shop-coverage",
       paint: { "fill-color": "#FF5A36", "fill-opacity": 0.08 },
     });
     shopMap.addLayer({
       id: "shop-coverage-line",
       type: "line",
       source: "shop-coverage",
       paint: { "line-color": "#FF5A36", "line-width": 1.5, "line-opacity": 0.45, "line-dasharray": [2, 2] },
     });
   });

   /* Scale bar = a bit more useful information on the map itself */
   shopMap.addControl(new maplibregl.ScaleControl({ maxWidth: 90, unit: "metric" }), "bottom-left");

   /* Don't trap page scroll inside the map; only zoom once the user
      has clicked in, same pattern the Google embed above already uses. */
   shopMap.scrollZoom.disable();
   mapEl.addEventListener("click", () => shopMap.scrollZoom.enable());
   mapEl.addEventListener("mouseleave", () => shopMap.scrollZoom.disable());

   /* Custom pulsing marker */
   const markerEl = document.createElement("div");
   markerEl.className = "shop-marker";
   markerEl.innerHTML = '<span class="shop-marker-pulse"></span>';

   /* Popup content — mirrors the workshop-timing status badge already on the page */
   const popupHTML = `
     <div class="shop-popup">
       <img src="https://images.unsplash.com/photo-1632823469850-2f77dd9c7f93?auto=format&fit=crop&w=400&q=80" alt="Farhan Mughal Auto Electrician workshop">
       <div class="shop-popup-body">
         <p class="shop-popup-eyebrow">Auto Repair Shop</p>
         <h4>Farhan Mughal Auto Electrician</h4>
         <div class="shop-popup-rating">
           <span class="stars-inline">★★★★★</span>
           <span>4.9</span>
           <span class="shop-popup-muted">(500+ reviews)</span>
         </div>
         <div class="status-badge" id="popupStatusBadge">
           <span class="status-dot" id="popupStatusDot"></span>
           <span id="popupStatusText">Checking...</span>
         </div>
         <div class="shop-popup-actions">
           <button type="button" class="btn primary shop-popup-btn" id="popupDirectionsBtn">Directions</button>
           <a href="tel:+923410576603" class="shop-popup-icon-btn" aria-label="Call the workshop">📞</a>
         </div>
       </div>
     </div>`;

   const popup = new maplibregl.Popup({ offset: 12, closeButton: false, maxWidth: "none" })
     .setHTML(popupHTML);

   /* Re-run the open/closed check once the popup's markup is actually in the DOM */
   popup.on("open", () => {
     if (typeof updateWorkshopStatus === "function") updateWorkshopStatus();
   });

   new maplibregl.Marker({ element: markerEl })
     .setLngLat(SHOP_COORDS)
     .setPopup(popup)
     .addTo(shopMap);

   /* Always-visible info chip (name + live open/closed) so key info is
      readable at a glance without needing to tap the pin first */
   const infoChip = document.createElement("div");
   infoChip.className = "shop-map-chip";
   infoChip.innerHTML = `
     <span class="status-dot" id="chipStatusDot"></span>
     <span>Farhan Mughal Auto Electrician</span>
     <span class="shop-map-chip-sep">•</span>
     <span id="chipStatusText">Checking...</span>`;
   mapEl.appendChild(infoChip);
   if (typeof updateWorkshopStatus === "function") updateWorkshopStatus();

   /* Custom controls (styled to match the site rather than default MapLibre UI) */
   const zoomInBtn = document.getElementById("mapZoomIn");
   const zoomOutBtn = document.getElementById("mapZoomOut");
   const locateBtn = document.getElementById("mapLocate");

   if (zoomInBtn) zoomInBtn.addEventListener("click", () => shopMap.zoomTo(shopMap.getZoom() + 1, { duration: 300 }));
   if (zoomOutBtn) zoomOutBtn.addEventListener("click", () => shopMap.zoomTo(shopMap.getZoom() - 1, { duration: 300 }));
   if (locateBtn) {
     locateBtn.addEventListener("click", () => {
       shopMap.flyTo({ center: SHOP_COORDS, zoom: 15.5, duration: 1000 });
     });
   }

   /* Keep the map's own canvas sized correctly if the section is resized
      (e.g. rotating a phone) after it's already loaded */
   window.addEventListener("resize", () => shopMap.resize());
 }

 /* Lazy-init: only create the (heavy) map once its section actually scrolls
    into view. This is also what stops the page from jumping down to the
    map on load/refresh — nothing about it runs until the visitor has
    already scrolled near it themselves. */
 if ("IntersectionObserver" in window) {
   const observer = new IntersectionObserver(
     (entries) => {
       entries.forEach((entry) => {
         if (entry.isIntersecting) {
           initShopMap();
           observer.disconnect();
         }
       });
     },
     { rootMargin: "400px 0px" }
   );
   observer.observe(mapEl);
 } else {
   initShopMap(); // very old browsers: just load it normally
 }
})();
















/* ============================================================
   EFI CHECKLIST / POSTER MODAL
   ============================================================ */

   (() => {

    const modal = document.getElementById("efiModal");
  
    if (!modal) return;
  
    const openButtons = [
      document.getElementById("openEfiChecklist"),
      document.getElementById("openEfiChecklist2"),
      document.getElementById("openPoster")
    ].filter(Boolean);
  
    const closeButton = document.getElementById("closeEfiModal");
    const backdrop = document.getElementById("efiModalBackdrop");
  
  
    function openModal() {
  
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
  
      document.body.classList.add("efi-modal-open");
  
    }
  
  
    function closeModal() {
  
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
  
      document.body.classList.remove("efi-modal-open");
  
    }
  
  
    openButtons.forEach(button => {
  
      button.addEventListener("click", openModal);
  
    });
  
  
    if (closeButton) {
      closeButton.addEventListener("click", closeModal);
    }
  
  
    if (backdrop) {
      backdrop.addEventListener("click", closeModal);
    }
  
  
    document.addEventListener("keydown", event => {
  
      if (event.key === "Escape" && modal.classList.contains("open")) {
        closeModal();
      }
  
    });
  
  })();
  
  
  /* ============================================================
     EFI SECTION SCROLL ANIMATION
     ============================================================ */
  
  (() => {
  
    const efiSection = document.querySelector(".efi-section");
  
    if (!efiSection) return;
  
  
    if ("IntersectionObserver" in window) {
  
      const observer = new IntersectionObserver(
  
        entries => {
  
          entries.forEach(entry => {
  
            if (entry.isIntersecting) {
  
              efiSection.classList.add("visible");
  
              observer.unobserve(efiSection);
  
            }
  
          });
  
        },
  
        {
          threshold: 0.2
        }
  
      );
  
      observer.observe(efiSection);
  
    } else {
  
      efiSection.classList.add("visible");
  
    }
  
  })();


  