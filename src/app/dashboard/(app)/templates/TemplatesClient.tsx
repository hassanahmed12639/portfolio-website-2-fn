'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  TEMPLATES,
  CATEGORIES,
  PLATFORMS,
  TYPES,
  canAccessTemplate,
  type Template,
} from '@/lib/templates'
import { UpgradeModal } from '@/components/UpgradeModal'
import {
  Search,
  Download,
  Eye,
  Lock,
  X,
  Copy,
  FileDown,
  Package,
  ExternalLink,
  Upload,
  PencilLine,
} from 'lucide-react'

type PlanLabel = 'free' | 'trial' | 'pro' | 'agency'

const PLATFORM_LABELS: Record<string, string> = {
  meta: 'Meta',
  google: 'Google',
  tiktok: 'TikTok',
  snapchat: 'Snapchat',
  ga4: 'GA4',
  linkedin: 'LinkedIn',
}

const TYPE_LABELS: Record<string, string> = {
  'gtm-web': 'GTM Web',
  'gtm-tpl': 'GTM .tpl',
  sgtm: 'sGTM',
  shopify: 'Shopify',
  wordpress: 'WordPress',
  webflow: 'Webflow',
  html: 'HTML',
}

type GtmExport = {
  exportFormatVersion: number
  exportTime: string
  containerVersion: Record<string, unknown>
}

const ECOM_BUNDLE_CONTENTS = {
  tags: [
    'TrackHive Base Pixel',
    'GA4 Configuration',
    'GA4 - Purchase',
    'GA4 - Add to Cart',
    'GA4 - View Item',
    'GA4 - Begin Checkout',
    'TrackHive - Purchase Event',
  ],
  triggers: [
    'All Pages',
    'Purchase Page',
    'Custom - add_to_cart',
    'Custom - view_item',
    'Custom - begin_checkout',
  ],
  variables: [
    'GA4 Measurement ID',
    'TrackHive Pixel ID',
    'DLV - value',
    'DLV - currency',
    'DLV - transaction_id',
    'DLV - email',
    'DLV - phone',
    'DLV - item_id',
    'DLV - event_name',
  ],
} as const

const LEADGEN_BUNDLE_CONTENTS = {
  tags: [
    'TrackHive Base Pixel',
    'GA4 Configuration',
    'GA4 - Lead',
    'TrackHive - Lead Event',
  ],
  triggers: ['All Pages', 'Custom - generate_lead'],
  variables: [
    'GA4 Measurement ID',
    'TrackHive Pixel ID',
    'DLV - email',
    'DLV - phone',
    'DLV - event_name',
  ],
} as const

