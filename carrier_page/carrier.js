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
                n = e.querySelector(".round-button:first-child"),
                r = e.querySelector(".round-button:last-child");
            if (!t || !n || !r) return void console.warn("Slider elements missing in #second-page");
            const o = ["1.png?v=1.1", "2.png?v=1.1", "3.png?v=1.1", "4.png?v=1.1"];
            let s = "";
            for (let e = 0; e < 14; e++)
                o.forEach((e) => {
                    s += `<div class="slide"><img src="/carrier_page/${e}" alt="Slide ${e}"></div>`;
                });
            t.innerHTML = s;
            const a = t.querySelectorAll(".slide"),
                i = a.length;
            function l() {
                const e = window.innerWidth;
                return e <= 480 ? 1 : e <= 768 ? 2 : e <= 1024 ? 3 : 4;
            }
            let c = l(),
                u = 0,
                d = !1,
                m = null;
            function v(e = !0) {
                if (d) return;
                (d = e), (t.style.transition = e ? "transform 0.5s ease-in-out" : "none");
                const n = (100 / c) * -u;
                (t.style.transform = `translateX(${n}%)`),
                    a.forEach((e, t) => {
                        e.classList.toggle("active", Math.abs(t - u) < c);
                    }),
                    u >= i - c
                        ? setTimeout(
                              () => {
                                  (u = 0),
                                      (t.style.transition = "none"),
                                      (t.style.transform = "translateX(0%)"),
                                      (d = !1),
                                      y();
                              },
                              e ? 500 : 0
                          )
                        : u < 0 && ((u = Math.max(0, i - c)), v(!1)),
                    e
                        ? setTimeout(() => {
                              d = !1;
                          }, 500)
                        : (d = !1);
            }
            function y() {
                h(),
                    (m = setInterval(() => {
                        u < i - c ? (u++, v(!0)) : ((u = 0), v(!0));
                    }, 3e3));
            }
            function h() {
                m && (clearInterval(m), (m = null));
            }
            r.addEventListener("click", () => {
                d || ((u = Math.min(u + 1, i - c)), v(!0), h(), y());
            }),
                n.addEventListener("click", () => {
                    d || ((u = Math.max(u - 1, 0)), v(!0), h(), y());
                });
            let f = 0,
                p = 0;
            t.addEventListener("touchstart", (e) => {
                (f = e.touches[0].clientX), h();
            }),
                t.addEventListener("touchmove", (e) => {
                    p = e.touches[0].clientX;
                }),
                t.addEventListener("touchend", () => {
                    const e = f - p;
                    Math.abs(e) > 50 && ((u = e > 0 ? Math.min(u + 1, i - c) : Math.max(u - 1, 0)), v(!0)), y();
                }),
                e.addEventListener("mouseenter", h),
                e.addEventListener("mouseleave", y),
                window.addEventListener("resize", () => {
                    const e = l();
                    e !== c && ((c = e), (u = Math.min(u, i - c)), v(!1));
                }),
                v(!1),
                y();
        })();
}),
    document.querySelector(".contact-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const nameInput  = this.querySelector('input[type="text"]');
    const emailInput = this.querySelector('input[type="email"]');
    const phoneInput = this.querySelector('input[type="tel"]');
    const robotCheck = this.querySelector("#recaptcha-checkbox");
    const submitBtn  = this.querySelector(".submit-button");

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

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const SHEET_URL = "https://script.google.com/macros/s/AKfycbzAK2eVxrUAN1FX_X5FCec4OcBcriRphxtXm2UtXK7vCLkw3a4EzCNqPj05StDSTD0LzQ/exec";

    fetch(SHEET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sheetName: "Carrier Contacts",
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