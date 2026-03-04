import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const script = `(function () {
  if (window.TrackHiveLoaded) return;
  window.TrackHiveLoaded = true;

  var apiKey = window.TRACKHIVE_KEY || null;
  if (!apiKey) return;

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()\\[\\]\\\\/+^]/g, '\\\\$&') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, days) {
    var maxAge = days * 24 * 60 * 60;
    document.cookie = name + '=' + encodeURIComponent(value) + '; path=/; max-age=' + maxAge + '; SameSite=Lax';
  }

  function randomId() {
    return 'th_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  var params = new URLSearchParams(window.location.search);
  var fbclid = params.get('fbclid');

  var fbp = getCookie('_fbp');
  if (!fbp) {
    fbp = 'fb.1.' + Date.now() + '.' + Math.floor(Math.random() * 1e10);
    setCookie('_fbp', fbp, 90);
  }

  var fbc = getCookie('_fbc');
  if (fbclid) {
    fbc = 'fb.1.' + Date.now() + '.' + fbclid;
    setCookie('_fbc', fbc, 90);
  }

  function track(eventName, payload) {
    var body = Object.assign({
      api_key: apiKey,
      event_name: eventName,
      event_id: randomId(),
      event_source_url: window.location.href,
      fbp: fbp || undefined,
      fbc: fbc || undefined,
      fbclid: fbclid || undefined
    }, payload || {});

    return fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true
    }).catch(function () {});
  }

  window.TrackHive = window.TrackHive || {};
  window.TrackHive.track = track;
  track('PageView');
})();`

export async function GET() {
  const headers = new Headers()
  headers.set('Content-Type', 'application/javascript; charset=utf-8')
  headers.set('Cache-Control', 'public, max-age=300, s-maxage=300')
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')

  return new NextResponse(script, { status: 200, headers })
}

export async function OPTIONS() {
  const headers = new Headers()
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return new NextResponse(null, { status: 204, headers })
}
