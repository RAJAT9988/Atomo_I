document.addEventListener('DOMContentLoaded', function () {
    // Hamburger Menu Functionality
    function initializeHamburgerMenu() {
        const hamburger = document.getElementById('hamburger');
        const navList = document.querySelector('#navbar ul');

        if (!hamburger || !navList) {
            console.warn('Hamburger or navList not found!');
            return;
        }

        hamburger.addEventListener('click', function () {
            navList.classList.toggle('active');
            this.classList.toggle('open');

            const navItems = document.querySelectorAll('#navbar ul li');
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
                const navItems = document.querySelectorAll('#navbar ul li');
                navItems.forEach(item => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(-10px)';
                });
            });
        });
    }

    // Initialize hamburger menu
    initializeHamburgerMenu();

    // Image Slider Functionality
    function initializeImageSlider() {
        const slider = document.querySelector('.slider');
        const images = document.querySelectorAll('.slider img');
        let currentIndex = 0;

        if (!slider || images.length === 0) {
            console.warn('Slider or images not found!');
            return;
        }

        function slideNext() {
            currentIndex = (currentIndex + 1) % images.length;
            slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        // Auto-slide every 3 seconds
        setInterval(slideNext, 3000);
    }

    // Initialize image slider
    initializeImageSlider();
});

document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.slider');
    const images = document.querySelectorAll('.slider img');
    const totalImages = images.length;
    let currentIndex = 0;
    let slideInterval;
    
    // Preload images and set loaded class
    function preloadImages() {
        images.forEach(img => {
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', function() {
                    this.classList.add('loaded');
                });
                img.addEventListener('error', function() {
                    console.error('Failed to load image:', this.src);
                    // If image fails to load, skip to next
                    clearInterval(slideInterval);
                    nextSlide();
                    startAutoSlide();
                });
            }
        });
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalImages;
        updateSlider();
    }
    
    function updateSlider() {
        const translateX = -currentIndex * 100;
        slider.style.transform = `translateX(${translateX}%)`;
    }
    
    function startAutoSlide() {
        // Clear existing interval if any
        clearInterval(slideInterval);
        // Start new interval - 3000ms = 3 seconds
        slideInterval = setInterval(nextSlide, 3000);
    }
    
    function stopAutoSlide() {
        clearInterval(slideInterval);
    }
    
    // Pause auto-slide when user hovers over slider (optional)
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);
    
    // Pause auto-slide when page is not visible (optional)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopAutoSlide();
        } else {
            startAutoSlide();
        }
    });
    
    // Initialize
    preloadImages();
    updateSlider();
    startAutoSlide();
});

// Simple popup for "Start a free plan"
document.addEventListener('DOMContentLoaded', function() {
    const ctaButton = document.querySelector('.cta-button');
    const popup = document.getElementById('subscription-popup'); // or your existing popup ID
    
    if (ctaButton && popup) {
        ctaButton.addEventListener('click', function() {
            popup.classList.add('active');
        });
        
        // Close popup when clicking outside or on close button
        popup.addEventListener('click', function(e) {
            if (e.target === popup || e.target.classList.contains('close-popup')) {
                popup.classList.remove('active');
            }
        });
        
        // Close with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                popup.classList.remove('active');
            }
        });
    }
});