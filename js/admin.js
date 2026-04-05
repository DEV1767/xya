/**
 * Admin API route registry and path helpers.
 * Keep all admin frontend endpoints in one place.
 */
(function () {
  const BASE_URL = 'https://techforgeinnovators.onrender.com';
  const API_PREFIX = '/v1/api';

  const routes = {
    analyticsDashboard: '/analytics/dashboard',
    notifications: '/notifications',
    notificationsMarkRead: '/notifications/mark-read',

    fishList: '/fish',
    fishCreate: '/fish',
    fishUpdate: (id) => `/fish/${id}`,
    fishDelete: (id) => `/fish/${id}`,
    fishToggleStock: (id) => `/fish/${id}/toggle-stock`,

    upcomingFishList: '/upcoming-fish',
    upcomingFishCreate: '/upcoming-fish',
    upcomingFishDelete: (id) => `/upcoming-fish/${id}`,
    upcomingFishMoveToAvailable: (id) => `/upcoming-fish/${id}/move-to-available`,

    ordersList: '/orders',
    ordersUpdateStatus: (id) => `/orders/${id}/status`,

    buyersList: '/buyers',
    buyersCreate: '/buyers',
    buyersToggleStatus: (id) => `/buyers/${id}/toggle-status`,

    paymentsList: '/payments',
    paymentsSummary: '/payments/summary',
    paymentsMarkPaid: (id) => `/payments/${id}/mark-paid`,

    analyticsRevenue: (period) => `/analytics/revenue?period=${encodeURIComponent(period)}`,
    analyticsTopFish: '/analytics/top-fish',
    analyticsTopBuyers: '/analytics/top-buyers',
    analyticsCategoryMix: '/analytics/category-mix',

    settingsGet: '/settings',
    settingsUpdate: '/settings',

    authLogout: '/auth/logout',
  };

  function resolve(routeOrBuilder, ...args) {
    return typeof routeOrBuilder === 'function' ? routeOrBuilder(...args) : routeOrBuilder;
  }

  // Expose a small global for non-module HTML usage.
  window.AdminAPI = {
    host: BASE_URL,
    prefix: API_PREFIX,
    baseUrl: `${BASE_URL}${API_PREFIX}`,
    routes,
    path(routeOrBuilder, ...args) {
      return resolve(routeOrBuilder, ...args);
    },
    url(routeOrBuilder, ...args) {
      return `${BASE_URL}${API_PREFIX}${resolve(routeOrBuilder, ...args)}`;
    },
  };
})();
