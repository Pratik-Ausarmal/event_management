// Main JavaScript for Event Management Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Booking form multi-step functionality
    if (document.getElementById('bookingForm')) {
        const bookingForm = document.getElementById('bookingForm');
        const steps = document.querySelectorAll('.form-step');
        const nextBtns = document.querySelectorAll('.btn-next');
        const prevBtns = document.querySelectorAll('.btn-prev');
        const progress = document.getElementById('bookingProgress');
        let currentStep = 0;

        // Show current step
        function showStep(step) {
            steps.forEach((stepElement, index) => {
                stepElement.classList.toggle('active', index === step);
            });
            
            // Update progress bar
            const progressPercentage = ((step + 1) / steps.length) * 100;
            progress.style.width = `${progressPercentage}%`;
            
            // Update step indicators
            document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
                indicator.classList.toggle('active', index <= step);
            });
        }

        // Next button click
        nextBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Validate current step before proceeding
                const currentStepElement = steps[currentStep];
                const inputs = currentStepElement.querySelectorAll('input[required], select[required]');
                let isValid = true;

                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        input.classList.add('is-invalid');
                        isValid = false;
                    } else {
                        input.classList.remove('is-invalid');
                    }
                });

                if (isValid && currentStep < steps.length - 1) {
                    currentStep++;
                    showStep(currentStep);
                }
            });
        });

        // Previous button click
        prevBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (currentStep > 0) {
                    currentStep--;
                    showStep(currentStep);
                }
            });
        });

        // Service selection
        const serviceCheckboxes = document.querySelectorAll('.service-checkbox');
        const totalPriceElement = document.getElementById('totalPrice');
        let basePrice = parseFloat(totalPriceElement.dataset.basePrice) || 0;
        let selectedServicesPrice = 0;

        serviceCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const servicePrice = parseFloat(this.dataset.price) || 0;
                
                if (this.checked) {
                    selectedServicesPrice += servicePrice;
                } else {
                    selectedServicesPrice -= servicePrice;
                }
                
                const total = basePrice + selectedServicesPrice;
                totalPriceElement.textContent = `$${total.toFixed(2)}`;
            });
        });

        // Guest count and budget calculation
        const guestCountInput = document.getElementById('guestCount');
        const budgetRangeInput = document.getElementById('budgetRange');
        const budgetValueElement = document.getElementById('budgetValue');

        if (guestCountInput && budgetRangeInput && budgetValueElement) {
            guestCountInput.addEventListener('input', function() {
                const guestCount = parseInt(this.value) || 1;
                const perPersonCost = 50; // Base cost per person
                const estimatedCost = guestCount * perPersonCost;
                
                budgetRangeInput.value = estimatedCost;
                budgetValueElement.textContent = `$${estimatedCost}`;
            });

            budgetRangeInput.addEventListener('input', function() {
                budgetValueElement.textContent = `$${this.value}`;
            });
        }
    }

    // Event filtering
    if (document.getElementById('eventFilters')) {
        const filterForm = document.getElementById('eventFilters');
        const eventCards = document.querySelectorAll('.event-card');
        
        filterForm.addEventListener('change', function() {
            const selectedType = document.getElementById('filterType').value;
            const selectedDate = document.getElementById('filterDate').value;
            const minPrice = parseFloat(document.getElementById('filterMinPrice').value) || 0;
            const maxPrice = parseFloat(document.getElementById('filterMaxPrice').value) || Infinity;

            eventCards.forEach(card => {
                const cardType = card.dataset.type || '';
                const cardDate = card.dataset.date || '';
                const cardPrice = parseFloat(card.dataset.price) || 0;
                
                let visible = true;
                
                if (selectedType && selectedType !== 'all' && cardType !== selectedType) {
                    visible = false;
                }
                
                if (selectedDate && cardDate !== selectedDate) {
                    visible = false;
                }
                
                if (cardPrice < minPrice || cardPrice > maxPrice) {
                    visible = false;
                }
                
                card.style.display = visible ? 'block' : 'none';
            });
        });
    }

    // Image gallery modal
    const galleryImages = document.querySelectorAll('.gallery-img');
    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');

    galleryImages.forEach(img => {
        img.addEventListener('click', function() {
            modalImage.src = this.src;
            modalCaption.textContent = this.alt;
            imageModal.show();
        });
    });

    // Contact form validation
    if (document.getElementById('contactForm')) {
        const contactForm = document.getElementById('contactForm');
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            let isValid = true;
            
            if (!name) {
                showError('contactName', 'Please enter your name');
                isValid = false;
            }
            
            if (!email || !emailRegex.test(email)) {
                showError('contactEmail', 'Please enter a valid email');
                isValid = false;
            }
            
            if (!message) {
                showError('contactMessage', 'Please enter your message');
                isValid = false;
            }
            
            if (isValid) {
                // Simulate form submission
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    alert('Thank you for your message! We will get back to you soon.');
                    contactForm.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 1500);
            }
        });
        
        function showError(inputId, message) {
            const input = document.getElementById(inputId);
            const feedback = input.nextElementSibling;
            
            input.classList.add('is-invalid');
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.textContent = message;
            }
        }
        
        // Clear validation on input
        const contactInputs = contactForm.querySelectorAll('input, textarea');
        contactInputs.forEach(input => {
            input.addEventListener('input', function() {
                this.classList.remove('is-invalid');
            });
        });
    }

    // Countdown timer for upcoming events
    function updateCountdowns() {
        const countdownElements = document.querySelectorAll('.countdown');
        
        countdownElements.forEach(element => {
            const eventDate = new Date(element.dataset.date);
            const now = new Date();
            const timeDiff = eventDate - now;
            
            if (timeDiff > 0) {
                const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
                
                element.innerHTML = `
                    <span class="countdown-item">
                        <strong>${days}</strong> days
                    </span>
                    <span class="countdown-item">
                        <strong>${hours}</strong> hrs
                    </span>
                    <span class="countdown-item">
                        <strong>${minutes}</strong> min
                    </span>
                    <span class="countdown-item">
                        <strong>${seconds}</strong> sec
                    </span>
                `;
            } else {
                element.innerHTML = '<span class="text-danger">Event started</span>';
            }
        });
    }
    
    // Update countdown every second
    if (document.querySelector('.countdown')) {
        updateCountdowns();
        setInterval(updateCountdowns, 1000);
    }

    // Testimonial carousel auto-rotate
    if (document.getElementById('testimonialCarousel')) {
        const testimonialCarousel = new bootstrap.Carousel('#testimonialCarousel', {
            interval: 5000,
            wrap: true
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});