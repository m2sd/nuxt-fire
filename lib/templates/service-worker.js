importScripts(<%=
  [
    options.workboxURL,
    ...options.importScripts,
    'https://unpkg.com/workbox-plugin-firebase-auth@1.1.0/lib/plugin.umd.js'
  ].map((i) => `'${i}'`).join(', ')
%>)

// --------------------------------------------------
// Configure
// --------------------------------------------------

<% if (options.config) {%>
// Set workbox config
workbox.setConfig(<%= JSON.stringify(options.config, null, 2) %>)
<% } %>

<% if (options.cacheNames) {%>
// Set workbox cache names
workbox.core.setCacheNameDetails(<%= JSON.stringify(options.cacheNames, null, 2) %>)
<% } %>

<% if (options.clientsClaim) { %>
// Start controlling any existing clients as soon as it activates
workbox.core.clientsClaim()
<% } %>

<% if (options.skipWaiting) { %>
// Skip over the SW waiting lifecycle stage
workbox.core.skipWaiting()
<% } %>

<% if (options.cleanupOutdatedCaches) { %>
workbox.precaching.cleanupOutdatedCaches()
<% } %>

<% if (options.offlineAnalytics) { %>
// Enable offline Google Analytics tracking
workbox.googleAnalytics.initialize()
<% } %>

<% if (options.workboxExtensions) { %>
// -- Start of workboxExtensions --
<%= options.workboxExtensions %>// -- End of workboxExtensions --
<% } %>

// --------------------------------------------------
// Precaches
// --------------------------------------------------

// Precache assets
<% if (options.preCaching.length) { %>
workbox.precaching.precacheAndRoute(<%= JSON.stringify(options.preCaching, null, 2) %>, <%= JSON.stringify(options.cacheOptions, null, 2) %>)
<% } %>

<% if (options.cachingExtensions) { %>
// -- Start of cachingExtensions --
<%= options.cachingExtensions %>// -- End of cachingExtensions --
<% } %>

// --------------------------------------------------
// Runtime Caching
// --------------------------------------------------

// Register route handlers for runtimeCaching
<% options.runtimeCaching.forEach(r => {
  const { plugins } = r.strategyOptions || {}
%>
  workbox.routing.registerRoute(
    new RegExp('<%= r.urlPattern %>'),
    new workbox.strategies.<%= r.handler %> ({
      ...<%= JSON.stringify(r.strategyOptions || {}) %>,
      plugins: [
        ...(firebasePlugin ? [firebasePlugin()] : []),
        ...<%= JSON.stringify(plugins || []) %>
      ]
    }),
  '<%= r.method %>'
)
<% }) %>

<% if (options.offlinePage) { %>
// Register router handler for offlinePage
workbox.routing.registerRoute(new RegExp('<%= options.pagesURLPattern %>'), ({request,event}) => {
  return new workbox.strategies.<%= options.offlineStrategy %>().handle({request,event})
    .catch(() => caches.match('<%= options.offlinePage %>'))
})<% } %>

<% if (options.routingExtensions) { %>
// -- Start of routingExtensions --
<%= options.routingExtensions %>// -- End of routingExtensions --
<% } %>
