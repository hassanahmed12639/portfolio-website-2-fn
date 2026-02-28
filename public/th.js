(function() {
  'use strict';

  var TrackHive = {};
  TrackHive.key = window.TRACKHIVE_KEY || null;
  TrackHive.visitorId = null;
  TrackHive.fbclid = null;
  TrackHive.fbc = null;
  TrackHive.fbp = null;

  if (!TrackHive.key) {
    console.warn('[TrackHive] No API key found. Set window.TRACKHIVE_KEY before loading th.js');
    return;
  }

  // ─── COOKIE HELPERS ───────────────────────────────
  TrackHive.getCookie = function(name) {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i].trim();
      if (c.startsWith(name + '=')) {
        return c.substring(name.length + 1);
      }
    }
    return null;
  };

  TrackHive.setCookie = function(name, value, days) {
    var expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Lax';
  };

  // ─── META SIGNAL CAPTURE ──────────────────────────

  // 1. Get fbclid from URL
  TrackHive.getFbclid = function() {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get('fbclid') || null;
    } catch(e) {
      return null;
    }
  };

  // 2. Get or create _fbc cookie
  // Format: fb.1.{timestamp}.{fbclid}
  TrackHive.getFbc = function() {
    var existing = TrackHive.getCookie('_fbc');
    if (existing) return existing;

    var fbclid = TrackHive.fbclid;
    if (fbclid) {
      var fbc = 'fb.1.' + Date.now() + '.' + fbclid;
      TrackHive.setCookie('_fbc', fbc, 90);
      return fbc;
    }
    return null;
  };

  // 3. Get or create _fbp cookie
  // Format: fb.1.{timestamp}.{random_number}
  TrackHive.getFbp = function() {
    var existing = TrackHive.getCookie('_fbp');
    if (existing) return existing;

    var random = Math.floor(Math.random() * 2147483647);
    var fbp = 'fb.1.' + Date.now() + '.' + random;
    TrackHive.setCookie('_fbp', fbp, 90);
    return fbp;
  };

  // 4. Capture all Meta signals on load
  TrackHive.captureMetaSignals = function() {
    TrackHive.fbclid = TrackHive.getFbclid();
    TrackHive.fbc = TrackHive.getFbc();
    TrackHive.fbp = TrackHive.getFbp();

    // Persist fbclid in sessionStorage so it survives page navigations
    if (TrackHive.fbclid) {
      try { sessionStorage.setItem('_th_fbclid', TrackHive.fbclid); } catch(e) {}
    } else {
      try {
        var stored = sessionStorage.getItem('_th_fbclid');
        if (stored) TrackHive.fbclid = stored;
      } catch(e) {}
    }
  };

  // ─── SERVER COOKIE EXTENSION ──────────────────────
  TrackHive.extend = function() {
    fetch('https://track.itshassanahmed.com/api/cookie/set?api_key=' + TrackHive.key, {
      method: 'GET',
      credentials: 'include'
    })
    .then(function(res) {
      if (res.ok) {
        var vid = res.headers.get('x-visitor-id');
        if (vid) TrackHive.visitorId = vid;
      }
    })
    .catch(function() {});
  };

  // ─── TRACK FUNCTION ───────────────────────────────
  TrackHive.track = function(eventName, data) {
    if (!TrackHive.key) return;
    data = data || {};

    // Auto-generate event_id for deduplication if not provided
    var eventId = data.event_id || (eventName + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));

    var payload = {
      api_key: TrackHive.key,
      event_name: eventName,
      event_id: eventId,
      event_source_url: window.location.href,
      value: data.value || null,
      currency: data.currency || 'USD',
      email: data.email || null,
      phone: data.phone || null,
      first_name: data.first_name || null,
      last_name: data.last_name || null,
      city: data.city || null,
      state: data.state || null,
      zip: data.zip || null,
      country: data.country || null,
      date_of_birth: data.date_of_birth || null,
      gender: data.gender || null,
      visitor_id: TrackHive.visitorId || null,
      fbc: TrackHive.fbc || null,
      fbp: TrackHive.fbp || null,
      fbclid: TrackHive.fbclid || null
    };

    fetch('https://track.itshassanahmed.com/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function() {});
  };

  // ─── PAGE VIEW ────────────────────────────────────
  TrackHive.pageview = function() {
    TrackHive.track('PageView', {});
  };

  // ─── INIT ─────────────────────────────────────────
  TrackHive.init = function() {
    TrackHive.captureMetaSignals();
    TrackHive.extend();
    TrackHive.pageview();
  };

  window.TrackHive = TrackHive;
  TrackHive.init();

})();
