document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.scrolling-track');
    const scrollingContainer = document.querySelector('.scrolling-container');
    const envelopes = document.querySelectorAll('.envelope-item');

    // Check if the testimonials section exists on this page
    if (!track) return;

    // --- Interaction Handlers ---

    // Function to handle opening a single envelope
    function openEnvelope(targetEnvelope) {
        // 1. Close all currently active reviews
        document.querySelectorAll('.envelope-item.active').forEach(env => {
            env.classList.remove('active');
        });

        // 2. Open the selected one
        targetEnvelope.classList.add('active');

        // 3. Pause the continuous scroll animation
        track.classList.add('paused');
    }

    // Function to close all open envelopes and resume scroll
    function closeAllAndResume() {
        document.querySelectorAll('.envelope-item.active').forEach(env => {
            env.classList.remove('active');
        });
        // Resume the continuous scroll animation
        track.classList.remove('paused');
    }

    // --- Event Listeners ---

    envelopes.forEach(envelope => {
        // 1. Desktop Hover (Hover to pause and open)
        envelope.addEventListener('mouseenter', () => {
            if (window.innerWidth >= 768) {
                openEnvelope(envelope);
            }
        });

        // 2. Mobile Tap (Tap to open/close)
        envelope.addEventListener('click', (e) => {
            e.preventDefault(); // Stop default link behavior
            if (window.innerWidth < 768) {
                // If it's already active, close it (toggle logic)
                if (envelope.classList.contains('active')) {
                    closeAllAndResume();
                } else {
                    openEnvelope(envelope);
                }
                e.stopPropagation(); // Prevent the body click handler from closing immediately
            }
        });
    });

    // 3. Desktop Resume (Mouseleave on the scrolling container)
    scrollingContainer.addEventListener('mouseleave', () => {
        if (window.innerWidth >= 768) {
            closeAllAndResume();
        }
    });

    // 4. Mobile/Global Close (Click outside the fixed card)
    document.body.addEventListener('click', (e) => {
        const activeReview = document.querySelector('.envelope-item.active .envelope-content');
        if (activeReview && !activeReview.contains(e.target)) {
            closeAllAndResume();
        }
    });
    // 5. Keyboard Close (Escape key)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllAndResume();
        }
    });

});