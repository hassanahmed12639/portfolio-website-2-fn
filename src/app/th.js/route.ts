import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pixelId = searchParams.get('id')

  const script = `
(function() {
  if (window.trackhive) return;

  var pixelId = '${pixelId || ''}';
  var apiUrl = 'https://track.itshassanahmed.com/api/event';

  // Get or create fbp cookie
  function getFbp() {
    var match = document.cookie.match(/_fbp=([^;]+)/);
    if (match) return match[1];
    var fbp = 'fb.1.' + Date.now() + '.' + Math.floor(Math.random() * 1000000000);
    document.cookie = '_fbp=' + fbp + '; path=/; max-age=7776000';
    return fbp;
  }

  // Get fbc from cookie or fbclid in URL
  function getFbc() {
    var match = document.cookie.match(/_fbc=([^;]+)/);
    if (match) return match[1];
    var urlParams = new URLSearchParams(window.location.search);
    var fbclid = urlParams.get('fbclid');
    if (fbclid) {
      var fbc = 'fb.1.' + Date.now() + '.' + fbclid;
      document.cookie = '_fbc=' + fbc + '; path=/; max-age=7776000';
      return fbc;
    }
    return null;
  }

  // Main track function
  window.trackhive = function(action, eventName, params) {
    if (action !== 'track') return;

    params = params || {};

    var em = params.email;
    if (!em && params.user_data && params.user_data.em && params.user_data.em[0]) em = params.user_data.em[0];
    var ph = params.phone;
    if (!ph && params.user_data && params.user_data.ph && params.user_data.ph[0]) ph = params.user_data.ph[0];
    var fn = params.first_name;
    if (!fn && params.user_data && params.user_data.fn && params.user_data.fn[0]) fn = params.user_data.fn[0];
    var ln = params.last_name;
    if (!ln && params.user_data && params.user_data.ln && params.user_data.ln[0]) ln = params.user_data.ln[0];

    var payload = {
      pixel_id: pixelId,
      event_name: eventName,
      event_source_url: params.event_source_url || window.location.href,
      fbp: getFbp(),
      fbc: getFbc(),
      value: params.value || 0,
      currency: params.currency || 'USD',
      email: em || null,
      phone: ph || null,
      first_name: fn || null,
      last_name: ln || null,
      order_id: params.order_id || null
    };

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function(err) {
      console.error('[TrackHive] Error:', err);
    });
  };

  // Auto fire PageView
  if (pixelId) {
    window.trackhive('track', 'PageView', {
      event_source_url: window.location.href
    });
    console.log('[TrackHive] Initialized with pixel:', pixelId);
  }
})();
`

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