function createEcomGtmExport(pixelId: string): GtmExport {
  return {
    exportFormatVersion: 2,
    exportTime: new Date().toISOString(),
    containerVersion: {
      container: {
        accountId: '0',
        containerId: '0',
        name: 'TrackHive GTM - E-commerce',
        usageContext: ['web'],
      },
      variable: [
        { variableId: '1', name: 'GA4 Measurement ID', type: 'c', parameter: [{ type: 'TEMPLATE', key: 'value', value: '' }] },
        { variableId: '2', name: 'TrackHive Pixel ID', type: 'c', parameter: [{ type: 'TEMPLATE', key: 'value', value: pixelId }] },
        { variableId: '3', name: 'DLV - value', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'value' }] },
        { variableId: '4', name: 'DLV - currency', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'currency' }] },
        { variableId: '5', name: 'DLV - transaction_id', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'transaction_id' }] },
        { variableId: '6', name: 'DLV - email', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'email' }] },
        { variableId: '7', name: 'DLV - phone', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'phone' }] },
        { variableId: '8', name: 'DLV - item_id', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'item_id' }] },
        { variableId: '9', name: 'DLV - items', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'items' }] },
        { variableId: '10', name: 'DLV - coupon', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'coupon' }] },
        { variableId: '11', name: 'DLV - discount', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'discount' }] },
        { variableId: '12', name: 'DLV - tax', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'tax' }] },
        { variableId: '13', name: 'DLV - shipping', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'shipping' }] },
        { variableId: '14', name: 'DLV - order_total', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'order_total' }] },
        { variableId: '15', name: 'DLV - payment_type', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'payment_type' }] },
        { variableId: '16', name: 'DLV - customer_id', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'customer_id' }] },
        { variableId: '17', name: 'DLV - customer_type', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'customer_type' }] },
        { variableId: '18', name: 'DLV - page_category', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'page_category' }] },
        { variableId: '19', name: 'DLV - search_term', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'search_term' }] },
        { variableId: '20', name: 'DLV - event_name', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'event' }] },
      ],
      trigger: [
        { triggerId: '1', name: 'All Pages', type: 'pageview' },
        {
          triggerId: '2',
          name: 'Purchase Page',
          type: 'pageview',
          filter: [
            {
              type: 'contains',
              parameter: [
                { type: 'TEMPLATE', key: 'arg0', value: '{{Page URL}}' },
                { type: 'TEMPLATE', key: 'arg1', value: '/thank-you' },
              ],
            },
          ],
          filterGroup: [
            {
              filter: [
                {
                  type: 'contains',
                  parameter: [
                    { type: 'TEMPLATE', key: 'arg0', value: '{{Page URL}}' },
                    { type: 'TEMPLATE', key: 'arg1', value: '/thank-you' },
                  ],
                },
              ],
            },
            {
              filter: [
                {
                  type: 'contains',
                  parameter: [
                    { type: 'TEMPLATE', key: 'arg0', value: '{{Page URL}}' },
                    { type: 'TEMPLATE', key: 'arg1', value: '/order-confirmation' },
                  ],
                },
              ],
            },
            {
              filter: [
                {
                  type: 'contains',
                  parameter: [
                    { type: 'TEMPLATE', key: 'arg0', value: '{{Page URL}}' },
                    { type: 'TEMPLATE', key: 'arg1', value: '/order-received' },
                  ],
                },
              ],
            },
          ],
        },
        { triggerId: '3', name: 'Cart Page', type: 'pageview', filter: [{ type: 'contains', parameter: [{ type: 'TEMPLATE', key: 'arg0', value: '{{Page URL}}' }, { type: 'TEMPLATE', key: 'arg1', value: '/cart' }] }] },
        { triggerId: '4', name: 'Checkout Page', type: 'pageview', filter: [{ type: 'contains', parameter: [{ type: 'TEMPLATE', key: 'arg0', value: '{{Page URL}}' }, { type: 'TEMPLATE', key: 'arg1', value: '/checkout' }] }] },
        {
          triggerId: '5',
          name: 'Refund Page',
          type: 'pageview',
          filter: [
            {
              type: 'contains',
              parameter: [
                { type: 'TEMPLATE', key: 'arg0', value: '{{Page URL}}' },
                { type: 'TEMPLATE', key: 'arg1', value: '/refund' },
              ],
            },
          ],
          filterGroup: [
            {
              filter: [
                {
                  type: 'contains',
                  parameter: [
                    { type: 'TEMPLATE', key: 'arg0', value: '{{Page URL}}' },
                    { type: 'TEMPLATE', key: 'arg1', value: '/refund' },
                  ],
                },
              ],
            },
            {
              filter: [
                {
                  type: 'contains',
                  parameter: [
                    { type: 'TEMPLATE', key: 'arg0', value: '{{Page URL}}' },
                    { type: 'TEMPLATE', key: 'arg1', value: '/return' },
                  ],
                },
              ],
            },
          ],
        },
        { triggerId: '6', name: 'Custom - add_to_cart', type: 'customEvent', customEventFilter: [{ type: 'equals', parameter: [{ type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' }, { type: 'TEMPLATE', key: 'arg1', value: 'add_to_cart' }] }] },
        { triggerId: '7', name: 'Custom - view_item', type: 'customEvent', customEventFilter: [{ type: 'equals', parameter: [{ type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' }, { type: 'TEMPLATE', key: 'arg1', value: 'view_item' }] }] },
        { triggerId: '8', name: 'Custom - begin_checkout', type: 'customEvent', customEventFilter: [{ type: 'equals', parameter: [{ type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' }, { type: 'TEMPLATE', key: 'arg1', value: 'begin_checkout' }] }] },
        { triggerId: '9', name: 'Custom - add_payment_info', type: 'customEvent', customEventFilter: [{ type: 'equals', parameter: [{ type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' }, { type: 'TEMPLATE', key: 'arg1', value: 'add_payment_info' }] }] },
        { triggerId: '10', name: 'Custom - generate_lead', type: 'customEvent', customEventFilter: [{ type: 'equals', parameter: [{ type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' }, { type: 'TEMPLATE', key: 'arg1', value: 'generate_lead' }] }] },
      ],
      tag: [
        { tagId: '1', name: 'TrackHive Base Pixel', type: 'html', firingTriggerId: ['1'], parameter: [{ type: 'TEMPLATE', key: 'html', value: "<script>\n(function(w,d,s,l,i){w[l]=w[l]||[];\nvar f=d.getElementsByTagName(s)[0],j=d.createElement(s);\nj.async=true;j.src='https://track.itshassanahmed.com/pixel.js?id='+i;\nf.parentNode.insertBefore(j,f);\n})(window,document,'script','trackHive','{{TrackHive Pixel ID}}');\n</script>" }, { type: 'BOOLEAN', key: 'supportDocumentWrite', value: 'false' }] },
        { tagId: '2', name: 'GA4 Configuration', type: 'gaawc', firingTriggerId: ['1'], parameter: [{ type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' }] },
        { tagId: '3', name: 'GA4 - Purchase', type: 'gaawe', firingTriggerId: ['2'], parameter: [{ type: 'TEMPLATE', key: 'eventName', value: 'purchase' }, { type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' }, { type: 'TEMPLATE', key: 'eventParameters', value: "{\"value\":\"{{DLV - value}}\",\"currency\":\"{{DLV - currency}}\",\"transaction_id\":\"{{DLV - transaction_id}}\",\"coupon\":\"{{DLV - coupon}}\",\"tax\":\"{{DLV - tax}}\",\"shipping\":\"{{DLV - shipping}}\",\"items\":\"{{DLV - items}}\"}" }] },
        { tagId: '4', name: 'GA4 - Add to Cart', type: 'gaawe', firingTriggerId: ['6'], parameter: [{ type: 'TEMPLATE', key: 'eventName', value: 'add_to_cart' }, { type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' }, { type: 'TEMPLATE', key: 'eventParameters', value: "{\"value\":\"{{DLV - value}}\",\"currency\":\"{{DLV - currency}}\",\"item_id\":\"{{DLV - item_id}}\",\"items\":\"{{DLV - items}}\"}" }] },
        { tagId: '5', name: 'GA4 - View Item', type: 'gaawe', firingTriggerId: ['7'], parameter: [{ type: 'TEMPLATE', key: 'eventName', value: 'view_item' }, { type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' }, { type: 'TEMPLATE', key: 'eventParameters', value: "{\"item_id\":\"{{DLV - item_id}}\",\"items\":\"{{DLV - items}}\",\"value\":\"{{DLV - value}}\",\"currency\":\"{{DLV - currency}}\"}" }] },
        { tagId: '6', name: 'GA4 - Begin Checkout', type: 'gaawe', firingTriggerId: ['8'], parameter: [{ type: 'TEMPLATE', key: 'eventName', value: 'begin_checkout' }, { type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' }, { type: 'TEMPLATE', key: 'eventParameters', value: "{\"value\":\"{{DLV - value}}\",\"currency\":\"{{DLV - currency}}\",\"coupon\":\"{{DLV - coupon}}\",\"items\":\"{{DLV - items}}\"}" }] },
        { tagId: '7', name: 'GA4 - Add Payment Info', type: 'gaawe', firingTriggerId: ['9'], parameter: [{ type: 'TEMPLATE', key: 'eventName', value: 'add_payment_info' }, { type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' }, { type: 'TEMPLATE', key: 'eventParameters', value: "{\"value\":\"{{DLV - value}}\",\"currency\":\"{{DLV - currency}}\",\"payment_type\":\"{{DLV - payment_type}}\",\"items\":\"{{DLV - items}}\"}" }] },
        { tagId: '8', name: 'GA4 - Refund', type: 'gaawe', firingTriggerId: ['5'], parameter: [{ type: 'TEMPLATE', key: 'eventName', value: 'refund' }, { type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' }, { type: 'TEMPLATE', key: 'eventParameters', value: "{\"transaction_id\":\"{{DLV - transaction_id}}\",\"value\":\"{{DLV - value}}\",\"currency\":\"{{DLV - currency}}\",\"items\":\"{{DLV - items}}\"}" }] },
        { tagId: '9', name: 'GA4 - Search', type: 'gaawe', firingTriggerId: ['1'], parameter: [{ type: 'TEMPLATE', key: 'eventName', value: 'search' }, { type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' }, { type: 'TEMPLATE', key: 'eventParameters', value: "{\"search_term\":\"{{DLV - search_term}}\"}" }] },
        { tagId: '10', name: 'TrackHive - Purchase Event', type: 'html', firingTriggerId: ['2'], parameter: [{ type: 'TEMPLATE', key: 'html', value: "<script>\nwindow.TrackHive && window.TrackHive.track('Purchase', {\n  value: {{DLV - value}},\n  currency: '{{DLV - currency}}',\n  email: '{{DLV - email}}',\n  phone: '{{DLV - phone}}',\n  event_id: '{{DLV - transaction_id}}',\n  customer_id: '{{DLV - customer_id}}',\n  customer_type: '{{DLV - customer_type}}',\n  event_source_url: window.location.href\n});\n</script>" }, { type: 'BOOLEAN', key: 'supportDocumentWrite', value: 'false' }] },
        { tagId: '11', name: 'TrackHive - AddToCart Event', type: 'html', firingTriggerId: ['6'], parameter: [{ type: 'TEMPLATE', key: 'html', value: "<script>\nwindow.TrackHive && window.TrackHive.track('AddToCart', {\n  value: {{DLV - value}},\n  currency: '{{DLV - currency}}',\n  item_id: '{{DLV - item_id}}',\n  event_source_url: window.location.href\n});\n</script>" }, { type: 'BOOLEAN', key: 'supportDocumentWrite', value: 'false' }] },
        { tagId: '12', name: 'TrackHive - ViewContent Event', type: 'html', firingTriggerId: ['7'], parameter: [{ type: 'TEMPLATE', key: 'html', value: "<script>\nwindow.TrackHive && window.TrackHive.track('ViewContent', {\n  value: {{DLV - value}},\n  currency: '{{DLV - currency}}',\n  item_id: '{{DLV - item_id}}',\n  event_source_url: window.location.href\n});\n</script>" }, { type: 'BOOLEAN', key: 'supportDocumentWrite', value: 'false' }] },
        { tagId: '13', name: 'TrackHive - InitiateCheckout Event', type: 'html', firingTriggerId: ['8'], parameter: [{ type: 'TEMPLATE', key: 'html', value: "<script>\nwindow.TrackHive && window.TrackHive.track('InitiateCheckout', {\n  value: {{DLV - value}},\n  currency: '{{DLV - currency}}',\n  event_source_url: window.location.href\n});\n</script>" }, { type: 'BOOLEAN', key: 'supportDocumentWrite', value: 'false' }] },
        { tagId: '14', name: 'TrackHive - AddPaymentInfo Event', type: 'html', firingTriggerId: ['9'], parameter: [{ type: 'TEMPLATE', key: 'html', value: "<script>\nwindow.TrackHive && window.TrackHive.track('AddPaymentInfo', {\n  value: {{DLV - value}},\n  currency: '{{DLV - currency}}',\n  payment_type: '{{DLV - payment_type}}',\n  event_source_url: window.location.href\n});\n</script>" }, { type: 'BOOLEAN', key: 'supportDocumentWrite', value: 'false' }] },
        { tagId: '15', name: 'TrackHive Auto-Track Script', type: 'html', firingTriggerId: ['1'], parameter: [{ type: 'TEMPLATE', key: 'html', value: '<script src=\"https://track.itshassanahmed.com/auto-track.js\"></script>' }, { type: 'BOOLEAN', key: 'supportDocumentWrite', value: 'false' }] },
      ],
    },
  }
}

function createLeadGenGtmExport(pixelId: string): GtmExport {
  return {
    exportFormatVersion: 2,
    exportTime: new Date().toISOString(),
    containerVersion: {
      container: {
        accountId: '0',
        containerId: '0',
        name: 'TrackHive GTM - Lead Gen',
        usageContext: ['web'],
      },
      variable: [
        { variableId: '1', name: 'GA4 Measurement ID', type: 'c', parameter: [{ type: 'TEMPLATE', key: 'value', value: '' }] },
        { variableId: '2', name: 'TrackHive Pixel ID', type: 'c', parameter: [{ type: 'TEMPLATE', key: 'value', value: pixelId }] },
        { variableId: '3', name: 'DLV - email', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'email' }] },
        { variableId: '4', name: 'DLV - phone', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'phone' }] },
        { variableId: '5', name: 'DLV - form_name', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'form_name' }] },
        { variableId: '6', name: 'DLV - form_id', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'form_id' }] },
        { variableId: '7', name: 'DLV - lead_source', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'lead_source' }] },
        { variableId: '8', name: 'DLV - campaign_id', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'campaign_id' }] },
        { variableId: '9', name: 'DLV - page_category', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'page_category' }] },
        { variableId: '10', name: 'DLV - service_type', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'service_type' }] },
        { variableId: '11', name: 'DLV - budget', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'budget' }] },
        { variableId: '12', name: 'DLV - company_name', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'company_name' }] },
        { variableId: '13', name: 'DLV - job_title', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'job_title' }] },
        { variableId: '14', name: 'DLV - event_name', type: 'v', parameter: [{ type: 'TEMPLATE', key: 'dataLayerVariableName', value: 'event' }] },
      ],
      trigger: [
        { triggerId: '1', name: 'All Pages', type: 'pageview' },
        {
          triggerId: '2',
          name: 'Thank You Page',
          type: 'pageview',
          filter: [
            {
              type: 'contains',
              parameter: [
                { type: 'TEMPLATE', key: 'arg0', value: '{{Page URL}}' },
                { type: 'TEMPLATE', key: 'arg1', value: '/thank-you' },
              ],
            },
          ],
          filterGroup: [
            {
              filter: [
                {
                  type: 'contains',
                  parameter: [
                    { type: 'TEMPLATE', key: 'arg0', value: '{{Page URL}}' },
                    { type: 'TEMPLATE', key: 'arg1', value: '/thank-you' },
                  ],
                },
              ],
            },
            {
              filter: [
                {
                  type: 'contains',
                  parameter: [
                    { type: 'TEMPLATE', key: 'arg0', value: '{{Page URL}}' },
                    { type: 'TEMPLATE', key: 'arg1', value: '/success' },
                  ],
                },
              ],
            },
            {
              filter: [
                {
                  type: 'contains',
                  parameter: [
                    { type: 'TEMPLATE', key: 'arg0', value: '{{Page URL}}' },
                    { type: 'TEMPLATE', key: 'arg1', value: '/confirmation' },
                  ],
                },
              ],
            },
          ],
        },
        { triggerId: '3', name: 'Custom - generate_lead', type: 'customEvent', customEventFilter: [{ type: 'equals', parameter: [{ type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' }, { type: 'TEMPLATE', key: 'arg1', value: 'generate_lead' }] }] },
        { triggerId: '4', name: 'Custom - form_start', type: 'customEvent', customEventFilter: [{ type: 'equals', parameter: [{ type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' }, { type: 'TEMPLATE', key: 'arg1', value: 'form_start' }] }] },
        { triggerId: '5', name: 'Custom - form_complete', type: 'customEvent', customEventFilter: [{ type: 'equals', parameter: [{ type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' }, { type: 'TEMPLATE', key: 'arg1', value: 'form_complete' }] }] },
        { triggerId: '6', name: 'Click - Phone Numbers', type: 'click', filter: [{ type: 'contains', parameter: [{ type: 'TEMPLATE', key: 'arg0', value: '{{Click URL}}' }, { type: 'TEMPLATE', key: 'arg1', value: 'tel:' }] }] },
        { triggerId: '7', name: 'Click - WhatsApp', type: 'click', filter: [{ type: 'contains', parameter: [{ type: 'TEMPLATE', key: 'arg0', value: '{{Click URL}}' }, { type: 'TEMPLATE', key: 'arg1', value: 'wa.me' }] }] },
        { triggerId: '8', name: 'Scroll Depth 50%', type: 'scrollDepth', parameter: [{ type: 'TEMPLATE', key: 'verticalThresholds', value: '50' }] },
        { triggerId: '9', name: 'Timer 30 seconds', type: 'timer', parameter: [{ type: 'TEMPLATE', key: 'interval', value: '30000' }, { type: 'TEMPLATE', key: 'limit', value: '1' }] },
      ],
      tag: [
        { tagId: '1', name: 'TrackHive Base Pixel', type: 'html', firingTriggerId: ['1'], parameter: [{ type: 'TEMPLATE', key: 'html', value: "<script>\n(function(w,d,s,l,i){w[l]=w[l]||[];\nvar f=d.getElementsByTagName(s)[0],j=d.createElement(s);\nj.async=true;j.src='https://track.itshassanahmed.com/pixel.js?id='+i;\nf.parentNode.insertBefore(j,f);\n})(window,document,'script','trackHive','{{TrackHive Pixel ID}}');\n</script>" }, { type: 'BOOLEAN', key: 'supportDocumentWrite', value: 'false' }] },
        { tagId: '2', name: 'GA4 Configuration', type: 'gaawc', firingTriggerId: ['1'], parameter: [{ type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' }] },
        { tagId: '3', name: 'GA4 - Lead', type: 'gaawe', firingTriggerId: ['3'], parameter: [{ type: 'TEMPLATE', key: 'eventName', value: 'generate_lead' }, { type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' }, { type: 'TEMPLATE', key: 'eventParameters', value: "{\"form_name\":\"{{DLV - form_name}}\",\"form_id\":\"{{DLV - form_id}}\",\"lead_source\":\"{{DLV - lead_source}}\",\"campaign_id\":\"{{DLV - campaign_id}}\",\"service_type\":\"{{DLV - service_type}}\",\"budget\":\"{{DLV - budget}}\"}" }] },
        { tagId: '4', name: 'GA4 - Form Start', type: 'gaawe', firingTriggerId: ['4'], parameter: [{ type: 'TEMPLATE', key: 'eventName', value: 'form_start' }, { type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' }, { type: 'TEMPLATE', key: 'eventParameters', value: "{\"form_name\":\"{{DLV - form_name}}\",\"form_id\":\"{{DLV - form_id}}\",\"page_category\":\"{{DLV - page_category}}\"}" }] },
        { tagId: '5', name: 'GA4 - Form Complete', type: 'gaawe', firingTriggerId: ['5'], parameter: [{ type: 'TEMPLATE', key: 'eventName', value: 'form_complete' }, { type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' }, { type: 'TEMPLATE', key: 'eventParameters', value: "{\"form_name\":\"{{DLV - form_name}}\",\"form_id\":\"{{DLV - form_id}}\",\"lead_source\":\"{{DLV - lead_source}}\"}" }] },
        { tagId: '6', name: 'GA4 - Click to Call', type: 'gaawe', firingTriggerId: ['6'], parameter: [{ type: 'TEMPLATE', key: 'eventName', value: 'click_to_call' }, { type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' }, { type: 'TEMPLATE', key: 'eventParameters', value: "{\"click_url\":\"{{Click URL}}\",\"page_category\":\"{{DLV - page_category}}\"}" }] },
        { tagId: '7', name: 'GA4 - WhatsApp Click', type: 'gaawe', firingTriggerId: ['7'], parameter: [{ type: 'TEMPLATE', key: 'eventName', value: 'whatsapp_click' }, { type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' }, { type: 'TEMPLATE', key: 'eventParameters', value: "{\"page_category\":\"{{DLV - page_category}}\",\"page_url\":\"{{Page URL}}\"}" }] },
        { tagId: '8', name: 'GA4 - Scroll Engagement', type: 'gaawe', firingTriggerId: ['8'], parameter: [{ type: 'TEMPLATE', key: 'eventName', value: 'scroll_depth' }, { type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' }, { type: 'TEMPLATE', key: 'eventParameters', value: "{\"depth_percent\":\"50\",\"page_url\":\"{{Page URL}}\"}" }] },
        { tagId: '9', name: 'GA4 - Time Engagement', type: 'gaawe', firingTriggerId: ['9'], parameter: [{ type: 'TEMPLATE', key: 'eventName', value: 'time_on_page' }, { type: 'TEMPLATE', key: 'measurementId', value: '{{GA4 Measurement ID}}' }, { type: 'TEMPLATE', key: 'eventParameters', value: "{\"seconds_spent\":\"30\",\"page_url\":\"{{Page URL}}\"}" }] },
        { tagId: '10', name: 'TrackHive - Lead Event', type: 'html', firingTriggerId: ['3'], parameter: [{ type: 'TEMPLATE', key: 'html', value: "<script>\nwindow.TrackHive && window.TrackHive.track('Lead', {\n  email: '{{DLV - email}}',\n  phone: '{{DLV - phone}}',\n  form_name: '{{DLV - form_name}}',\n  lead_source: '{{DLV - lead_source}}',\n  campaign_id: '{{DLV - campaign_id}}',\n  service_type: '{{DLV - service_type}}',\n  budget: '{{DLV - budget}}',\n  company_name: '{{DLV - company_name}}',\n  event_source_url: window.location.href\n});\n</script>" }, { type: 'BOOLEAN', key: 'supportDocumentWrite', value: 'false' }] },
        { tagId: '11', name: 'TrackHive - Click to Call Event', type: 'html', firingTriggerId: ['6'], parameter: [{ type: 'TEMPLATE', key: 'html', value: "<script>\nwindow.TrackHive && window.TrackHive.track('Contact', {\n  contact_method: 'phone',\n  phone_number: '{{Click URL}}',\n  event_source_url: window.location.href\n});\n</script>" }, { type: 'BOOLEAN', key: 'supportDocumentWrite', value: 'false' }] },
        { tagId: '12', name: 'TrackHive Auto-Track Script', type: 'html', firingTriggerId: ['1'], parameter: [{ type: 'TEMPLATE', key: 'html', value: '<script src=\"https://track.itshassanahmed.com/auto-track.js\"></script>' }, { type: 'BOOLEAN', key: 'supportDocumentWrite', value: 'false' }] },
      ],
    },
  }
}

export default function TemplatesClient({
  userPlan,
  rawPlan,
  isTrial,
}: {
  userPlan: PlanLabel
  rawPlan: string
  isTrial: boolean
}) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [platformFilter, setPlatformFilter] = useState<string>('All')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All')
  const [planFilter, setPlanFilter] = useState<string>('All')
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [bundlePreviewOpen, setBundlePreviewOpen] = useState(false)
  const [upgradeModal, setUpgradeModal] = useState<{
    open: boolean
    templateName: string
    requiredPlan: 'pro' | 'agency'
  }>({ open: false, templateName: '', requiredPlan: 'pro' })
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [bundleDownloading, setBundleDownloading] = useState<'ecom' | 'leadgen' | null>(null)

  const filtered = useMemo(() => {
    return TEMPLATES.filter((t) => {
      const matchSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      const matchCategory = category === 'All' || t.category === category
      const matchType = typeFilter === 'All' || t.type === typeFilter
      const matchPlatform =
        platformFilter === 'All' || t.platform.includes(platformFilter)
      const matchDifficulty =
        difficultyFilter === 'All' || t.difficulty === difficultyFilter
      const matchPlan = planFilter === 'All' || t.requiredPlan === planFilter
      return (
        matchSearch &&
        matchCategory &&
        matchType &&
        matchPlatform &&
        matchDifficulty &&
        matchPlan
      )
    })
  }, [
    search,
    category,
    typeFilter,
    platformFilter,
    difficultyFilter,
    planFilter,
  ])

  const stats = useMemo(() => {
    const free = TEMPLATES.filter((t) => t.requiredPlan === 'free').length
    const pro = TEMPLATES.filter((t) => t.requiredPlan === 'pro').length
    const agency = TEMPLATES.filter((t) => t.requiredPlan === 'agency').length
    return { total: TEMPLATES.length, free, pro, agency }
  }, [])

  const bundleLocked = useMemo(() => {
    const plan = (rawPlan || 'free').toLowerCase()
    if (isTrial) return true
    return !(plan === 'pro' || plan === 'agency')
  }, [rawPlan, isTrial])

  async function fetchUserPixelId(userId: string): Promise<string | null> {
    const supabase = createClient()
    const primary = await supabase
      .from('pixels')
      .select('pixel_id')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .limit(1)
      .maybeSingle()

    let pixelId = primary.data?.pixel_id ?? null
    if (!pixelId) {
      const fallback = await supabase
        .from('pixels')
        .select('pixel_id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle()
      pixelId = fallback.data?.pixel_id ?? null
    }
    return pixelId
  }

  async function handleBundleDownload(bundleType: 'ecom' | 'leadgen') {
    if (bundleLocked || bundleDownloading) return
    setBundleDownloading(bundleType)
    const supabase = createClient()
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setToast({ type: 'error', message: 'Please sign in again.' })
        return
      }

      const pixelId = await fetchUserPixelId(user.id)

      if (!pixelId) {
        setToast({
          type: 'error',
          message: 'No active pixel found. Create a pixel first, then try again.',
        })
        return
      }

      const json =
        bundleType === 'ecom'
          ? createEcomGtmExport(pixelId)
          : createLeadGenGtmExport(pixelId)
      const blob = new Blob([JSON.stringify(json, null, 2)], {
        type: 'application/json;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download =
        bundleType === 'ecom'
          ? 'trackhive-gtm-ecom.json'
          : 'trackhive-gtm-leadgen.json'
      a.click()
      URL.revokeObjectURL(url)

      await supabase.from('gtm_container_downloads').insert({
        user_id: user.id,
        pixel_id: pixelId,
        bundle_type: bundleType,
        downloaded_at: new Date().toISOString(),
      })

      setToast({ type: 'success', message: 'GTM Container downloaded successfully' })
    } catch {
      setToast({ type: 'error', message: 'Download failed. Please try again.' })
    } finally {
      setBundleDownloading(null)
      window.setTimeout(() => setToast(null), 3000)
    }
  }

  async function handleDownload(t: Template) {
    const canAccess = canAccessTemplate(userPlan, t.requiredPlan)
    if (!canAccess) {
      setUpgradeModal({
        open: true,
        templateName: t.name,
        requiredPlan: t.requiredPlan === 'free' ? 'pro' : t.requiredPlan,
      })
      return
    }
    try {
      const res = await fetch(`/api/templates/download?templateId=${encodeURIComponent(t.id)}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 403) {
          setUpgradeModal({
            open: true,
            templateName: t.name,
            requiredPlan: t.requiredPlan === 'free' ? 'pro' : t.requiredPlan,
          })
          return
        }
        alert(data.message || data.error || 'Download failed')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = t.fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Download failed')
    }
  }

  function handleCopyCode() {
    if (!previewTemplate) return
    navigator.clipboard.writeText(previewTemplate.previewCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownloadCode() {
    if (!previewTemplate) return
    const blob = new Blob([previewTemplate.previewCode], {
      type: 'text/plain;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = previewTemplate.fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 md:p-8 bg-[var(--dash-bg)] text-[var(--dash-text)]">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-[var(--dash-success)] text-white'
              : 'bg-[var(--dash-danger)] text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      <header className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-1">
          GTM & sGTM Template Library
        </h1>
        <p className="text-[var(--dash-muted)] text-sm mb-4">
          80+ ready-to-use templates. Download, import, and start tracking in
          minutes.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-[var(--dash-muted)]">
            <strong className="text-[var(--dash-muted)]">{stats.total}</strong> templates
            available
          </span>
          <span className="text-[var(--dash-muted)]">
            <strong className="text-[var(--dash-success)]">{stats.free}</strong> Free
          </span>
          <span className="text-[var(--dash-muted)]">
            <strong className="text-amber-400">{stats.pro}</strong> Pro
          </span>
          <span className="text-[var(--dash-muted)]">
            <strong className="text-[var(--dash-primary)]">{stats.agency}</strong> Agency
          </span>
        </div>
      </header>

      <section className="mb-6">
        <div className="relative rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)] shadow-[var(--dash-shadow)] overflow-hidden">
          <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] border border-[var(--dash-accent-border)]">
                  PRO
                </span>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] border border-[var(--dash-border)]">
                  ALL-IN-ONE BUNDLE
                </span>
              </div>
              <h2 className="text-lg font-semibold text-[var(--dash-text)] flex items-center gap-2">
                <Package className="w-5 h-5 text-[var(--dash-primary)]" />
                Complete GTM Container
              </h2>
              <p className="text-sm text-[var(--dash-muted)] mt-1 max-w-3xl">
                One-click import. All TrackHive tags, GA4 events, triggers, and variables — pre-configured and ready to go.
              </p>
              <div className="flex flex-wrap gap-1 mt-3">
                {['Meta', 'Google', 'GA4', 'GTM'].map((p) => (
                  <span
                    key={p}
                    className="px-1.5 py-0.5 rounded text-xs bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] border border-[var(--dash-border)]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setBundlePreviewOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--dash-primary-soft)] text-[var(--dash-text)] border border-[var(--dash-accent-border)] hover:bg-[var(--dash-primary-soft-strong)] transition-colors text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                Preview Contents
              </button>
            </div>
          </div>

          <div className="px-5 pb-5 md:px-6 md:pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--dash-border)] bg-white/70 backdrop-blur p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-warning)]/20 text-amber-400">
                        PRO
                      </span>
                      <p className="text-sm font-semibold text-[var(--dash-text)]">
                        E-commerce Bundle
                      </p>
                    </div>
                    <p className="text-sm text-[var(--dash-muted)]">
                      For online stores. Includes Purchase, Add to Cart, View Item, and Checkout tracking pre-wired.
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-[var(--dash-muted)]">
                    Includes: 15 tags • 10 triggers • 20 variables
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {['Purchase', 'Add to Cart', 'View Item', 'Begin Checkout', 'Add Payment Info', 'Refund', 'ViewContent', 'InitiateCheckout'].map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded text-xs bg-[var(--dash-surface-hover)] text-[var(--dash-muted)]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <span
                  title={bundleLocked ? 'Upgrade to PRO to download the full GTM container' : undefined}
                  className="mt-4 inline-flex w-full"
                >
                  <button
                    type="button"
                    onClick={() => handleBundleDownload('ecom')}
                    disabled={bundleLocked || bundleDownloading != null}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      bundleLocked
                        ? 'bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] border-[var(--dash-border)] cursor-not-allowed'
                        : 'bg-[var(--dash-success-soft)] text-[var(--dash-success)] border-[var(--dash-success-border)] hover:bg-[var(--dash-success-soft)]/80'
                    }`}
                  >
                    {bundleLocked ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    {bundleDownloading === 'ecom' ? 'Preparing…' : 'Download E-commerce'}
                  </button>
                </span>
              </div>

              <div className="rounded-xl border border-[var(--dash-border)] bg-white/70 backdrop-blur p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-warning)]/20 text-amber-400">
                        PRO
                      </span>
                      <p className="text-sm font-semibold text-[var(--dash-text)]">
                        Lead Gen Bundle
                      </p>
                    </div>
                    <p className="text-sm text-[var(--dash-muted)]">
                      For service businesses, agencies, and SaaS. Includes Lead and Form Submit tracking pre-wired.
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-[var(--dash-muted)]">
                    Includes: 12 tags • 9 triggers • 14 variables
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {['Lead', 'Form Start', 'Form Complete', 'Click to Call', 'WhatsApp', 'Scroll Depth', 'Time on Page'].map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded text-xs bg-[var(--dash-surface-hover)] text-[var(--dash-muted)]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <span
                  title={bundleLocked ? 'Upgrade to PRO to download the full GTM container' : undefined}
                  className="mt-4 inline-flex w-full"
                >
                  <button
                    type="button"
                    onClick={() => handleBundleDownload('leadgen')}
                    disabled={bundleLocked || bundleDownloading != null}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      bundleLocked
                        ? 'bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] border-[var(--dash-border)] cursor-not-allowed'
                        : 'bg-[var(--dash-success-soft)] text-[var(--dash-success)] border-[var(--dash-success-border)] hover:bg-[var(--dash-success-soft)]/80'
                    }`}
                  >
                    {bundleLocked ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    {bundleDownloading === 'leadgen' ? 'Preparing…' : 'Download Lead Gen'}
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="rounded-xl border border-[var(--dash-border)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 md:p-6">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-[var(--dash-text)]">
              How to set this up — 3 minutes
            </h3>
            <p className="text-sm text-[var(--dash-muted)] mt-1">
              Follow these steps after downloading your container
            </p>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="absolute left-4 top-2 bottom-2 w-px bg-[var(--dash-border)]"
            />

            <div className="space-y-6">
              <div className="relative pl-12">
                <div className="absolute left-0 top-0 flex items-start justify-center w-8">
                  <div className="w-8 h-8 rounded-full bg-[var(--dash-primary-soft)] border border-[var(--dash-accent-border)] flex items-center justify-center text-sm font-semibold text-[var(--dash-primary)]">
                    1
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 w-9 h-9 rounded-lg bg-[var(--dash-success-soft)] border border-[var(--dash-success-border)] flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4 text-[var(--dash-success)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--dash-text)]">
                      Download Your Container
                    </p>
                    <p className="text-sm text-[var(--dash-muted)] mt-1">
                      Click the Download Container button above. A file named{' '}
                      <span className="font-medium text-[var(--dash-text)]">
                        trackhive-gtm-container.json
                      </span>{' '}
                      will be saved to your computer. Your TrackHive Pixel ID is already pre-filled inside.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-0 top-0 flex items-start justify-center w-8">
                  <div className="w-8 h-8 rounded-full bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] flex items-center justify-center text-sm font-semibold text-[var(--dash-text)]">
                    2
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 w-9 h-9 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] flex items-center justify-center shrink-0">
                    <ExternalLink className="w-4 h-4 text-[var(--dash-muted)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--dash-text)]">
                      Open Google Tag Manager
                    </p>
                    <p className="text-sm text-[var(--dash-muted)] mt-1">
                      Go to tagmanager.google.com and open your GTM account. If you don&apos;t have one, create a free account and add your container to your website first.
                    </p>
                    <a
                      href="https://tagmanager.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-[var(--dash-success)] hover:underline mt-2"
                    >
                      Open GTM →
                    </a>
                  </div>
                </div>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-0 top-0 flex items-start justify-center w-8">
                  <div className="w-8 h-8 rounded-full bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] flex items-center justify-center text-sm font-semibold text-[var(--dash-text)]">
                    3
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 w-9 h-9 rounded-lg bg-[var(--dash-primary-soft)] border border-[var(--dash-accent-border)] flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4 text-[var(--dash-primary)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--dash-text)]">
                      Import the Container
                    </p>
                    <p className="text-sm text-[var(--dash-muted)] mt-1">
                      In GTM, click Admin in the top navigation. Under the Container column, click Import Container. Upload the trackhive-gtm-container.json file you downloaded. Choose your Workspace (use Default), then select Merge → Rename conflicting tags. Click Confirm.
                    </p>
                    <div className="mt-3 rounded-lg border border-[var(--dash-accent-border)] bg-[var(--dash-primary-soft)] px-3 py-2">
                      <p className="text-xs text-[var(--dash-primary)]">
                        Important: Always choose Merge not Overwrite — Overwrite will delete your existing tags.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-0 top-0 flex items-start justify-center w-8">
                  <div className="w-8 h-8 rounded-full bg-[var(--dash-primary-soft)] border border-[var(--dash-accent-border)] flex items-center justify-center text-sm font-semibold text-[var(--dash-primary)]">
                    4
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 w-9 h-9 rounded-lg bg-[var(--dash-primary-soft)] border border-[var(--dash-accent-border)] flex items-center justify-center shrink-0">
                    <PencilLine className="w-4 h-4 text-[var(--dash-primary)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--dash-text)]">
                      Add Your GA4 Measurement ID
                    </p>
                    <p className="text-sm text-[var(--dash-muted)] mt-1">
                      After importing, go to Variables in GTM. Find the variable named GA4 Measurement ID. Click it and enter your GA4 Measurement ID (format: G-XXXXXXXXXX). You can find this in your GA4 property under Admin → Data Streams.
                    </p>
                    <div className="mt-3 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-hover)] px-3 py-2">
                      <p className="text-xs text-[var(--dash-muted)]">
                        Tip: Your GA4 Measurement ID starts with G- and is found in GA4 → Admin → Data Streams → your stream → Measurement ID.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--dash-accent-border)] bg-[var(--dash-primary-soft)] p-4 md:p-5">
                <p className="text-sm font-semibold text-[var(--dash-primary)]">
                  Don&apos;t forget to Publish
                </p>
                <p className="text-sm text-[var(--dash-muted)] mt-1">
                  Go to Submit in GTM top right corner, add a version name like TrackHive Setup, and click Publish. Your tracking goes live only after publishing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--dash-muted)]" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)] focus:border-[var(--dash-success)]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-[var(--dash-muted)] text-sm mr-1 self-center">Category:</span>
          {['All', ...CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                category === c
                  ? 'bg-[var(--dash-success-soft)] text-[var(--dash-success)] border border-[var(--dash-success-border)]'
                  : 'bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] border border-[var(--dash-border)] hover:bg-[var(--dash-surface-hover)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-[var(--dash-muted)] text-sm mr-1 self-center">Type:</span>
          {['All', ...TYPES.map((t) => t.value)].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setTypeFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === v
                  ? 'bg-[var(--dash-success-soft)] text-[var(--dash-success)] border border-[var(--dash-success-border)]'
                  : 'bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] border border-[var(--dash-border)] hover:bg-[var(--dash-surface-hover)]'
              }`}
            >
              {TYPE_LABELS[v] || v}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-[var(--dash-muted)] text-sm mr-1 self-center">
            Platform:
          </span>
          {['All', ...PLATFORMS].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatformFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                platformFilter === p
                  ? 'bg-[var(--dash-success-soft)] text-[var(--dash-success)] border border-[var(--dash-success-border)]'
                  : 'bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] border border-[var(--dash-border)] hover:bg-[var(--dash-surface-hover)]'
              }`}
            >
              {PLATFORM_LABELS[p] || p}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-[var(--dash-muted)] text-sm mr-1 self-center">
            Difficulty:
          </span>
          {['All', 'beginner', 'intermediate', 'advanced'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficultyFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                difficultyFilter === d
                  ? 'bg-[var(--dash-success-soft)] text-[var(--dash-success)] border border-[var(--dash-success-border)]'
                  : 'bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] border border-[var(--dash-border)] hover:bg-[var(--dash-surface-hover)]'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-[var(--dash-muted)] text-sm mr-1 self-center">Plan:</span>
          {['All', 'free', 'pro', 'agency'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlanFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                planFilter === p
                  ? 'bg-[var(--dash-success-soft)] text-[var(--dash-success)] border border-[var(--dash-success-border)]'
                  : 'bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] border border-[var(--dash-border)] hover:bg-[var(--dash-surface-hover)]'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => {
          const locked = !canAccessTemplate(userPlan, t.requiredPlan)
          return (
            <div
              key={t.id}
              className={`relative rounded-xl border bg-[var(--dash-card)] shadow-[var(--dash-shadow)] overflow-hidden ${
                locked
                  ? 'border-[var(--dash-border)] opacity-90'
                  : 'border-[var(--dash-border)] hover:border-[var(--dash-border-strong)]'
              }`}
            >
              {locked && (
                <div
                  className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center"
                  aria-hidden
                >
                  <Lock className="w-8 h-8 text-[var(--dash-primary)]" />
                </div>
              )}
              <div className="p-4">
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] mb-2"
                  style={{
                    backgroundColor:
                      t.category === 'E-commerce'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : t.category === 'Lead Generation'
                          ? 'rgba(59, 130, 246, 0.2)'
                          : t.category === 'Engagement'
                            ? 'rgba(168, 85, 247, 0.2)'
                            : t.category === 'Server GTM'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : undefined,
                  }}
                >
                  {t.category}
                </span>
                {t.badge && (
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] mb-2 ml-2">
                    {t.badge}
                  </span>
                )}
                <h3 className="font-semibold text-[var(--dash-text)] mb-1">{t.name}</h3>
                <p className="text-sm text-[var(--dash-muted)] line-clamp-2 mb-3">
                  {t.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {t.platform.slice(0, 4).map((p) => (
                    <span
                      key={p}
                      className="px-1.5 py-0.5 rounded text-xs bg-[var(--dash-surface-hover)] text-[var(--dash-muted)]"
                    >
                      {PLATFORM_LABELS[p] || p}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded border ${
                      t.difficulty === 'beginner'
                        ? 'bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] border-[var(--dash-accent-border)]'
                        : t.difficulty === 'intermediate'
                          ? 'bg-[var(--dash-surface-hover)] text-[var(--dash-text)] border-[var(--dash-border)]'
                          : 'bg-[var(--dash-danger-soft)] text-[var(--dash-danger-strong)] border-[var(--dash-danger-border)]'
                    }`}
                  >
                    {t.difficulty}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      t.requiredPlan === 'free'
                        ? 'bg-[var(--dash-surface-hover)] text-[var(--dash-text)] border border-[var(--dash-border)]'
                        : t.requiredPlan === 'pro'
                          ? 'bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] border border-[var(--dash-accent-border)]'
                          : 'bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] border border-[var(--dash-accent-border)]'
                    }`}
                  >
                    {t.requiredPlan.toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(t)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[var(--dash-primary-soft)] text-[var(--dash-text)] border border-[var(--dash-accent-border)] hover:bg-[var(--dash-primary-soft-strong)] transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Code
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(t)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] border border-[var(--dash-accent-border)] hover:bg-[var(--dash-primary-soft-strong)] transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-[var(--dash-muted)] py-12">
          No templates match your filters. Try adjusting search or filters.
        </p>
      )}

      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="rounded-xl bg-[var(--dash-card)] border border-[var(--dash-border)] shadow-[var(--dash-shadow)] max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[var(--dash-border)] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--dash-text)]">
                  {previewTemplate.name}
                </h2>
                <p className="text-sm text-[var(--dash-muted)] mt-0.5">
                  {previewTemplate.description}
                </p>
                <p className="text-xs text-[var(--dash-muted)] mt-1">
                  Plan: {previewTemplate.requiredPlan.toUpperCase()} • File:{' '}
                  {previewTemplate.fileName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="p-2 rounded-lg hover:bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="rounded-lg overflow-hidden border border-[var(--dash-border)]">
                <SyntaxHighlighter
                  language="javascript"
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    fontSize: '13px',
                    background: '#020617',
                    padding: '1rem',
                  }}
                  showLineNumbers
                  wrapLongLines
                >
                  {previewTemplate.previewCode}
                </SyntaxHighlighter>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--dash-border)] flex gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)] transition-colors text-sm font-medium"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              <button
                type="button"
                onClick={handleDownloadCode}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)] transition-colors text-sm font-medium"
              >
                <FileDown className="w-4 h-4" />
                Download File
              </button>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="ml-auto px-4 py-2 rounded-lg border border-[var(--dash-border-strong)] text-[var(--dash-muted)] hover:bg-[var(--dash-surface-hover)] transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {bundlePreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setBundlePreviewOpen(false)}
        >
          <div
            className="rounded-xl bg-[var(--dash-card)] border border-[var(--dash-border)] shadow-[var(--dash-shadow)] max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[var(--dash-border)] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--dash-text)]">
                  Complete GTM Container — Contents
                </h2>
                <p className="text-sm text-[var(--dash-muted)] mt-0.5">
                  Tags, triggers, and variables included in the bundle.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBundlePreviewOpen(false)}
                className="p-2 rounded-lg hover:bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-6">
              <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-hover)] p-4">
                <h3 className="text-sm font-semibold text-[var(--dash-text)] mb-2">E-commerce Bundle — Tags</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ECOM_BUNDLE_CONTENTS.tags.map((name) => (
                    <li key={name} className="text-sm text-[var(--dash-muted)]">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-hover)] p-4">
                <h3 className="text-sm font-semibold text-[var(--dash-text)] mb-2">E-commerce Bundle — Triggers</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ECOM_BUNDLE_CONTENTS.triggers.map((name) => (
                    <li key={name} className="text-sm text-[var(--dash-muted)]">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-hover)] p-4">
                <h3 className="text-sm font-semibold text-[var(--dash-text)] mb-2">E-commerce Bundle — Variables</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ECOM_BUNDLE_CONTENTS.variables.map((name) => (
                    <li key={name} className="text-sm text-[var(--dash-muted)]">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-hover)] p-4">
                <h3 className="text-sm font-semibold text-[var(--dash-text)] mb-2">Lead Gen Bundle — Tags</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {LEADGEN_BUNDLE_CONTENTS.tags.map((name) => (
                    <li key={name} className="text-sm text-[var(--dash-muted)]">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-hover)]/20 p-4">
                <h3 className="text-sm font-semibold text-[var(--dash-text)] mb-2">Lead Gen Bundle — Triggers</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {LEADGEN_BUNDLE_CONTENTS.triggers.map((name) => (
                    <li key={name} className="text-sm text-[var(--dash-muted)]">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-hover)]/20 p-4">
                <h3 className="text-sm font-semibold text-[var(--dash-text)] mb-2">Lead Gen Bundle — Variables</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {LEADGEN_BUNDLE_CONTENTS.variables.map((name) => (
                    <li key={name} className="text-sm text-[var(--dash-muted)]">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--dash-border)] flex gap-2">
              <button
                type="button"
                onClick={() => setBundlePreviewOpen(false)}
                className="ml-auto px-4 py-2 rounded-lg border border-[var(--dash-border-strong)] text-[var(--dash-muted)] hover:bg-[var(--dash-surface-hover)] transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={upgradeModal.open}
        onClose={() =>
          setUpgradeModal((prev) => ({ ...prev, open: false }))
        }
        feature={upgradeModal.templateName}
        requiredPlan={upgradeModal.requiredPlan}
      />
    </div>
  )
}





