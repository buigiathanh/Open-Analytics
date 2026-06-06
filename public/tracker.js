/**
 * Open Analytics — client-side tracker
 * Sends page views and events to the app ingest API (data-endpoint).
 *
 * Config via script tag attributes or window.OpenAnalytics before loading this file.
 *
 * data-site-key          — required site key from dashboard
 * data-endpoint          — ingest API URL (default: {APP_URL}/api/events)
 * data-domains           — comma-separated hostnames allowed to track (optional)
 * data-do-not-track      — "true" to respect Do Not Track
 * data-auto-track        — "false" to disable automatic pageviews
 *
 * Event types: 1 = pageview, 2 = page leave, 10 = custom
 */

(function (global) {
  "use strict";

  var STORAGE_VISITOR = "oa_visitor_id";
  var STORAGE_SESSION = "oa_session_id";
  var STORAGE_SESSION_AT = "oa_session_at";
  var STORAGE_VISIT = "oa_visit_id";
  var STORAGE_VISIT_AT = "oa_visit_at";
  var STORAGE_DISTINCT = "oa_distinct_id";
  var STORAGE_GEO = "oa_geo";
  var SESSION_TIMEOUT_MS = 30 * 60 * 1000;

  var EVENT = { PAGEVIEW: 1, PAGE_LEAVE: 2, CUSTOM: 10 };
  var DEVICE = { UNKNOWN: 0, DESKTOP: 1, MOBILE: 2, TABLET: 3, TV: 4 };
  var PLATFORM = {
    UNKNOWN: 0,
    WINDOWS: 1,
    MAC: 2,
    LINUX: 3,
    IOS: 4,
    ANDROID: 5,
    CHROMEOS: 6,
  };
  var BROWSER = {
    UNKNOWN: 0,
    CHROME: 1,
    FIREFOX: 2,
    SAFARI: 3,
    EDGE: 4,
    OPERA: 5,
    SAMSUNG: 6,
  };

  var BOT_UA =
    /bot|crawl|spider|slurp|preview|fetcher|archiver|httpclient|headless/i;

  function getConfig() {
    var script = document.currentScript;
    if (!script) {
      var scripts = document.getElementsByTagName("script");
      for (var i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src && scripts[i].src.indexOf("tracker.js") !== -1) {
          script = scripts[i];
          break;
        }
      }
    }
    var globalCfg = global.OpenAnalytics || {};
    var fromScript = script
      ? {
          siteKey: script.getAttribute("data-site-key"),
          endpoint: script.getAttribute("data-endpoint"),
          domains: script.getAttribute("data-domains"),
          doNotTrack: script.getAttribute("data-do-not-track") === "true",
          autoTrack: script.getAttribute("data-auto-track") !== "false",
        }
      : {};

    var domainsStr = globalCfg.domains || fromScript.domains || "";
    var domains = domainsStr
      ? domainsStr.split(",").map(function (d) {
          return d.trim().toLowerCase();
        })
      : [];

    return {
      siteKey: globalCfg.siteKey || fromScript.siteKey,
      endpoint: globalCfg.endpoint || fromScript.endpoint,
      domains: domains,
      doNotTrack:
        globalCfg.doNotTrack === true || fromScript.doNotTrack === true,
      autoTrack:
        globalCfg.autoTrack !== false && fromScript.autoTrack !== false,
    };
  }

  function hashString(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h).toString(36);
  }

  function fingerprint() {
    var parts = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
    ];
    try {
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("open-analytics", 2, 2);
      parts.push(canvas.toDataURL());
    } catch (e) {}
    return "oa_" + hashString(parts.join("|"));
  }

  function getVisitorId() {
    try {
      var stored = localStorage.getItem(STORAGE_VISITOR);
      if (stored) return stored;
    } catch (e) {}
    var id = fingerprint();
    try {
      localStorage.setItem(STORAGE_VISITOR, id);
    } catch (e) {}
    return id;
  }

  function getDistinctId() {
    try {
      return localStorage.getItem(STORAGE_DISTINCT);
    } catch (e) {
      return null;
    }
  }

  function clearVisit() {
    try {
      sessionStorage.removeItem(STORAGE_VISIT);
      sessionStorage.removeItem(STORAGE_VISIT_AT);
    } catch (e) {}
  }

  function getSessionId() {
    var now = Date.now();
    try {
      var sid = sessionStorage.getItem(STORAGE_SESSION);
      var at = parseInt(sessionStorage.getItem(STORAGE_SESSION_AT) || "0", 10);
      if (sid && now - at < SESSION_TIMEOUT_MS) {
        sessionStorage.setItem(STORAGE_SESSION_AT, String(now));
        return sid;
      }
    } catch (e) {}
    var newSid =
      "s_" + now.toString(36) + "_" + Math.random().toString(36).slice(2, 10);
    try {
      sessionStorage.setItem(STORAGE_SESSION, newSid);
      sessionStorage.setItem(STORAGE_SESSION_AT, String(now));
    } catch (e) {}
    clearVisit();
    return newSid;
  }

  function getVisitId() {
    var now = Date.now();
    getSessionId();
    try {
      var vid = sessionStorage.getItem(STORAGE_VISIT);
      var at = parseInt(sessionStorage.getItem(STORAGE_VISIT_AT) || "0", 10);
      if (vid && now - at < SESSION_TIMEOUT_MS) {
        sessionStorage.setItem(STORAGE_VISIT_AT, String(now));
        return vid;
      }
    } catch (e) {}
    var newVid =
      "v_" + now.toString(36) + "_" + Math.random().toString(36).slice(2, 10);
    try {
      sessionStorage.setItem(STORAGE_VISIT, newVid);
      sessionStorage.setItem(STORAGE_VISIT_AT, String(now));
    } catch (e) {}
    return newVid;
  }

  function isBot() {
    return BOT_UA.test(navigator.userAgent || "");
  }

  function hasDoNotTrack() {
    var dnt = navigator.doNotTrack || navigator.msDoNotTrack;
    return dnt === "1" || dnt === "yes";
  }

  function isDomainAllowed(cfg) {
    if (!cfg.domains || cfg.domains.length === 0) return true;
    var host = window.location.hostname.toLowerCase().replace(/^www\./, "");
    return cfg.domains.some(function (d) {
      return d.replace(/^www\./, "") === host;
    });
  }

  function detectDevice(ua) {
    if (/smart-tv|smarttv|googletv|appletv|hbbtv|pov_tv|netcast/i.test(ua))
      return DEVICE.TV;
    if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua))
      return DEVICE.TABLET;
    if (
      /mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)
    )
      return DEVICE.MOBILE;
    return DEVICE.DESKTOP;
  }

  function detectPlatform(ua) {
    if (/windows phone/i.test(ua)) return PLATFORM.WINDOWS;
    if (/win/i.test(ua)) return PLATFORM.WINDOWS;
    if (/macintosh|mac os x/i.test(ua) && !/iphone|ipad|ipod/i.test(ua))
      return PLATFORM.MAC;
    if (/cros/i.test(ua)) return PLATFORM.CHROMEOS;
    if (/iphone|ipad|ipod/i.test(ua)) return PLATFORM.IOS;
    if (/android/i.test(ua)) return PLATFORM.ANDROID;
    if (/linux/i.test(ua)) return PLATFORM.LINUX;
    return PLATFORM.UNKNOWN;
  }

  function detectBrowser(ua) {
    if (/samsungbrowser/i.test(ua)) return BROWSER.SAMSUNG;
    if (/edg\//i.test(ua)) return BROWSER.EDGE;
    if (/opr\/|opera/i.test(ua)) return BROWSER.OPERA;
    if (/firefox/i.test(ua)) return BROWSER.FIREFOX;
    if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) return BROWSER.CHROME;
    if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua))
      return BROWSER.SAFARI;
    return BROWSER.UNKNOWN;
  }

  function parseUtmAndClicks() {
    var params = new URLSearchParams(window.location.search);
    return {
      utm_source: slice(params.get("utm_source"), 120),
      utm_medium: slice(params.get("utm_medium"), 120),
      utm_campaign: slice(params.get("utm_campaign"), 120),
      utm_content: slice(params.get("utm_content"), 120),
      utm_term: slice(params.get("utm_term"), 120),
      gclid: slice(params.get("gclid"), 120),
      fbclid: slice(params.get("fbclid"), 120),
      msclkid: slice(params.get("msclkid"), 120),
    };
  }

  function slice(val, max) {
    if (!val) return null;
    return val.slice(0, max);
  }

  function getSource(utm) {
    if (utm.utm_source) return utm.utm_source;
    var params = new URLSearchParams(window.location.search);
    var alt = params.get("source") || params.get("ref");
    if (alt) return alt.slice(0, 120);
    var ref = document.referrer;
    if (!ref) return "direct";
    try {
      var host = new URL(ref).hostname.replace(/^www\./, "");
      if (host === window.location.hostname.replace(/^www\./, ""))
        return "direct";
      return host.slice(0, 120);
    } catch (e) {
      return "direct";
    }
  }

  var geoCache = {
    ip: null,
    lat: null,
    lng: null,
    country_code: null,
    ready: false,
  };
  var geoFetching = false;
  var lastNetworkKey = null;
  var GEO_FETCH_MS = 5000;
  var GEO_URL = "https://geo.geosurf.io/";

  function normalizeCountryCode(code) {
    if (code == null || code === "") return null;
    return String(code).toUpperCase().slice(0, 2);
  }

  function getNetworkKey() {
    var conn =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (conn) {
      return [
        conn.type || "",
        conn.effectiveType || "",
        String(conn.downlink != null ? conn.downlink : ""),
        String(conn.rtt != null ? conn.rtt : ""),
      ].join("|");
    }
    return navigator.onLine ? "online" : "offline";
  }

  function applyGeoResult(result) {
    if (!result) return false;
    var lat = result.lat != null ? Number(result.lat) : null;
    var lng = result.lng != null ? Number(result.lng) : null;
    if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return false;
    geoCache.ip = result.ip != null ? String(result.ip).slice(0, 45) : null;
    geoCache.lat = lat;
    geoCache.lng = lng;
    geoCache.country_code = normalizeCountryCode(result.country_code);
    geoCache.ready = true;
    return true;
  }

  function clearGeoStorage() {
    try {
      sessionStorage.removeItem(STORAGE_GEO);
    } catch (e) {}
  }

  function saveGeoToStorage(networkKey) {
    try {
      sessionStorage.setItem(
        STORAGE_GEO,
        JSON.stringify({
          network_key: networkKey,
          ip: geoCache.ip,
          lat: geoCache.lat,
          lng: geoCache.lng,
          country_code: geoCache.country_code,
          updated_at: Date.now(),
        })
      );
    } catch (e) {}
  }

  function loadGeoFromStorage(networkKey) {
    try {
      var raw = sessionStorage.getItem(STORAGE_GEO);
      if (!raw) return false;
      var stored = JSON.parse(raw);
      if (!stored || stored.network_key !== networkKey) return false;
      if (stored.lat == null || stored.lng == null) return false;
      geoCache.ip = stored.ip != null ? String(stored.ip).slice(0, 45) : null;
      geoCache.lat = Number(stored.lat);
      geoCache.lng = Number(stored.lng);
      geoCache.country_code = normalizeCountryCode(stored.country_code);
      geoCache.ready = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  function parseGeosurfGeo(data) {
    if (!data || typeof data !== "object") return null;
    var loc = data.loc;
    var lng = null;
    var lat = null;
    if (Array.isArray(loc) && loc.length >= 2) {
      lng = loc[0];
      lat = loc[1];
    }
    return {
      ip: data.ip != null ? data.ip : null,
      lat: lat,
      lng: lng,
      country_code: data.country != null ? data.country : null,
    };
  }

  function fetchJsonWithTimeout(url, ms) {
    return new Promise(function (resolve, reject) {
      var done = false;
      var timer = setTimeout(function () {
        if (!done) {
          done = true;
          reject(new Error("timeout"));
        }
      }, ms);
      fetch(url, { method: "GET", credentials: "omit", mode: "cors" })
        .then(function (r) {
          if (!r.ok) throw new Error("http " + r.status);
          return r.json();
        })
        .then(function (data) {
          if (!done) {
            done = true;
            clearTimeout(timer);
            resolve(data);
          }
        })
        .catch(function (err) {
          if (!done) {
            done = true;
            clearTimeout(timer);
            reject(err);
          }
        });
    });
  }

  function fetchGeoIp(cfg, callback) {
    fetchJsonWithTimeout(GEO_URL, GEO_FETCH_MS)
      .then(function (data) {
        if (applyGeoResult(parseGeosurfGeo(data))) {
          callback(geoCache);
        } else {
          geoCache.ready = true;
          callback(geoCache);
        }
      })
      .catch(function () {
        geoCache.ready = true;
        callback(geoCache);
      });
  }

  function refreshGeo(cfg, callback) {
    if (geoFetching) return;
    geoFetching = true;
    var networkKey = getNetworkKey();
    lastNetworkKey = networkKey;
    fetchGeoIp(cfg, function () {
      geoFetching = false;
      if (geoCache.lat != null && geoCache.lng != null) {
        saveGeoToStorage(networkKey);
      }
      if (callback) callback();
    });
  }

  function initGeo(cfg, callback) {
    var networkKey = getNetworkKey();
    lastNetworkKey = networkKey;
    if (loadGeoFromStorage(networkKey)) {
      if (callback) callback();
      return;
    }
    refreshGeo(cfg, callback);
  }

  var networkListenersBound = false;

  function setupNetworkListeners(cfg) {
    if (networkListenersBound) return;
    networkListenersBound = true;
    function onNetworkMaybeChanged() {
      var newKey = getNetworkKey();
      if (newKey === lastNetworkKey) return;
      lastNetworkKey = newKey;
      geoCache.ip = null;
      geoCache.lat = null;
      geoCache.lng = null;
      geoCache.country_code = null;
      geoCache.ready = false;
      clearGeoStorage();
      refreshGeo(cfg);
    }
    global.addEventListener("online", onNetworkMaybeChanged);
    var conn =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (conn && conn.addEventListener) {
      conn.addEventListener("change", onNetworkMaybeChanged);
    }
  }

  function buildPayload(cfg, eventType, extra) {
    var ua = navigator.userAgent || "";
    var utm = parseUtmAndClicks();
    var loc = window.location;
    var path = loc.pathname + loc.hash;
    var query = loc.search ? loc.search.slice(1) : null;

    var base = {
      site_key: cfg.siteKey,
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      visit_id: getVisitId(),
      event_type: eventType,
      path: path.slice(0, 500) || "/",
      page_title: document.title ? document.title.slice(0, 500) : null,
      hostname: loc.hostname ? loc.hostname.slice(0, 100) : null,
      url_query: query ? query.slice(0, 500) : null,
      referrer: document.referrer ? document.referrer.slice(0, 500) : null,
      source: getSource(utm),
      device: detectDevice(ua),
      platform: detectPlatform(ua),
      browser: detectBrowser(ua),
      country_code: geoCache.country_code,
      latitude: geoCache.lat,
      longitude: geoCache.lng,
      language: navigator.language ? navigator.language.slice(0, 35) : null,
      screen: screen.width + "x" + screen.height,
      distinct_id: getDistinctId(),
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content,
      utm_term: utm.utm_term,
      gclid: utm.gclid,
      fbclid: utm.fbclid,
      msclkid: utm.msclkid,
    };
    if (extra) {
      for (var k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k)) base[k] = extra[k];
      }
    }
    return base;
  }

  function sendToEndpoint(endpoint, payload) {
    // text/plain + no-cors: simple cross-origin POST (no preflight, no ACAO required).
    var url = String(endpoint).replace(/\/$/, "");
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(payload),
      keepalive: true,
      mode: "no-cors",
      credentials: "omit",
    })
      .then(function () {
        return { ok: true };
      })
      .catch(function () {
        return { ok: false };
      });
  }

  function buildBotPayload(cfg) {
    var ua = navigator.userAgent || "";
    var loc = window.location;
    var path = loc.pathname + loc.hash;
    return {
      site_key: cfg.siteKey,
      path: path.slice(0, 500) || "/",
      is_bot: true,
      user_agent: ua.slice(0, 500) || null,
    };
  }

  function trackBot(cfg) {
    if (!cfg.siteKey || !cfg.endpoint) return;
    if (!isDomainAllowed(cfg)) return;
    sendToEndpoint(cfg.endpoint, buildBotPayload(cfg)).catch(function () {});
  }

  function trackingDisabled(cfg) {
    if (isBot()) return false;
    if (cfg.doNotTrack && hasDoNotTrack()) return true;
    if (!isDomainAllowed(cfg)) return true;
    return false;
  }

  function humanTrackingDisabled(cfg) {
    if (isBot()) return true;
    return trackingDisabled(cfg);
  }

  function track(cfg, eventType, extra) {
    if (!cfg.siteKey || !cfg.endpoint) return;
    if (humanTrackingDisabled(cfg)) return;

    var payload = buildPayload(cfg, eventType, extra);
    sendToEndpoint(cfg.endpoint, payload).catch(function () {});
  }

  var cfg = getConfig();
  var pageStart = Date.now();
  var lastTrackedPath = null;
  var lastPageLeaveAt = 0;
  var spaListenersBound = false;

  function getPagePath() {
    return global.location.pathname + global.location.search;
  }

  function trackPageview() {
    lastTrackedPath = getPagePath();
    track(cfg, EVENT.PAGEVIEW);
  }

  function trackPageLeave() {
    var now = Date.now();
    if (now - lastPageLeaveAt < 400) return;
    lastPageLeaveAt = now;
    track(cfg, EVENT.PAGE_LEAVE, { duration_ms: now - pageStart });
  }

  function onSpaRouteChange() {
    var path = getPagePath();
    if (path === lastTrackedPath) return;
    if (lastTrackedPath != null) trackPageLeave();
    lastTrackedPath = path;
    pageStart = Date.now();
    trackPageview();
  }

  function setupSpaNavigation() {
    if (spaListenersBound) return;
    spaListenersBound = true;
    function wrapHistory(method) {
      var original = history[method];
      if (!original || original._oaWrapped) return;
      var wrapped = function () {
        var result = original.apply(this, arguments);
        onSpaRouteChange();
        return result;
      };
      wrapped._oaWrapped = true;
      history[method] = wrapped;
    }
    wrapHistory("pushState");
    wrapHistory("replaceState");
    global.addEventListener("popstate", onSpaRouteChange);
    global.addEventListener("hashchange", onSpaRouteChange);
  }

  function setupDeclarativeClicks() {
    document.addEventListener(
      "click",
      function (e) {
        var el = e.target;
        if (!el || !el.closest) return;
        var target = el.closest("[data-oa-event]");
        if (!target) return;
        var name = target.getAttribute("data-oa-event");
        if (!name) return;
        var data = {};
        var attrs = target.attributes;
        for (var i = 0; i < attrs.length; i++) {
          var attr = attrs[i];
          var m = attr.name.match(/^data-oa-event-(.+)$/);
          if (m) data[m[1].replace(/-/g, "_")] = attr.value;
        }
        global.OpenAnalytics.track(name, data);
      },
      true
    );
  }

  function startTracking() {
    setupNetworkListeners(cfg);
    setupSpaNavigation();
    setupDeclarativeClicks();
    if (cfg.autoTrack) trackPageview();
    initGeo(cfg);
  }

  if (isBot()) {
    if (cfg.autoTrack) trackBot(cfg);
  } else if (!trackingDisabled(cfg)) {
    startTracking();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") trackPageLeave();
  });
  global.addEventListener("pagehide", trackPageLeave);

  global.OpenAnalytics = global.OpenAnalytics || {};
  global.OpenAnalytics.track = function (name, props) {
    track(cfg, EVENT.CUSTOM, {
      event_name: String(name).slice(0, 50),
      source: props ? JSON.stringify(props).slice(0, 200) : null,
    });
  };
  global.OpenAnalytics.identify = function (id) {
    if (id == null) {
      try {
        localStorage.removeItem(STORAGE_DISTINCT);
      } catch (e) {}
      return;
    }
    try {
      localStorage.setItem(STORAGE_DISTINCT, String(id).slice(0, 120));
    } catch (e) {}
  };
  global.OpenAnalytics.trackPageview = trackPageview;
  global.OpenAnalytics.getVisitorId = getVisitorId;
})(typeof window !== "undefined" ? window : this);
