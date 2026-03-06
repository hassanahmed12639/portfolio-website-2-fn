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

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, days) {
    document.cookie = name + '=' + encodeURIComponent(value) + '; path=/; max-age=' + (days * 86400) + '; SameSite=Lax';
  }

  // Get or create fbp
  var fbp = getCookie('_fbp');
  if (!fbp) {
    fbp = 'fb.1.' + Date.now() + '.' + Math.floor(Math.random() * 1000000000);
    setCookie('_fbp', fbp, 90);
  }

  // Get fbc from URL or cookie
  var urlParams = new URLSearchParams(window.location.search);
  var fbclid = urlParams.get('fbclid');
  var fbc = getCookie('_fbc');
  if (fbclid) {
    fbc = 'fb.1.' + Date.now() + '.' + fbclid;
    setCookie('_fbc', fbc, 90);
  }

  // Get ttclid from URL or cookie
  var ttclid = urlParams.get('ttclid');
  if (ttclid) {
    setCookie('ttclid', ttclid, 30);
  }
  var savedTtclid = ttclid || getCookie('ttclid');

  // Main track function
  window.trackhive = function(action, eventName, params) {
    if (action !== 'track') return;
    params = params || {};

    var eventId = params.event_id || 'th_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    var payload = {
      pixel_id: pixelId,
      event_name: eventName,
      event_source_url: window.location.href,
      page_url: window.location.href,
      event_id: eventId,
      fbp: fbp,
      fbc: fbc || undefined,
      fbclid: fbclid || undefined,
      ttclid: savedTtclid || undefined,
      client_user_agent: navigator.userAgent,
      value: params.value || 0,
      currency: params.currency || 'USD',
      external_id: params.external_id || params.order_id || undefined,
      order_id: params.order_id || undefined,
      content_ids: params.content_ids || undefined,
      content_type: params.content_type || undefined,
      contents: params.contents || undefined,
      num_items: params.num_items || undefined,
      user_data: {
        em: params.email ? [params.email] : [],
        ph: params.phone ? [params.phone] : [],
        fn: params.first_name ? [params.first_name] : [],
        ln: params.last_name ? [params.last_name] : [],
        ct: params.city ? [params.city] : [],
        st: params.state ? [params.state] : [],
        zp: params.zip ? [params.zip] : [],
        country: params.country ? [params.country] : [],
        db: params.date_of_birth ? [params.date_of_birth] : [],
        ge: params.gender ? [params.gender] : [],
        external_id: params.external_id || params.order_id ? [params.external_id || params.order_id] : []
      }
    };

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).then(function(res) {
      console.log('[TrackHive] Event sent:', eventName, res.status);
    }).catch(function(err) {
      console.error('[TrackHive] Error:', err);
    });
  };

  // Auto PageView
  window.trackhive('track', 'PageView', {});
  console.log('[TrackHive] Ready. Pixel:', pixelId);
})();
`

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
