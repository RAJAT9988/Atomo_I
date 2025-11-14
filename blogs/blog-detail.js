document.addEventListener('DOMContentLoaded', async () => {
    // Hamburger Menu Functionality
    function initializeHamburgerMenu() {
        const hamburger = document.getElementById('hamburger');
        const navList = document.querySelector('#navbar ul');

        if (!hamburger || !navList) {
            return;
        }

        hamburger.addEventListener('click', function () {
            navList.classList.toggle('active');
            this.classList.toggle('open');

            const navItems = navList.querySelectorAll('li');
            navItems.forEach((item, index) => {
                if (navList.classList.contains('active')) {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(-10px)';
                }
            });
        });

        const navLinks = document.querySelectorAll('#navbar a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                navList.classList.remove('active');
                hamburger.classList.remove('open');
                const navItems = navList.querySelectorAll('li');
                navItems.forEach(item => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(-10px)';
                });
            });
        });
    }

    initializeHamburgerMenu();

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const blogSlug = urlParams.get('slug') || urlParams.get('id');
        if (!blogSlug) throw new Error('No blog slug or ID provided in URL');

        let allBlogs = [];
        let dataSource = 'server';
        const serverBaseUrl = 'https://atomo.in:3001';

        try {
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
                throw new Error(`Both server and fallback failed: ${fallbackError.message}`);
            }
        }

        const blog = allBlogs.find(b => b.slug === blogSlug || b.id === blogSlug);
        if (!blog) throw new Error(`Blog not found with slug/ID: ${blogSlug}`);

        // Update image path logic
        function getImagePath(imageFile) {
            return `${dataSource === 'server' ? serverBaseUrl + '/uploads/' : './assets/'}${imageFile}`.toLowerCase();
        }

        const imageFile = blog.image || 'default-author.jpg';
        const imagePath = getImagePath(imageFile);
        
        // Set blog content
        document.getElementById('blog-title').textContent = blog.title;
        document.getElementById('blog-subtitle').textContent = blog.subtitle || '';
        document.getElementById('blog-author').textContent = blog.author || 'Anonymous';
        document.getElementById('blog-date').textContent = blog.date || new Date().toLocaleDateString();
        document.getElementById('blog-content').innerHTML = blog.content || '<p>No content available.</p>';
        
        // Set author image
        const authorImg = document.getElementById('blog-author-img');
        if (authorImg) {
            authorImg.src = imagePath;
            authorImg.alt = blog.author || 'Author';
        }
        
        document.title = `${blog.title} | Blogs`;

    } catch (error) {
        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = `background: #ffebee; color: #c62828; padding: 20px; margin: 20px; border-radius: 8px;`;
        errorContainer.innerHTML = `
            <h3>⚠️ Blog Loading Error</h3>
            <p>${error.message}</p>
            <button onclick="window.history.back()" style="background: #c62828; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Go Back</button>
        `;
        document.querySelector('.container')?.prepend(errorContainer) || document.body.prepend(errorContainer);
    }
});
