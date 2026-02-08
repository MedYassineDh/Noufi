// Animations Module

class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        // Add button click animations
        this.addButtonAnimations();
        
        // Add particle effects
        this.addParticleEffects();
        
        // Add smooth transitions
        this.addTransitionEffects();
    }

    addButtonAnimations() {
        // All buttons get click animation
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, .btn-primary, .btn-play, .btn-action, .bet-btn');
            
            if (button && !button.disabled) {
                // Play button click sound
                if (window.audioManager) {
                    window.audioManager.playSound('buttonClick');
                }

                // Add ripple effect
                this.createRipple(e, button);
            }
        });
    }

    createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');

        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addParticleEffects() {
        // Create floating particles in lobby
        const createFloatingParticles = (container) => {
            if (!container) return;

            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.width = '2px';
                particle.style.height = '2px';
                particle.style.background = '#D4AF37';
                particle.style.borderRadius = '50%';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = '100%';
                particle.style.opacity = '0.5';
                particle.style.pointerEvents = 'none';
                
                const duration = 5 + Math.random() * 10;
                const delay = Math.random() * 5;
                
                particle.style.animation = `floatUp ${duration}s ${delay}s infinite`;
                
                container.appendChild(particle);
            }
        };

        // Add to lobby background
        const lobbyBg = document.querySelector('.lobby-background');
        if (lobbyBg) {
            createFloatingParticles(lobbyBg);
        }
    }

    addTransitionEffects() {
        // Smooth screen transitions
        const screens = document.querySelectorAll('.screen');
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const target = mutation.target;
                    
                    if (target.classList.contains('active')) {
                        this.animateScreenIn(target);
                    } else {
                        this.animateScreenOut(target);
                    }
                }
            });
        });

        screens.forEach(screen => {
            observer.observe(screen, { attributes: true });
        });
    }

    animateScreenIn(screen) {
        // Add entrance animation classes
        screen.style.animation = 'fadeIn 0.5s ease forwards';
    }

    animateScreenOut(screen) {
        // Add exit animation
        screen.style.animation = 'fadeOut 0.3s ease forwards';
    }

    // Card dealing animation
    dealCard(fromElement, toElement, delay = 0) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const card = document.createElement('div');
                card.className = 'card dealing';
                
                // Get positions
                const fromRect = fromElement.getBoundingClientRect();
                const toRect = toElement.getBoundingClientRect();

                // Set initial position
                card.style.position = 'fixed';
                card.style.left = fromRect.left + 'px';
                card.style.top = fromRect.top + 'px';
                card.style.width = '80px';
                card.style.height = '110px';
                card.style.transition = 'all 0.6s ease';
                card.style.zIndex = '1000';

                document.body.appendChild(card);

                // Animate to target
                setTimeout(() => {
                    card.style.left = toRect.left + 'px';
                    card.style.top = toRect.top + 'px';
                    card.style.transform = 'rotate(720deg)';
                }, 50);

                // Remove after animation
                setTimeout(() => {
                    card.remove();
                    resolve();
                }, 650);
            }, delay);
        });
    }

    // Chip stacking animation
    animateChips(amount, container) {
        const chipCount = Math.min(Math.floor(amount / 10), 10);
        
        for (let i = 0; i < chipCount; i++) {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.style.cssText = `
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, #D4AF37, #B8941E);
                border: 3px solid #F4E4A6;
                position: absolute;
                bottom: ${i * 5}px;
                left: 50%;
                transform: translateX(-50%);
                animation: chipDrop 0.3s ease ${i * 0.1}s forwards;
                opacity: 0;
            `;
            
            container.appendChild(chip);
        }
    }

    // Balance update animation
    animateBalanceChange(element, oldValue, newValue) {
        const duration = 1000;
        const steps = 30;
        const increment = (newValue - oldValue) / steps;
        let current = oldValue;
        let step = 0;

        const interval = setInterval(() => {
            current += increment;
            step++;

            element.textContent = `$${Math.round(current)}`;

            if (step >= steps) {
                clearInterval(interval);
                element.textContent = `$${newValue}`;
                
                // Flash effect
                element.style.animation = 'flash 0.5s ease';
                setTimeout(() => {
                    element.style.animation = '';
                }, 500);
            }
        }, duration / steps);
    }

    // Screen shake effect (for losses)
    shakeScreen() {
        document.body.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }

    // Success pulse effect
    pulseElement(element) {
        element.style.animation = 'pulse 1s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 1000);
    }
}

// Add necessary CSS animations dynamically
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(0) translateX(0);
            opacity: 0.5;
        }
        50% {
            opacity: 0.8;
        }
        100% {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
        }
    }

    @keyframes chipDrop {
        from {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }

    @keyframes flash {
        0%, 100% {
            transform: scale(1);
            color: inherit;
        }
        50% {
            transform: scale(1.2);
            color: #D4AF37;
            text-shadow: 0 0 20px rgba(212, 175, 55, 0.8);
        }
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }

    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(styleSheet);

// Initialize animation manager
const animationManager = new AnimationManager();
window.animationManager = animationManager;
