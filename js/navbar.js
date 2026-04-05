/**
 * Shared Navbar Component
 * Inject this into all pages for consistent navigation
 */

function createNavbar() {
    const user = typeof getCurrentUser === 'function'
        ? getCurrentUser()
        : { id: null, name: 'Guest', role: '', isLoggedIn: false };
    
    const navHTML = `
        <style>
            :root {
                --blue: #0A6EBD;
                --blue-light: #2E9EE0;
                --blue-dark: #084C83;
                --grey-900: #0F172A;
                --grey-600: #475569;
                --white: #FFFFFF;
                --border: #e2e8f0;
            }

            .app-navbar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid var(--border);
                box-shadow: 0 2px 8px rgba(10, 110, 189, 0.1);
            }

            .navbar-container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 0 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 70px;
            }

            .navbar-logo {
                display: flex;
                align-items: center;
                gap: 10px;
                text-decoration: none;
                color: var(--grey-900);
                font-weight: 700;
                font-size: 1.3rem;
                font-family: 'Playfair Display', serif;
            }

            .navbar-logo:hover {
                color: var(--blue);
            }

            .navbar-center {
                display: flex;
                align-items: center;
                gap: 30px;
            }

            .navbar-link {
                color: var(--grey-600);
                text-decoration: none;
                font-weight: 500;
                font-size: 0.9rem;
                transition: color 0.3s;
                border: none;
                background: transparent;
                cursor: pointer;
                padding: 8px 0;
            }

            .navbar-link:hover {
                color: var(--blue);
            }

            .navbar-link.active {
                color: var(--blue);
                border-bottom: 2px solid var(--blue);
            }

            .navbar-right {
                display: flex;
                align-items: center;
                gap: 20px;
            }

            .user-badge {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 14px;
                background: rgba(10, 110, 189, 0.08);
                border-radius: 20px;
                font-size: 0.85rem;
                color: var(--blue);
                font-weight: 600;
            }

            .logout-btn {
                padding: 8px 18px;
                background: linear-gradient(135deg, var(--blue) 0%, var(--blue-light) 100%);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.85rem;
                transition: all 0.3s;
            }

            .logout-btn:hover {
                background: linear-gradient(135deg, var(--blue-dark) 0%, var(--blue) 100%);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(10, 110, 189, 0.3);
            }

            .login-btn {
                padding: 8px 18px;
                background: transparent;
                color: var(--blue);
                border: 1.5px solid var(--blue);
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.85rem;
                transition: all 0.3s;
            }

            .login-btn:hover {
                background: rgba(10, 110, 189, 0.08);
            }

            .navbar-toggle {
                display: none;
                flex-direction: column;
                gap: 4px;
                background: none;
                border: none;
                cursor: pointer;
            }

            .navbar-toggle span {
                display: block;
                width: 24px;
                height: 2px;
                background: var(--grey-600);
                border-radius: 2px;
            }

            @media (max-width: 768px) {
                .navbar-center {
                    display: none;
                }

                .navbar-toggle {
                    display: flex;
                }

                .navbar-right {
                    gap: 10px;
                }

                .user-badge {
                    font-size: 0.75rem;
                    padding: 6px 10px;
                }

                .logout-btn,
                .login-btn {
                    padding: 6px 12px;
                    font-size: 0.75rem;
                }
            }
        </style>

        <nav class="app-navbar">
            <div class="navbar-container">
                <!-- Logo -->
                <a href="index.html" class="navbar-logo">
                    🐟 AroWana
                </a>

                <!-- Center Links -->
                <div class="navbar-center">
                    <a href="index.html" class="navbar-link" id="nav-home">Home</a>
                    <a href="map.html" class="navbar-link" id="nav-explore">Explore</a>
                    <a href="#" class="navbar-link" id="nav-about">About</a>
                </div>

                <!-- Right Section -->
                <div class="navbar-right">
                    ${user.isLoggedIn ? `
                        <div class="user-badge">
                            <span>👤</span>
                            <span>${user.name}</span>
                            <span style="font-size: 0.75rem; opacity: 0.7;">(${user.role})</span>
                        </div>
                        <button class="logout-btn" onclick="logoutUser()">Logout</button>
                    ` : `
                        <a href="login.html" class="login-btn">Login</a>
                    `}
                </div>

                <!-- Mobile Menu Toggle -->
                <button class="navbar-toggle" id="navbar-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>

        <!-- Add spacing to prevent content overlap -->
        <div style="height: 70px;"></div>
    `;

    return navHTML;
}

/**
 * Inject navbar into page
 * Call this function at the start of body or in DOMContentLoaded
 */
function injectNavbar() {
    const navbar = document.createElement('div');
    navbar.innerHTML = createNavbar();
    const nav = navbar.firstElementChild;
    const spacer = nav ? nav.nextElementSibling : null;
    
    // Insert at the beginning of body
    if (document.body && nav) {
        document.body.insertBefore(nav, document.body.firstChild);
        if (spacer) document.body.insertBefore(spacer, nav.nextSibling);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            const delayedNavbar = document.createElement('div');
            delayedNavbar.innerHTML = createNavbar();
            const delayedNav = delayedNavbar.firstElementChild;
            const delayedSpacer = delayedNav ? delayedNav.nextElementSibling : null;
            if (delayedNav) document.body.insertBefore(delayedNav, document.body.firstChild);
            if (delayedSpacer && delayedNav) document.body.insertBefore(delayedSpacer, delayedNav.nextSibling);
        });
    }

    // Set active link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = {
        'index.html': 'nav-home',
        'map.html': 'nav-explore',
        'hotel.html': 'nav-menu',
        'admin.html': 'nav-admin'
    };

    const activeLink = navLinks[currentPage];
    if (activeLink) {
        const el = document.getElementById(activeLink);
        if (el) el.classList.add('active');
    }
}

/**
 * Initialize navbar when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavbar);
} else {
    injectNavbar();
}
