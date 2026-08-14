/**
 * Formulaire de contact — jassiel-portfolio.site
 * Envoie vers le workflow n8n "Test-jassiel".
 *
 * Clés du payload = clés lues par le node InputAll :
 *   name → nom · email → mail_client · tel → téléphone · sujet → Sujet · message → message_client
 * Ne pas les renommer.
 *
 * À charger en fin de <body> : <script src="contact.js" defer></script>
 */
(function () {
  "use strict";

  /* ==========================================================
     CONFIGURATION — la seule partie à modifier
     ========================================================== */

  // Production URL du node Webhook1 dans n8n.
  // Format : https://TON-INSTANCE-N8N/webhook/Test-jassiel
  // (l'URL /webhook-test/ n'écoute que pendant un clic sur "Execute workflow")
  const WEBHOOK_URL = "https://n8n.srv1139844.hstgr.cloud/webhook/Test-jassiel";

  const CONTACT_EMAIL = "rakotoarinelinajassiel@gmail.com"; // affiché si l'envoi échoue
  const COOLDOWN_MS   = 60000;  // 1 envoi par minute et par navigateur
  const MIN_FILL_MS   = 3000;   // sous 3 s = robot
  const TIMEOUT_MS    = 15000;  // abandon de la requête

  /* ==========================================================
     Initialisation
     ========================================================== */

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    const form = document.getElementById("cf-form");
    if (!form) return;   // le formulaire n'est pas sur cette page

    const btn      = document.getElementById("cf-submit");
    const status   = document.getElementById("cf-status");
    const count    = document.getElementById("cf-count");
    const message  = document.getElementById("cf-message");
    const honeypot = document.getElementById("cf-website");
    const openedAt = Date.now();

    const say = (type, text) => { status.className = "cf-status show " + type; status.textContent = text; };
    const reset = () => { status.className = "cf-status"; status.textContent = ""; };

    const MAX = Number(message.getAttribute("maxlength")) || 2000;
    message.addEventListener("input", () => { count.textContent = message.value.length + " / " + MAX; });

    /* ---------- Règles de validation ---------- */
    const RULES = {
      "cf-name":    v => v.trim().length >= 2 || "Indiquez votre nom.",
      "cf-email":   v => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) || "Adresse email invalide.",
      "cf-tel":     v => !v.trim() || /^[+\d\s().-]{6,}$/.test(v.trim()) || "Numéro invalide.",
      "cf-sujet":   v => !!v || "Choisissez un sujet.",
      "cf-message": v => v.trim().length >= 15 || "Décrivez votre besoin en quelques mots (15 caractères min.)."
    };

    function validateField(id) {
      const el  = document.getElementById(id);
      const out = document.querySelector('.cf-err[data-for="' + id + '"]');
      const res = RULES[id](el.value);
      const ok  = res === true;
      el.classList.toggle("invalid", !ok);
      if (out) out.textContent = ok ? "" : res;
      return ok;
    }

    Object.keys(RULES).forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("blur",   () => validateField(id));
      el.addEventListener("change", () => validateField(id));
      el.addEventListener("input",  () => { if (el.classList.contains("invalid")) validateField(id); });
    });

    /* ---------- Envoi ---------- */
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      reset();

      const valid = Object.keys(RULES).map(validateField).every(Boolean);
      if (!valid) {
        say("ko", "Merci de corriger les champs en rouge.");
        const bad = form.querySelector(".invalid");
        if (bad) bad.focus();
        return;
      }

      // Anti-spam : on affiche un succès factice pour ne pas informer le robot
      if (honeypot.value || Date.now() - openedAt < MIN_FILL_MS) {
        say("ok", "Message envoyé. Merci !");
        form.reset();
        return;
      }

      const last = Number(localStorage.getItem("cf_last_send") || 0);
      if (Date.now() - last < COOLDOWN_MS) {
        const s = Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 1000);
        say("ko", "Message déjà envoyé. Merci de patienter " + s + " s.");
        return;
      }

      const payload = {
        name:    document.getElementById("cf-name").value.trim(),
        email:   document.getElementById("cf-email").value.trim(),
        tel:     document.getElementById("cf-tel").value.trim(),
        sujet:   document.getElementById("cf-sujet").value,
        message: message.value.trim(),
        page:    location.href,
        sentAt:  new Date().toISOString()
      };

      setLoading(true);

      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

      try {
        const res = await fetch(WEBHOOK_URL, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload),
          signal:  ctrl.signal
        });

        if (!res.ok) throw new Error("HTTP " + res.status);

        localStorage.setItem("cf_last_send", String(Date.now()));
        form.reset();
        count.textContent = "0 / " + MAX;
        say("ok", "Message bien reçu. Vous allez recevoir une première réponse par email dans quelques instants.");

      } catch (err) {
        say("ko", !navigator.onLine
          ? "Vous semblez hors connexion. Réessayez une fois reconnecté."
          : "L'envoi a échoué. Écrivez-moi directement à " + CONTACT_EMAIL + ".");
        console.error("[contact]", err);

      } finally {
        clearTimeout(timer);
        setLoading(false);
      }
    });

    function setLoading(on) {
      form.classList.toggle("sending", on);
      btn.disabled = on;
      btn.querySelector(".cf-submit-label").textContent = on ? "Envoi en cours…" : "Envoyer ma demande";
    }
  }
})();
