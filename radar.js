document.addEventListener('DOMContentLoaded', () => {
    const bubblesData = [
        { id: 1, label: "Coffee", src: "assets/videos/radar/1.mp4", top: "15%", left: "50%", size: 110 },
        { id: 2, label: "Run", src: "assets/videos/radar/2.mp4", top: "60%", left: "85%", size: 100 }, 
        { id: 3, label: "Dog Walk", src: "assets/videos/radar/3.mp4", top: "80%", left: "30%", size: 140 }, 
        { id: 4, label: "Date", src: "assets/videos/radar/4.mp4", top: "25%", left: "12%", size: 90 },
        { id: 5, label: "Shopping", src: "assets/videos/radar/5.mp4", top: "70%", left: "10%", size: 95 },
        { id: 6, label: "Gym", src: "assets/videos/radar/6.mp4", top: "20%", left: "80%", size: 105 },
        { id: 7, label: "Cinema", src: "assets/videos/radar/7.mp4", top: "45%", left: "92%", size: 80 },
        { id: 8, label: "Food", src: "assets/videos/radar/8.mp4", top: "52%", left: "48%", size: 120 },
    ];

    const radarInstances = document.querySelectorAll('.radar-instance');

    if (radarInstances.length === 0) return;

    radarInstances.forEach(instance => {
        const container = instance.querySelector('.bubbles-container');
        if (!container) return;

        // Generate Bubbles
        bubblesData.forEach((item, index) => {
            const anchor = document.createElement('div');
            anchor.className = 'bubble-anchor';
            anchor.style.top = item.top;
            anchor.style.left = item.left;
            anchor.style.width = item.size + 'px';
            anchor.style.height = item.size + 'px';
            
            // Start after radar rings (approx 1.2s) and stagger
            const delay = 1.2 + (index * 0.15); 
            
            anchor.innerHTML = `
                <div class="anim-entry" style="animation-delay: ${delay}s; opacity: 0; animation: emerge 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards ${delay}s;">
                    <div class="anim-float" style="animation-delay: ${delay}s;">
                        <div class="video-circle">
                            <video src="${item.src}" class="media-content" autoplay loop muted playsinline></video>
                            <div class="play-overlay">
                                <div class="play-icon"></div>
                            </div>
                        </div>
                        <span class="label-badge">
                            ${item.label}
                        </span>
                    </div>
                </div>
            `;
            container.appendChild(anchor);
        });
    });

    const radarPlanes = document.querySelectorAll('.radar-plane');
    const anchors = document.querySelectorAll('.bubble-anchor');

    // Smooth Tilt Logic
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const smoothing = 0.1; // Lower = smoother/slower, Higher = snappier

    document.addEventListener('mousemove', (e) => {
        const isHovering = e.target.closest('.bubble-anchor');
        if (isHovering) {
            targetX = 0;
            targetY = 0;
            return;
        }
        // Calculate target rotation based on mouse position
        // Invert X/Y for natural tilt feel
        targetY = (window.innerWidth / 2 - e.clientX) / 30; 
        targetX = (window.innerHeight / 2 - e.clientY) / 30;
    });

    function animateTilt() {
        // Lerp (Linear Interpolation) for smooth movement
        currentX += (targetX - currentX) * smoothing;
        currentY += (targetY - currentY) * smoothing;

        radarPlanes.forEach(plane => {
            plane.style.transform = `rotateX(${currentX}deg) rotateY(${-currentY}deg)`;
        });

        requestAnimationFrame(animateTilt);
    }

    // Start the animation loop
    animateTilt();

    // Spotlight Logic
    let spotlightTimeout;
    function randomSpotlight() {
        anchors.forEach(a => a.classList.remove('is-spotlight'));
        const isHovering = Array.from(anchors).some(a => a.matches(':hover'));
        if (!isHovering) {
            const randomIndex = Math.floor(Math.random() * anchors.length);
            anchors[randomIndex].classList.add('is-spotlight');
        }
        spotlightTimeout = setTimeout(randomSpotlight, 3500);
    }

    anchors.forEach(a => {
        a.addEventListener('mouseenter', () => {
            anchors.forEach(el => el.classList.remove('is-spotlight'));
            clearTimeout(spotlightTimeout);
        });
        a.addEventListener('mouseleave', () => {
            spotlightTimeout = setTimeout(randomSpotlight, 2000);
        });
    });
    setTimeout(randomSpotlight, 1500);
});
