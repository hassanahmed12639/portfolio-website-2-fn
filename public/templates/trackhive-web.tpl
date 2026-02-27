___INFO___
{
  "type": "TAG",
  "id": "cvt_trackhive_web",
  "version": 1,
  "securityGroups": [],
  "displayName": "TrackHive - Server Side Tracking",
  "categories": ["ANALYTICS", "ADVERTISING"],
  "brand": {
    "displayName": "TrackHive",
    "id": "brand_trackhive"
  },
  "description": "Send events to TrackHive for server-side tracking to Meta CAPI, Google Enhanced Conversions, TikTok, and Snapchat."
}

___TEMPLATE_PARAMETERS___
[
  {
    "type": "TEXT",
    "name": "apiKey",
    "displayName": "TrackHive API Key",
    "simpleValueType": true,
    "help": "Find your API key at track.itshassanahmed.com/dashboard/setup"
  },
  {
    "type": "TEXT",
    "name": "eventName",
    "displayName": "Event Name",
    "simpleValueType": true,
    "help": "e.g. Purchase, Lead, AddToCart, PageView"
  },
  {
    "type": "TEXT",
    "name": "eventValue",
    "displayName": "Event Value",
    "simpleValueType": true,
    "help": "Monetary value of the event (e.g. order total)"
  },
  {
    "type": "TEXT",
    "name": "eventCurrency",
    "displayName": "Currency",
    "simpleValueType": true,
    "defaultValue": "USD"
  },
  {
    "type": "TEXT",
    "name": "userEmail",
    "displayName": "Customer Email (optional)",
    "simpleValueType": true,
    "help": "Improves match rate. Will be hashed automatically."
  },
  {
    "type": "TEXT",
    "name": "eventId",
    "displayName": "Event ID (for deduplication)",
    "simpleValueType": true,
    "help": "Use Order ID for purchases. Prevents duplicate counting."
  }
]

___SANDBOXED_JS_FOR_WEB_TEMPLATE___
var injectScript = require('injectScript');
var setInWindow = require('setInWindow');
var copyFromWindow = require('copyFromWindow');
var callInWindow = require('callInWindow');

var apiKey = data.apiKey;
var eventName = data.eventName;
var eventValue = data.eventValue;
var currency = data.eventCurrency || 'USD';
var email = data.userEmail;
var eventId = data.eventId;

function sendEvent() {
  callInWindow('TrackHive.track', eventName, {
    value: eventValue ? parseFloat(eventValue) : null,
    currency: currency,
    email: email || null,
    event_id: eventId || null,
    event_source_url: copyFromWindow('location.href')
  });
  data.gtmOnSuccess();
}

if (copyFromWindow('TrackHive')) {
  sendEvent();
} else {
  setInWindow('TRACKHIVE_KEY', apiKey, true);
  injectScript(
    'https://track.itshassanahmed.com/th.js',
    sendEvent,
    data.gtmOnFailure
  );
}

___WEB_PERMISSIONS___
[
  {
    "instance": {
      "key": {
        "publicId": "inject_script",
        "versionId": "1"
      },
      "param": [
        {
          "key": "urls",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 1,
                "string": "https://track.itshassanahmed.com/"
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByTemplateCreator": true
    },
    "isRequired": true
  }
]
