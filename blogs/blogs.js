document.addEventListener('DOMContentLoaded', async () => {
  let allBlogs = [];
  let dataSource = 'server';
  
  // Use local publisher for testing, change to 'https://atomo.in' for production
  const serverBaseUrl = 'https://atomo.in:3001';

  try {
    // Fetch blogs from server
    const response = await fetch(`https://atomo.in:3001/api/blogs?_=${Date.now()}`);
    
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    
    allBlogs = await response.json();
  } catch (serverError) {
    dataSource = 'fallback';
    try {
      const fallbackResponse = await fetch('/data/blogs.json');
      if (!fallbackResponse.ok) throw new Error(`Fallback fetch failed: ${fallbackResponse.status}`);
      allBlogs = await fallbackResponse.json();
    } catch (fallbackError) {
      console.error('Both server and fallback failed:', fallbackError.message);
      allBlogs = [];
    }
  }

  // Update image path logic
  function getImagePath(imageFile) {
    if (dataSource === 'server') {
      return `https://atomo.in:3001/uploads/${imageFile}`;
   } else {
      return `/assets/${imageFile}`;
    }
  }

  // Sort blogs by date descending
  allBlogs.sort((a, b) => new Date(b.date) - new Date(a.date));

  // ===== 1. LATEST BLOG (First Page) =====
  const latestContainer = document.querySelector('#first-page .cards');
  const blogDetailPath = './blog-detail.html';

  function renderLatest(blog) {
    const previewText = stripHTML(blog.content || '').substring(0, 150) + '...';

    // Populate existing highlight card
    const highlightH2 = latestContainer.querySelector('.card.highlight .highlight-content h2');
    if (highlightH2) highlightH2.textContent = blog.title;

    const highlightP = latestContainer.querySelector('.card.highlight .highlight-content p');
    if (highlightP) highlightP.textContent = blog.subtitle || '';

    // Populate existing info card
    const infoP = latestContainer.querySelector('.card.info p');
    if (infoP) infoP.textContent = `${blog.category} · ${blog.date || new Date().toLocaleDateString()}`;

    const infoH2 = latestContainer.querySelector('.card.info h2');
    if (infoH2) infoH2.textContent = blog.title;

    const infoP2 = latestContainer.querySelectorAll('.card.info p')[1];
    if (infoP2) infoP2.textContent = previewText;

    const infoA = latestContainer.querySelector('.card.info a');
    if (infoA) infoA.href = `${blogDetailPath}?slug=${blog.slug || blog.id}`;
  }

  if (allBlogs.length > 0) {
    renderLatest(allBlogs[0]);
    allBlogs.splice(0, 1);
  }

  // ===== 2. FEATURE INSIGHTS (Main Grid) =====
  const insightsContainer = document.querySelector('#second-page .cards');
  const showMoreBtn = document.querySelector('.show-more-btn');
  const searchInput = document.querySelector('.search-input');
  const searchButton = document.querySelector('.search-button');
  let visibleCount = 6;
  let currentCategory = 'All Insight';
  let searchQuery = '';
  let currentDisplayedBlogs = allBlogs;

  function getFilteredBlogs() {
    let blogs = allBlogs;
    
    if (currentCategory !== 'All Insight') {
      blogs = blogs.filter(blog => blog.category === currentCategory);
    }
    
    if (searchQuery) {
      blogs = blogs.filter(blog => 
        (blog.title?.toLowerCase().includes(searchQuery) ?? false) ||
        (blog.subtitle?.toLowerCase().includes(searchQuery) ?? false) ||
        (blog.content?.toLowerCase().includes(searchQuery) ?? false) ||
        (blog.category?.toLowerCase().includes(searchQuery) ?? false) ||
        (blog.author?.toLowerCase().includes(searchQuery) ?? false)
      );
    }
    
    return blogs;
  }

  function stripHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  function renderInsights(blogs) {
    const blogDetailPath = './blog-detail.html';
    insightsContainer.innerHTML = blogs.slice(0, visibleCount).map(blog => {
      const imageFile = blog.image || 'default-author.jpg';
      const imagePath = getImagePath(imageFile);
      const previewText = stripHTML(blog.content || '').substring(0, 100) + '...';
      
      return `
          <div class="card">
              <div class="card-header" style="background-color: #19529a;">
                  <h2>${blog.title}</h2>
              </div>
              <div class="card-body">
                  <p class="category">${blog.category}</p>
                  <h3>${blog.subtitle || ''}</h3>
                  <p>${previewText}</p>
                  <div class="author">
                      <img src="${imagePath}" 
                           alt="${blog.author || 'Author'}"
                           onerror="this.src='/assets/default-author.jpg'">
                      <span>${blog.author || 'Anonymous'}<br>${blog.position || 'Writer'}</span>
                  </div>
                  <p class="date">${blog.date || new Date().toLocaleDateString()}</p>
                  <a href="${blogDetailPath}?slug=${blog.slug || blog.id}" class="read-more">Read more →</a>
              </div>
          </div>
      `;
    }).join('');
    showMoreBtn.style.display = visibleCount >= blogs.length ? 'none' : 'block';
  }

  // Initial render
  currentDisplayedBlogs = getFilteredBlogs();
  renderInsights(currentDisplayedBlogs);

  // Show More button
  showMoreBtn.addEventListener('click', () => {
    visibleCount += 3;
    renderInsights(currentDisplayedBlogs);
  });

  // Category Filters
  document.querySelectorAll('.category-buttons button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.category-buttons button').forEach(btn =>
        btn.classList.remove('active'));
      button.classList.add('active');

      currentCategory = button.textContent;
      currentDisplayedBlogs = getFilteredBlogs();
      visibleCount = 6;
      renderInsights(currentDisplayedBlogs);
    });
  });

  // Search Functionality
  function performSearch() {
    searchQuery = searchInput.value.trim().toLowerCase();
    currentDisplayedBlogs = getFilteredBlogs();
    visibleCount = 6;
    renderInsights(currentDisplayedBlogs);
  }

  searchButton.addEventListener('click', performSearch);

  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
});
