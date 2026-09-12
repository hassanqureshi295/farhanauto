/* COUNTERS — real numbers already sit in the HTML; this just animates
   on top of that, same pattern as script.js on the homepage. */
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
       const eased = 1 - Math.pow(1 - progress, 3);
       el.textContent = Math.round(target * eased) + (progress === 1 ? suffix : "");
       if (progress < 1) requestAnimationFrame(step);
     };
   
     requestAnimationFrame(step);
   }
   
   const counterObserver = new IntersectionObserver((entries, obs) => {
     entries.forEach((entry) => {
       if (!entry.isIntersecting) return;
       animateCount(entry.target);
       obs.unobserve(entry.target);
     });
   }, { threshold: 0.4 });
   
   counters.forEach((el) => counterObserver.observe(el));
   
   
   /* SECTION REVEAL */
   const sections = document.querySelectorAll("section");
   
   const sObs = new IntersectionObserver(e => {
     e.forEach(x => {
       if (x.isIntersecting) x.target.classList.add("show");
     });
   }, { threshold: 0.12 });
   
   sections.forEach(s => sObs.observe(s));
   
   
   /* MOBILE MENU — accessible open/close */
   const menuToggle = document.getElementById("menuToggle");
   const sidebar = document.getElementById("sidebar");
   const overlay = document.getElementById("overlay");
   const closeBtn = document.getElementById("closeBtn");
   
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
   sidebar.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
   
   document.addEventListener("keydown", (e) => {
     if (e.key === "Escape" && sidebar.classList.contains("open")) closeMenu();
   });
   
   
   /* WORKSHOP OPEN/CLOSED STATUS — same source of truth as script.js on the
      homepage. Duplicated here (not shared) since about.html doesn't load
      script.js — keep both files in sync if hours ever change. */
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
   
     if (statusText) statusText.textContent = label;
     if (statusDot) {
       statusDot.classList.toggle("dot-open", isOpen);
       statusDot.classList.toggle("dot-closed", !isOpen);
     }
     if (statusBadge) {
       statusBadge.classList.toggle("open", isOpen);
       statusBadge.classList.toggle("closed", !isOpen);
     }
   }
   
   updateWorkshopStatus();
   setInterval(updateWorkshopStatus, 60000);
   
   
   /* NAVBAR SCROLL STATE */
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