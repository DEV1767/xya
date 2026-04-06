/**
 * Authentication & Authorization Helper
 * Manages tokens, user sessions, and protected routes
 * Works with AROWANA Backend API
 */

const API_BASE = 'https://techforgeinnovators.onrender.com/v1/api';

/* ─────────────────────────────────────────
   TOKEN MANAGEMENT
───────────────────────────────────────────── */

function getAccessToken() {
    return localStorage.getItem('userId') ? 'authenticated' : null;
}

function getRefreshToken() {
    return null; // HTTP-only cookies — managed by browser
}

function saveTokens(accessToken, refreshToken) {
    // Tokens are in HTTP-only cookies — browser handles them automatically
}

function clearTokens() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
}

/* ─────────────────────────────────────────
   USER SESSION MANAGEMENT
───────────────────────────────────────────── */

function isLoggedIn() {
    return !!localStorage.getItem('userId');
}

function getUserId()   { return localStorage.getItem('userId'); }
function getUserName() { return localStorage.getItem('userName'); }
function getUserRole() { return localStorage.getItem('userRole'); }

function getCurrentUser() {
    return {
        id:         getUserId(),
        name:       getUserName(),
        role:       getUserRole(),
        isLoggedIn: isLoggedIn()
    };
}

function saveUserData(userData) {
    // ✅ KEY FIX: Backend sends "id" NOT "_id" in verify response
    // We support both to be safe
    const id = userData.id || userData._id;
    if (id)            localStorage.setItem('userId',   id);
    if (userData.name) localStorage.setItem('userName', userData.name);
    if (userData.role) localStorage.setItem('userRole', userData.role);

    console.log('👤 saveUserData() saved:', {
        userId:   id            || '❌ MISSING',
        userName: userData.name || '❌ MISSING',
        userRole: userData.role || '❌ MISSING',
    });
}

/* ─────────────────────────────────────────
   ROUTE PROTECTION
───────────────────────────────────────────── */

function requireAuth() {
    if (window.location.pathname.includes('login')) return true;

    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function requireRole(allowedRoles) {
    if (!requireAuth()) return false;

    const userRole = getUserRole();
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
        alert(`Access Denied — Requires role: ${roles.join(' or ')}`);
        window.location.href = 'map.html';
        return false;
    }
    return true;
}

/* ─────────────────────────────────────────
   API CALLS WITH AUTHENTICATION
───────────────────────────────────────────── */

async function apiCall(endpoint, method = 'GET', body = null, retryWithRefresh = true) {
    const headers = { 'Content-Type': 'application/json' };
    const options = { method, headers, credentials: 'include' };

    if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
    }

    try {
        const res  = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await res.json();

        if (res.status === 401 && retryWithRefresh) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                return apiCall(endpoint, method, body, false);
            } else {
                clearTokens();
                window.location.href = 'login.html';
                return { ok: false, status: 401, data: { message: 'Session expired. Please login again.' } };
            }
        }

        return { ok: res.ok, status: res.status, data };
    } catch (err) {
        console.error('API Error:', err);
        return { ok: false, status: 0, data: { message: 'Network error. Please check your connection.' } };
    }
}

/* ─────────────────────────────────────────
   AUTHENTICATION ENDPOINTS
───────────────────────────────────────────── */

async function registerUser(userData) {
    return apiCall('/auth/register', 'POST', userData, false);
}

async function loginUser(phonenumber) {
    return apiCall('/auth/login', 'POST', { phonenumber }, false);
}

async function verifyOTP(phonenumber, otp) {
    try {
        const res = await fetch(`${API_BASE}/auth/verify`, {
            method:      'POST',
            headers:     { 'Content-Type': 'application/json' },
            body:        JSON.stringify({ phonenumber, otp }),
            credentials: 'include'  // browser auto-stores the HTTP-only cookies
        });

        const data = await res.json();

        if (res.ok && data.user) {
            // ✅ Save role/name/id from response body so redirect works
            saveUserData(data.user);
        }

        return { ok: res.ok, data };
    } catch (err) {
        console.error('verifyOTP error:', err);
        return { ok: false, data: { message: 'Network error. Please check your connection.' } };
    }
}

async function refreshAccessToken() {
    try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
            method:      'POST',
            credentials: 'include'
        });
        return res.ok;
    } catch {
        return false;
    }
}

async function logoutUser() {
    try {
        await apiCall('/auth/logout', 'POST', {}, false);
    } catch (err) {
        console.error('Logout error:', err);
    } finally {
        clearTokens();
        window.location.href = 'login.html';
    }
}

/* ─────────────────────────────────────────
   USER ENDPOINTS
───────────────────────────────────────────── */

async function getUserProfile()            { return apiCall('/user/me', 'GET'); }
async function getUserById(userId)         { return apiCall(`/user/${userId}`, 'GET'); }
async function updateUserProfile(userData) { return apiCall('/user/update', 'PUT', userData); }
async function getUsersByRole(role)        { return apiCall(`/user/role/${role}`, 'GET'); }

/* ─────────────────────────────────────────
   LISTING ENDPOINTS
───────────────────────────────────────────── */

async function createListing(listingData)           { return apiCall('/list/create', 'POST', listingData); }
async function getListings()                         { return apiCall('/list/getlist', 'GET'); }
async function getListingsByMandi(mandiId)           { return apiCall(`/list/mandi/${mandiId}`, 'GET'); }
async function getListingsBySeller(sellerId)         { return apiCall(`/list/seller/${sellerId}`, 'GET'); }
async function updateListing(listingId, listingData) { return apiCall(`/list/update/${listingId}`, 'PUT', listingData); }
async function deleteListing(listingId)              { return apiCall(`/list/delete/${listingId}`, 'DELETE'); }

/* ─────────────────────────────────────────
   MANDI ENDPOINTS
───────────────────────────────────────────── */

async function createMandi(mandiData)                     { return apiCall('/mandi/', 'POST', mandiData); }
async function getAllMandis()                              { return apiCall('/mandi/getall', 'GET'); }
async function getMandiById(mandiId)                      { return apiCall(`/mandi/${mandiId}`, 'GET'); }
async function getNearbyMandis(lat, lng, distance = 5000) { return apiCall(`/mandi/nearby?lat=${lat}&lng=${lng}&distance=${distance}`, 'GET'); }
async function updateMandi(mandiId, mandiData)            { return apiCall(`/mandi/${mandiId}`, 'PUT', mandiData); }
async function deactivateMandi(mandiId)                   { return apiCall(`/mandi/${mandiId}`, 'DELETE'); }
async function rateMandi(mandiId, rating, review)         { return apiCall(`/mandi/${mandiId}/rate`, 'POST', { rating, review }); }

/* ─────────────────────────────────────────
   INITIALIZATION
───────────────────────────────────────────── */

function initializeAuth() {
    const user = getCurrentUser();
    if (user.isLoggedIn) {
        document.dispatchEvent(new CustomEvent('authInitialized', { detail: user }));
    }
}

function onAuthChange(callback) {
    document.addEventListener('authInitialized', (e) => callback(e.detail));
}

function formatPhone(phone) {
    return phone.replace(/(\d{2})(\d{5})(\d{5})/, '+$1 $2 $3');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}