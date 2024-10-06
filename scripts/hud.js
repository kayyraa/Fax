import * as fax from "./faxpro.js";

Array.from(document.querySelectorAll("*")).forEach(HrefLink => {
    if (HrefLink.hasAttribute("hreflink") && HrefLink.hasAttribute("href")) {
        HrefLink.addEventListener("mouseenter", () => fax.ShowLink(HrefLink.getAttribute("href"), true));
        HrefLink.addEventListener("mouseleave", () => fax.ShowLink(HrefLink.getAttribute("href"), false));
        HrefLink.addEventListener("click", () => window.open(HrefLink.getAttribute("href")));
    }
});

document.querySelectorAll("*").forEach((e) => {
    e.style["touch-action"] = "manipulation";
});

new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
            mutation.addedNodes[i].style["touch-action"] = "manipulation";
        }
    });
}).observe(document.body, {
    childList: true,
    subtree: true,
});