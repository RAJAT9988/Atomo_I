document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navList = document.querySelector("#navbar ul");
  if (hamburger && navList) {
    hamburger.addEventListener("click", function () {
      navList.classList.toggle("active");
      this.classList.toggle("open");
      document.querySelectorAll("#navbar ul li").forEach((item, index) => {
        if (navList.classList.contains("active")) {
          setTimeout(() => {
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
          }, index * 100);
        } else {
          item.style.opacity = "0";
          item.style.transform = "translateY(-10px)";
        }
      });
    });
    document.querySelectorAll("#navbar a").forEach((link) => {
      link.addEventListener("click", function () {
        navList.classList.remove("active");
        hamburger.classList.remove("open");
        document.querySelectorAll("#navbar ul li").forEach((item) => {
          item.style.opacity = "0";
          item.style.transform = "translateY(-10px)";
        });
      });
    });
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  let blogs = [];
  let imageSource = "server";

  async function fetchWithTimeout(url, ms) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      return response;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  try {
    const response = await fetchWithTimeout(
      `https://atomo.in:3001/api/blogs?_=${Date.now()}`,
      3000
    );
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    blogs = await response.json();
  } catch (serverErr) {
    imageSource = "fallback";
    try {
      const response = await fetchWithTimeout("/data/blogs.json", 2000);
      if (!response.ok) throw new Error(`Fallback fetch failed: ${response.status}`);
      blogs = await response.json();
    } catch (fallbackErr) {
      console.error("Both server and fallback failed:", fallbackErr.message);
      blogs = [];
    }
  }

  blogs.sort((a, b) => new Date(b.date) - new Date(a.date));

  const heroCards = document.querySelector("#first-page .cards");
  if (blogs.length > 0 && heroCards) {
    populateHeroCard(blogs[0]);
    blogs.splice(0, 1);
  }

  const cardsContainer = document.querySelector("#second-page .cards");
  const showMoreBtn = document.querySelector(".show-more-btn");
  const searchInput = document.querySelector(".search-input");
  const searchButton = document.querySelector(".search-button");

  let visibleCount = 6;
  let activeCategory = "All Insight";
  let searchQuery = "";
  let filteredBlogs = blogs;

  function stripHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  function getImageUrl(filename) {
    return imageSource === "server"
      ? `https://atomo.in:3001/uploads/${filename}`
      : `/assets/${filename}`;
  }

  function populateHeroCard(blog) {
    const excerpt = stripHtml(blog.content || "").substring(0, 150) + "...";
    const highlightTitle = heroCards.querySelector(".card.highlight .highlight-content h2");
    if (highlightTitle) highlightTitle.textContent = blog.title;

    const highlightText = heroCards.querySelector(".card.highlight .highlight-content p");
    if (highlightText) highlightText.textContent = blog.subtitle || "";

    const meta = heroCards.querySelector(".card.info p");
    if (meta) meta.textContent = `${blog.category} · ${blog.date || new Date().toLocaleDateString()}`;

    const infoTitle = heroCards.querySelector(".card.info h2");
    if (infoTitle) infoTitle.textContent = blog.title;

    const infoText = heroCards.querySelectorAll(".card.info p")[1];
    if (infoText) infoText.textContent = excerpt;

    const readLink = heroCards.querySelector(".card.info a");
    if (readLink) readLink.href = `./blog-detail.html?slug=${blog.slug || blog.id}`;
  }

  function filterBlogs() {
    let result = blogs;
    if (activeCategory !== "All Insight") {
      result = result.filter((b) => b.category === activeCategory);
    }
    if (searchQuery) {
      result = result.filter(
        (b) =>
          (b.title?.toLowerCase().includes(searchQuery) ?? false) ||
          (b.subtitle?.toLowerCase().includes(searchQuery) ?? false) ||
          (b.content?.toLowerCase().includes(searchQuery) ?? false) ||
          (b.category?.toLowerCase().includes(searchQuery) ?? false) ||
          (b.author?.toLowerCase().includes(searchQuery) ?? false)
      );
    }
    return result;
  }

  function renderCards(list) {
    if (!cardsContainer) return;
    cardsContainer.innerHTML = list
      .slice(0, visibleCount)
      .map((blog) => {
        const imageUrl = getImageUrl(blog.image || "default-author.jpg");
        const excerpt = stripHtml(blog.content || "").substring(0, 100) + "...";
        const author = blog.author || "Anonymous";
        return `
          <div class="card">
              <div class="card-header" style="background-color: #19529a;">
                  <h2>${blog.title}</h2>
              </div>
              <div class="card-body">
                  <p class="category">${blog.category}</p>
                  <h3>${blog.subtitle || ""}</h3>
                  <p>${excerpt}</p>
                  <div class="author">
                      <img src="${imageUrl}"
                           alt="${author}"
                           width="40" height="40"
                           loading="lazy" decoding="async"
                           onerror="this.src='/assets/default-author.jpg'">
                      <span>${author}<br>${blog.position || "Writer"}</span>
                  </div>
                  <p class="date">${blog.date || new Date().toLocaleDateString()}</p>
                  <a href="./blog-detail.html?slug=${blog.slug || blog.id}" class="read-more">Read more →</a>
              </div>
          </div>
        `;
      })
      .join("");

    if (showMoreBtn) {
      showMoreBtn.style.display = visibleCount >= list.length ? "none" : "block";
    }
  }

  function runSearch() {
    searchQuery = searchInput.value.trim().toLowerCase();
    filteredBlogs = filterBlogs();
    visibleCount = 6;
    renderCards(filteredBlogs);
  }

  filteredBlogs = filterBlogs();
  renderCards(filteredBlogs);

  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", () => {
      visibleCount += 3;
      renderCards(filteredBlogs);
    });
  }

  document.querySelectorAll(".category-buttons button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".category-buttons button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.textContent;
      filteredBlogs = filterBlogs();
      visibleCount = 6;
      renderCards(filteredBlogs);
    });
  });

  if (searchButton) searchButton.addEventListener("click", runSearch);
  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") runSearch();
    });
  }
});
