(function() {
  var key = window.TRACKHIVE_KEY || '';
  if (!key) { console.warn('TrackHive: No API key found. Set window.TRACKHIVE_KEY before loading th.js'); return; }
  window.TrackHive = {
    visitorId: null,
    extend: function() {
      var img = new Image();
      function readVisitorId() {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].trim();
          if (cookie.indexOf('_th_uid=') === 0) {
            TrackHive.visitorId = cookie.split('=')[1];
            break;
          }
        }
      }
      readVisitorId();
      img.onload = readVisitorId;
      img.src = 'https://track.itshassanahmed.com/api/cookie/set?api_key=' + encodeURIComponent(key);
    },
    track: function(eventName, data) {
      data = data || {};
      var payload = {
        api_key: key,
        event_name: eventName,
        event_id: Math.random().toString(36).substr(2, 9),
        value: data.value || null,
        currency: data.currency || 'USD',
        email: data.email || null,
        phone: data.phone || null,
        visitor_id: this.visitorId || null
      };
      fetch('https://track.itshassanahmed.com/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(function(e) { console.error('TrackHive error:', e); });
    },
    pageview: function() {
      this.track('PageView', {});
    }
  };
  TrackHive.extend();
  window.TrackHive.pageview();
  console.log('TrackHive loaded successfully');
})();
