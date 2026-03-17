(function() {
  // Safety check
  window.dataLayer = window.dataLayer || [];
  
  var THAutoTrack = {
    
    // ── 1. FORM SUBMIT TRACKING ──────────────────────────
    trackForms: function() {
      document.addEventListener('submit', function(e) {
        var form = e.target;
        var email = '';
        var phone = '';
        
        // Scrape email and phone from form inputs
        var emailInput = form.querySelector(
          'input[type="email"], input[name*="email"], input[id*="email"]'
        );
        var phoneInput = form.querySelector(
          'input[type="tel"], input[name*="phone"], input[name*="mobile"], input[id*="phone"]'
        );
        
        if (emailInput) email = emailInput.value || '';
        if (phoneInput) phone = phoneInput.value || '';
        
        window.dataLayer.push({
          event: 'generate_lead',
          email: email,
          phone: phone,
          form_id: form.id || form.className || 'unknown',
          event_source_url: window.location.href
        });
      }, true);
    },
    
    // ── 2. BUTTON / LINK CLICK TRACKING ─────────────────
    trackClicks: function() {
      var addToCartTerms = ['add to cart', 'add to bag', 'add to basket'];
      var checkoutTerms = ['checkout', 'proceed to checkout', 'buy now'];
      var purchaseTerms = ['place order', 'confirm order', 'complete purchase', 'pay now'];
      
      document.addEventListener('click', function(e) {
        var el = e.target.closest('button, a, [role="button"]');
        if (!el) return;
        
        var text = (el.innerText || el.value || el.getAttribute('aria-label') || '').toLowerCase().trim();
        
        if (addToCartTerms.some(function(t) { return text.includes(t); })) {
          window.dataLayer.push({
            event: 'add_to_cart',
            event_source_url: window.location.href
          });
        }
        
        if (checkoutTerms.some(function(t) { return text.includes(t); })) {
          window.dataLayer.push({
            event: 'begin_checkout',
            event_source_url: window.location.href
          });
        }
        
        if (purchaseTerms.some(function(t) { return text.includes(t); })) {
          window.dataLayer.push({
            event: 'purchase',
            event_source_url: window.location.href
          });
        }
        
      }, true);
    },
    
    // ── 3. URL CHANGE TRACKING (SPA support) ─────────────
    trackURLChanges: function() {
      var lastURL = window.location.href;
      
      // Override pushState and replaceState
      var _pushState = history.pushState;
      var _replaceState = history.replaceState;
      
      history.pushState = function() {
        _pushState.apply(history, arguments);
        THAutoTrack.onURLChange();
      };
      
      history.replaceState = function() {
        _replaceState.apply(history, arguments);
        THAutoTrack.onURLChange();
      };
      
      window.addEventListener('popstate', function() {
        THAutoTrack.onURLChange();
      });
    },
    
    onURLChange: function() {
      var currentURL = window.location.href;
      
      window.dataLayer.push({
        event: 'page_view',
        page_url: currentURL,
        page_title: document.title
      });
      
      // Auto-detect thank you / order confirmation page
      if (
        currentURL.includes('/thank-you') ||
        currentURL.includes('/order-confirmation') ||
        currentURL.includes('/order-received') ||
        currentURL.includes('/checkout/order')
      ) {
        window.dataLayer.push({
          event: 'purchase',
          event_source_url: currentURL
        });
      }
    },
    
    // ── 4. THANK YOU PAGE AUTO-DETECT on load ────────────
    detectThankYouPage: function() {
      var url = window.location.href;
      if (
        url.includes('/thank-you') ||
        url.includes('/order-confirmation') ||
        url.includes('/order-received') ||
        url.includes('/checkout/order')
      ) {
        window.dataLayer.push({
          event: 'purchase',
          event_source_url: url
        });
      }
    },
    
    // ── 6. PHONE / WHATSAPP CLICK TRACKING ──────────────────
    trackCommunicationClicks: function() {
      document.addEventListener('click', function(e) {
        var el = e.target.closest('a');
        if (!el) return;
        var href = el.getAttribute('href') || '';

        if (href.startsWith('tel:')) {
          window.dataLayer.push({
            event: 'click_to_call',
            phone_number: href.replace('tel:', ''),
            event_source_url: window.location.href
          });
        }

        if (href.includes('wa.me') || href.includes('whatsapp.com') || href.includes('api.whatsapp')) {
          window.dataLayer.push({
            event: 'whatsapp_click',
            event_source_url: window.location.href
          });
        }
      }, true);
    },

    // ── 7. OUTBOUND LINK CLICK TRACKING ─────────────────────
    trackOutboundClicks: function() {
      document.addEventListener('click', function(e) {
        var el = e.target.closest('a');
        if (!el) return;
        var href = el.getAttribute('href') || '';
        if (
          href.startsWith('http') &&
          !href.includes(window.location.hostname) &&
          !href.includes('wa.me') &&
          !href.includes('whatsapp') &&
          !href.startsWith('tel:') &&
          !href.startsWith('mailto:')
        ) {
          window.dataLayer.push({
            event: 'outbound_click',
            destination_url: href,
            event_source_url: window.location.href
          });
        }
      }, true);
    },

    // ── 8. FILE DOWNLOAD TRACKING ────────────────────────────
    trackFileDownloads: function() {
      var fileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.csv'];
      document.addEventListener('click', function(e) {
        var el = e.target.closest('a');
        if (!el) return;
        var href = (el.getAttribute('href') || '').toLowerCase();
        var matched = fileTypes.find(function(ext) { return href.includes(ext); });
        if (matched) {
          var parts = href.split('/');
          var fileName = parts[parts.length - 1];
          window.dataLayer.push({
            event: 'file_download',
            file_name: fileName,
            file_type: matched.replace('.', ''),
            event_source_url: window.location.href
          });
        }
      }, true);
    },

    // ── 9. SCROLL DEPTH TRACKING ─────────────────────────────
    trackScrollDepth: function() {
      var milestones = [25, 50, 75, 100];
      var fired = {};
      window.addEventListener('scroll', function() {
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        var pct = Math.round((scrollTop / docHeight) * 100);
        milestones.forEach(function(m) {
          if (pct >= m && !fired[m]) {
            fired[m] = true;
            window.dataLayer.push({
              event: 'scroll_depth',
              depth_percent: m,
              event_source_url: window.location.href
            });
          }
        });
      }, { passive: true });
    },

    // ── 10. TIME ON PAGE TRACKING ────────────────────────────
    trackTimeOnPage: function() {
      var milestones = [30, 60, 120];
      var fired = {};
      milestones.forEach(function(seconds) {
        setTimeout(function() {
          if (!fired[seconds]) {
            fired[seconds] = true;
            window.dataLayer.push({
              event: 'time_on_page',
              seconds_spent: seconds,
              event_source_url: window.location.href
            });
          }
        }, seconds * 1000);
      });
    },

    // ── 11. EXIT INTENT TRACKING ─────────────────────────────
    trackExitIntent: function() {
      var fired = false;
      var startTime = Date.now();
      document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0 && !fired) {
          fired = true;
          var timeSpent = Math.round((Date.now() - startTime) / 1000);
          window.dataLayer.push({
            event: 'exit_intent',
            time_on_page_seconds: timeSpent,
            event_source_url: window.location.href
          });
        }
      });
    },

    // ── 12. VIDEO ENGAGEMENT TRACKING ───────────────────────
    trackVideoEngagement: function() {
      // HTML5 videos
      document.addEventListener('play', function(e) {
        if (e.target.tagName === 'VIDEO') {
          window.dataLayer.push({
            event: 'video_engagement',
            video_action: 'play',
            video_title: e.target.title || e.target.src || 'unknown',
            event_source_url: window.location.href
          });
        }
      }, true);

      document.addEventListener('pause', function(e) {
        if (e.target.tagName === 'VIDEO') {
          var pct = e.target.duration
            ? Math.round((e.target.currentTime / e.target.duration) * 100)
            : 0;
          window.dataLayer.push({
            event: 'video_engagement',
            video_action: 'pause',
            video_percent_watched: pct,
            video_title: e.target.title || e.target.src || 'unknown',
            event_source_url: window.location.href
          });
        }
      }, true);

      // YouTube iframe API
      window.addEventListener('message', function(e) {
        try {
          var data = JSON.parse(e.data);
          if (data.event === 'infoDelivery' && data.info) {
            if (data.info.playerState === 1) {
              window.dataLayer.push({
                event: 'video_engagement',
                video_action: 'play',
                video_title: 'YouTube embed',
                event_source_url: window.location.href
              });
            }
            if (data.info.playerState === 2) {
              window.dataLayer.push({
                event: 'video_engagement',
                video_action: 'pause',
                video_title: 'YouTube embed',
                event_source_url: window.location.href
              });
            }
          }
        } catch(err) {}
      });
    },

    // ── 13. CONTENT COPY TRACKING ───────────────────────────
    trackContentCopy: function() {
      var fired = false;
      document.addEventListener('copy', function() {
        if (!fired) {
          fired = true;
          window.dataLayer.push({
            event: 'content_copy',
            event_source_url: window.location.href
          });
          setTimeout(function() { fired = false; }, 5000);
        }
      });
    },

    // ── 14. CHAT WIDGET OPEN TRACKING ───────────────────────
    trackChatWidget: function() {
      // Intercom
      if (window.Intercom) {
        window.Intercom('onShow', function() {
          window.dataLayer.push({
            event: 'chat_open',
            widget_type: 'intercom',
            event_source_url: window.location.href
          });
        });
      }

      // Tidio
      document.addEventListener('click', function(e) {
        var el = e.target.closest('[id*="tidio"], [class*="tidio"]');
        if (el) {
          window.dataLayer.push({
            event: 'chat_open',
            widget_type: 'tidio',
            event_source_url: window.location.href
          });
        }
      }, true);

      // Crisp
      if (window.$crisp) {
        window.$crisp.push(['on', 'chat:opened', function() {
          window.dataLayer.push({
            event: 'chat_open',
            widget_type: 'crisp',
            event_source_url: window.location.href
          });
        }]);
      }
    },

    // ── 5. INIT ──────────────────────────────────────────
    init: function() {
      this.trackForms();
      this.trackClicks();
      this.trackURLChanges();
      this.detectThankYouPage();
      this.trackCommunicationClicks();
      this.trackOutboundClicks();
      this.trackFileDownloads();
      this.trackScrollDepth();
      this.trackTimeOnPage();
      this.trackExitIntent();
      this.trackVideoEngagement();
      this.trackContentCopy();
      this.trackChatWidget();
    }
  };
  
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      THAutoTrack.init();
    });
  } else {
    THAutoTrack.init();
  }
  
})();

