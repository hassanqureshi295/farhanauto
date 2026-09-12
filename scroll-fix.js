/* Always start at the top of the page on load/refresh — even if the address
   bar still has a #section hash left over from an earlier click, e.g. #contact.
   Loaded synchronously in <head>, before the browser tries to scroll to
   that anchor, so it must run before anything else on the page. */
   if ("scrollRestoration" in history) history.scrollRestoration = "manual";
   if (window.location.hash) {
     history.replaceState(null, "", window.location.pathname + window.location.search);
   }
   window.scrollTo(0, 0);