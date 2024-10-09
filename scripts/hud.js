import * as fax from "./faxpro.js";

Array.from(document.querySelectorAll("*")).forEach(HrefLink => {
    if (HrefLink.hasAttribute("hreflink") && HrefLink.hasAttribute("href")) {
        HrefLink.addEventListener("mouseenter", () => fax.ShowLink(HrefLink.getAttribute("href"), true));
        HrefLink.addEventListener("mouseleave", () => fax.ShowLink(HrefLink.getAttribute("href"), false));
        HrefLink.addEventListener("click", () => window.open(HrefLink.getAttribute("href")));
    }
});