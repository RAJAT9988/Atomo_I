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
