document.addEventListener("DOMContentLoaded", function () {
    !(function () {
        const e = document.getElementById("hamburger"),
            t = document.querySelector("#navbar ul");
        e && t
            ? (e.addEventListener("click", function () {
                  t.classList.toggle("active"),
                      this.classList.toggle("open"),
                      t.querySelectorAll("li").forEach((e, n) => {
                          t.classList.contains("active")
                              ? setTimeout(() => {
                                    (e.style.opacity = "1"), (e.style.transform = "translateY(0)");
                                }, 100 * n)
                              : ((e.style.opacity = "0"), (e.style.transform = "translateY(-10px)"));
                      });
              }),
              document.querySelectorAll("#navbar a").forEach((n) => {
                  n.addEventListener("click", function () {
                      t.classList.remove("active"),
                          e.classList.remove("open"),
                          t.querySelectorAll("li").forEach((e) => {
                              (e.style.opacity = "0"), (e.style.transform = "translateY(-10px)");
                          });
                  });
              }))
            : console.warn("Hamburger or navList not found!");
    })(),
        (function () {
            const e = document.querySelector("#second-page .slider-container"),
                t = e.querySelector(".slider"),
                n = e.querySelectorAll(".slide"),
                r = e.querySelector(".round-button:first-child"),
                o = e.querySelector(".round-button:last-child");
            if (!t || 0 === n.length || !r || !o) return void console.warn("Slider elements missing in #second-page");
            function s() {
                const e = window.innerWidth;
                return e <= 480 ? 1 : e <= 768 ? 2 : e <= 1024 ? 3 : 4;
            }
            let a = s();
            const l = n.length;
            let i = 0,
                c = !1,
                u = null;
            function d(e = !0) {
                if (c) return;
                (c = e), (t.style.transition = e ? "transform 0.5s ease-in-out" : "none");
                const r = (100 / a) * -i;
                (t.style.transform = `translateX(${r}%)`),
                    n.forEach((e, t) => {
                        e.classList.toggle("active", Math.abs(t - i) < a);
                    }),
                    i >= l - a
                        ? setTimeout(
                              () => {
                                  (i = 0),
                                      (t.style.transition = "none"),
                                      (t.style.transform = "translateX(0%)"),
                                      (c = !1),
                                      m();
                              },
                              e ? 500 : 0
                          )
                        : i < 0 && ((i = Math.max(0, l - a)), d(!1)),
                    e
                        ? setTimeout(() => {
                              c = !1;
                          }, 500)
                        : (c = !1);
            }
            function m() {
                y(),
                    (u = setInterval(() => {
                        i < l - a ? (i++, d(!0)) : ((i = 0), d(!0));
                    }, 3e3));
            }
            function y() {
                u && (clearInterval(u), (u = null));
            }
            o.addEventListener("click", () => {
                c || ((i = Math.min(i + 1, l - a)), d(!0), y(), m());
            }),
                r.addEventListener("click", () => {
                    c || ((i = Math.max(i - 1, 0)), d(!0), y(), m());
                });
            let h = 0,
                v = 0;
            t.addEventListener("touchstart", (e) => {
                (h = e.touches[0].clientX), y();
            }),
                t.addEventListener("touchmove", (e) => {
                    v = e.touches[0].clientX;
                }),
                t.addEventListener("touchend", () => {
                    const e = h - v;
                    Math.abs(e) > 50 && ((i = e > 0 ? Math.min(i + 1, l - a) : Math.max(i - 1, 0)), d(!0)), m();
                }),
                e.addEventListener("mouseenter", y),
                e.addEventListener("mouseleave", m),
                window.addEventListener("resize", () => {
                    const e = s();
                    e !== a && ((a = e), (i = Math.min(i, l - a)), d(!1));
                }),
                d(!1),
                m();
        })();
}),
    document.querySelector(".contact-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const nameInput  = this.querySelector('input[type="text"]');
    const emailInput = this.querySelector('input[type="email"]');
    const phoneInput = this.querySelector('input[type="tel"]');
    const robotCheck = this.querySelector("#recaptcha-checkbox");
    const submitBtn  = this.querySelector(".submit-button");

    // Validations
    if (!nameInput.value.trim()) {
        alert("Please enter your full name");
        return;
    }
    if (!emailInput.value.trim()) {
        alert("Please enter your email");
        return;
    }
    if (!phoneInput.value.trim()) {
        alert("Please enter your phone number");
        return;
    }
    if (!robotCheck.checked) {
        alert("Please verify you are not a robot");
        return;
    }

    // Button disable karo taaki double submit na ho
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const SHEET_URL = "https://script.google.com/macros/s/AKfycbzAK2eVxrUAN1FX_X5FCec4OcBcriRphxtXm2UtXK7vCLkw3a4EzCNqPj05StDSTD0LzQ/exec";

    fetch(SHEET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sheetName: "press contacts",
            fullName : nameInput.value.trim(),
            email    : emailInput.value.trim(),
            phone    : phoneInput.value.trim()
        }),
        mode: "no-cors"
    })
    .then(() => {
        showToast("✓  Message sent! We'll be in touch soon.", "success");
        this.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";
    })
    .catch(() => {
        showToast("✕  Something went wrong. Please try again.", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";
    });
});

function showToast(message, type) {
    const existing = document.getElementById("atomo-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "atomo-toast";
    toast.textContent = message;

    Object.assign(toast.style, {
        position: "fixed",
        bottom: "32px",
        left: "50%",
        transform: "translateX(-50%) translateY(40px)",
        background: type === "success" ? "#0a0a0a" : "#c0392b",
        color: "#fff",
        padding: "14px 28px",
        borderRadius: "12px",
        fontSize: "15px",
        fontFamily: "Inter, sans-serif",
        fontWeight: "500",
        letterSpacing: "0.01em",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        zIndex: "99999",
        opacity: "0",
        transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        whiteSpace: "nowrap",
        borderLeft: type === "success" ? "4px solid #22c55e" : "4px solid #ff4444"
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateX(-50%) translateY(0)";
        });
    });

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(20px)";
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}