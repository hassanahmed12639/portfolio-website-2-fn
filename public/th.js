(function() {
  var key = window.TRACKHIVE_KEY || '';
  if (!key) { console.warn('TrackHive: No API key found. Set window.TRACKHIVE_KEY before loading th.js'); return; }
  window.TrackHive = {
    track: function(eventName, data) {
      var payload = {
        api_key: key,
        event_name: eventName,
        value: data.value || null,
        currency: data.currency || 'USD',
        email: data.email || null,
        phone: data.phone || null
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
  window.TrackHive.pageview();
  console.log('TrackHive loaded successfully');
})();
