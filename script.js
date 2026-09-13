/* COUNTERS
   Real numbers already sit in the HTML — this only animates on top of
   them, so the page is correct even if this script never runs. */
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
       obs.unobserve(entry.target); // fire once — prevents re-trigger/drift on re-scroll
     });
   }, { threshold: 0.4 });
   
   counters.forEach((el) => counterObserver.observe(el));
   
   
   /* SECTION REVEAL */
   const sections = document.querySelectorAll("section");
   
   const sectionObserver = new IntersectionObserver((entries) => {
     entries.forEach((entry) => {
       if (entry.isIntersecting) entry.target.classList.add("show");
     });
   }, { threshold: 0.15 });
   
   sections.forEach((s) => sectionObserver.observe(s));
   
   
   /* WORKSHOP VIDEO — plays only while in view */
   const workshopVideo = document.querySelector(".workshop-video");
   
   if (workshopVideo) {
     const videoObserver = new IntersectionObserver((entries) => {
       entries.forEach((entry) => {
         if (entry.isIntersecting) workshopVideo.play();
         else workshopVideo.pause();
       });
     }, { threshold: 0.6 });
   
     videoObserver.observe(workshopVideo);
   }
   
   
   /* MOBILE MENU
      `inert` keeps the closed sidebar out of the tab order and accessibility
      tree entirely, and is toggled alongside aria-hidden. Sidebar links close
      the menu on a setTimeout(0) rather than immediately: applying `inert` to
      an ancestor of the just-tapped link in the same tick as the click cancels
      the link's default navigation on some mobile browsers. */
   (function () {
     const menuToggle = document.getElementById("menuToggle");
     const sidebar = document.getElementById("sidebar");
     const overlay = document.getElementById("overlay");
     const closeBtn = document.getElementById("closeBtn");
   
     if (!menuToggle || !sidebar || !overlay || !closeBtn) {
       console.error("Mobile menu: one or more required elements missing", {
         menuToggle, sidebar, overlay, closeBtn,
       });
       return;
     }
   
     function openMenu() {
       sidebar.classList.add("open");
       overlay.classList.add("show");
       document.body.classList.add("menu-open");
       sidebar.removeAttribute("inert");
       sidebar.setAttribute("aria-hidden", "false");
       menuToggle.setAttribute("aria-expanded", "true");
       closeBtn.focus();
     }
   
     function closeMenu() {
       sidebar.classList.remove("open");
       overlay.classList.remove("show");
       document.body.classList.remove("menu-open");
       sidebar.setAttribute("aria-hidden", "true");
       sidebar.setAttribute("inert", "");
       menuToggle.setAttribute("aria-expanded", "false");
       menuToggle.focus();
     }
   
     menuToggle.addEventListener("click", openMenu);
     closeBtn.addEventListener("click", closeMenu);
     closeBtn.addEventListener("keydown", (e) => {
       if (e.key === "Enter" || e.key === " ") closeMenu();
     });
     overlay.addEventListener("click", closeMenu);
   
     sidebar.querySelectorAll("a").forEach((link) => {
       link.addEventListener("click", () => setTimeout(closeMenu, 0));
     });
   
     document.addEventListener("keydown", (e) => {
       if (e.key === "Escape" && sidebar.classList.contains("open")) closeMenu();
     });
   })();
   
   
   /* WORKSHOP OPEN/CLOSED STATUS
      Source of truth: 0 = Sunday … 6 = Saturday, null = closed all day.
      Matches the printed hours in index.html: Mon–Thu & Sat–Sun 9AM–9PM,
      Friday closed. Evaluated in Asia/Karachi regardless of the visitor's
      own device timezone, so a diaspora customer sees the same answer as
      someone standing outside the workshop. */
   const WORKSHOP_HOURS = {
     0: [9, 21], // Sunday
     1: [9, 21], // Monday
     2: [9, 21], // Tuesday
     3: [9, 21], // Wednesday
     4: [9, 21], // Thursday
     5: null,    // Friday — closed
     6: [9, 21], // Saturday
   };
   
   function getWorkshopStatus() {
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
   
   
   /* REVIEW CARD "READ MORE" TOGGLE */
   document.querySelectorAll(".review-card .read-more").forEach((btn) => {
     btn.addEventListener("click", () => {
       const card = btn.closest(".review-card");
       card.classList.toggle("expanded");
       btn.textContent = card.classList.contains("expanded") ? "Show less" : "Read more";
     });
   });
   
   
   /* NAVBAR SCROLL STATE */
   const navbarEl = document.querySelector(".navbar");
   
   function handleNavScroll() {
     navbarEl.classList.toggle("scrolled", window.scrollY > 40);
   }
   
   window.addEventListener("scroll", handleNavScroll, { passive: true });
   handleNavScroll();
   
   
   /* DIRECTIONS BUTTON (map popup)
      Builds a real route (not just a destination pin) using the visitor's
      current location. The tab is opened synchronously inside the click
      handler and only navigated once geolocation resolves — opening it
      *after* the async callback loses the browser's "this came from a real
      click" flag and gets silently treated as a blocked popup. */
   (function () {
     const SHOP_DEST = "33.129338,73.796815";
   
     function buildUrl(origin) {
       const originParam = origin ? `&origin=${origin}` : "";
       return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${SHOP_DEST}&travelmode=driving`;
     }
   
     function openDirections(btn) {
       const originalLabel = btn.textContent;
   
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
           // popup blocked or closed — fall back to the current tab
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
         () => goTo(buildUrl(null)), // denied/unavailable — still go, without a forced origin
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
         // Voyager shows more detail (POIs, landmarks, colored roads) than
         // plain Positron, while staying light enough to match the site.
         style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
         center: SHOP_COORDS,
         zoom: 15.5,
         attributionControl: { compact: true },
       });
   
       shopMap.once("load", () => {
         const style = shopMap.getStyle();
   
         if (style && style.layers) {
           style.layers.forEach((layer) => {
             // Force English labels — only on layers that actually render a
             // name (skip route numbers, house numbers, elevation, etc.),
             // using this style's real field key "name_en".
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
                 } catch (e) { /* not every "name"-looking layer supports this */ }
               }
             }
           });
         }
   
         // Brand-tinted colors, checked against this style's real layer ids
         // first so nothing silently fails on a made-up id.
         const colorLayer = (id, prop, value) => {
           if (shopMap.getLayer(id)) {
             try { shopMap.setPaintProperty(id, prop, value); } catch (e) { /* ignore */ }
           }
         };
         colorLayer("water", "fill-color", "#cfe3ef");
         colorLayer("landcover", "fill-color", "#e7f0e0");
         colorLayer("park_national_park", "fill-color", "#e7f0e0");
         colorLayer("park_nature_reserve", "fill-color", "#e7f0e0");
         colorLayer("landuse_residential", "fill-color", "#f7efe0");
   
         // ~150m translucent coverage ring in the brand orange
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
   
       shopMap.addControl(new maplibregl.ScaleControl({ maxWidth: 90, unit: "metric" }), "bottom-left");
   
       // Don't trap page scroll inside the map; only zoom once clicked in.
       shopMap.scrollZoom.disable();
       mapEl.addEventListener("click", () => shopMap.scrollZoom.enable());
       mapEl.addEventListener("mouseleave", () => shopMap.scrollZoom.disable());
   
       const markerEl = document.createElement("div");
       markerEl.className = "shop-marker";
       markerEl.innerHTML = '<span class="shop-marker-pulse"></span>';
   
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
   
       popup.on("open", () => {
         if (typeof updateWorkshopStatus === "function") updateWorkshopStatus();
       });
   
       new maplibregl.Marker({ element: markerEl })
         .setLngLat(SHOP_COORDS)
         .setPopup(popup)
         .addTo(shopMap);
   
       // Always-visible info chip (name + live open/closed) — readable at a
       // glance, no tap required.
       const infoChip = document.createElement("div");
       infoChip.className = "shop-map-chip";
       infoChip.innerHTML = `
         <span class="status-dot" id="chipStatusDot"></span>
         <span>Farhan Mughal Auto Electrician</span>
         <span class="shop-map-chip-sep">•</span>
         <span id="chipStatusText">Checking...</span>`;
       mapEl.appendChild(infoChip);
       if (typeof updateWorkshopStatus === "function") updateWorkshopStatus();
   
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
   
       window.addEventListener("resize", () => shopMap.resize());
     }
   
     // Lazy-init: only build the (heavy) map once its section scrolls into
     // view. This also prevents any load-time jump toward the map — nothing
     // here runs until the visitor has already scrolled near it themselves.
     if ("IntersectionObserver" in window) {
       const observer = new IntersectionObserver((entries) => {
         entries.forEach((entry) => {
           if (entry.isIntersecting) {
             initShopMap();
             observer.disconnect();
           }
         });
       }, { rootMargin: "400px 0px" });
       observer.observe(mapEl);
     } else {
       initShopMap(); // very old browsers: just load it normally
     }
   })();
   
   
   /* EFI CHECKLIST / POSTER MODAL */
   (function () {
     const modal = document.getElementById("efiModal");
     if (!modal) return;
   
     const openButtons = [
       document.getElementById("openEfiChecklist"),
       document.getElementById("openEfiChecklist2"),
       document.getElementById("openPoster"),
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
   
     openButtons.forEach((button) => button.addEventListener("click", openModal));
     if (closeButton) closeButton.addEventListener("click", closeModal);
     if (backdrop) backdrop.addEventListener("click", closeModal);
   
     document.addEventListener("keydown", (event) => {
       if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
     });
   })();
   
   
   /* EFI SECTION SCROLL-IN ANIMATION */
   (function () {
     const efiSection = document.querySelector(".efi-section");
     if (!efiSection) return;
   
     if ("IntersectionObserver" in window) {
       const observer = new IntersectionObserver((entries) => {
         entries.forEach((entry) => {
           if (entry.isIntersecting) {
             efiSection.classList.add("visible");
             observer.unobserve(efiSection);
           }
         });
       }, { threshold: 0.2 });
       observer.observe(efiSection);
     } else {
       efiSection.classList.add("visible");
     }
   })();