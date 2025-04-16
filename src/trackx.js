(function () {
    // === UTM Getter ===
    function getUTM(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param) || null;
    }
  
    // === Device Info ===
    function getDeviceType() {
      const ua = navigator.userAgent.toLowerCase();
      if (/mobile|android|iphone|ipad|phone/i.test(ua)) return "Mobile";
      if (/tablet|ipad/i.test(ua)) return "Tablet";
      return "Desktop";
    }
  
    function getBrowserInfo() {
      const ua = navigator.userAgent;
      if (/chrome|crios|crmo/i.test(ua)) return { name: "Chrome", version: ua.match(/chrome\/(\d+)/i)?.[1] || "Unknown" };
      if (/firefox|fxios/i.test(ua)) return { name: "Firefox", version: ua.match(/firefox\/(\d+)/i)?.[1] || "Unknown" };
      if (/safari/i.test(ua) && !/chrome/i.test(ua)) return { name: "Safari", version: ua.match(/version\/(\d+)/i)?.[1] || "Unknown" };
      if (/msie|trident/i.test(ua)) return { name: "IE", version: ua.match(/(?:msie |rv:)(\d+)/i)?.[1] || "Unknown" };
      if (/edg/i.test(ua)) return { name: "Edge", version: ua.match(/edg\/(\d+)/i)?.[1] || "Unknown" };
      return { name: "Unknown", version: "Unknown" };
    }
  
    function getOSInfo() {
      const ua = navigator.userAgent.toLowerCase();
      if (/windows/i.test(ua)) return { name: "Windows", version: /windows nt ([\d.]+)/i.exec(ua)?.[1] || "Unknown" };
      if (/mac os/i.test(ua)) return { name: "macOS", version: /mac os x ([\d._]+)/i.exec(ua)?.[1]?.replace(/_/g, ".") || "Unknown" };
      if (/android/i.test(ua)) return { name: "Android", version: /android ([\d.]+)/i.exec(ua)?.[1] || "Unknown" };
      if (/iphone|ipad|ios/i.test(ua)) return { name: "iOS", version: /os ([\d._]+)/i.exec(ua)?.[1]?.replace(/_/g, ".") || "Unknown" };
      if (/linux/i.test(ua)) return { name: "Linux", version: "Unknown" };
      return { name: "Unknown", version: "Unknown" };
    }
  
    function getPageLoadTime() {
      const timing = performance.timing;
      return (timing.loadEventEnd - timing.navigationStart) / 1000;
    }
  
    function isEntryPage() {
      return window.location.pathname === '/';
    }
  
    function isExitPage() {
      return document.visibilityState === 'hidden';
    }
  
    async function getIpAddress() {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || "Unknown";
      } catch (err) {
        return "Unknown";
      }
    }
  
    // === Main Tracking Function ===
    async function trackEvent(eventType, additionalData = {}) {
      const sessionId = localStorage.getItem("sessionId") || crypto.randomUUID();
      localStorage.setItem("sessionId", sessionId);
  
      const anonymousId = localStorage.getItem("anonymousId") || crypto.randomUUID();
      localStorage.setItem("anonymousId", anonymousId);
  
      const ipAddress = await getIpAddress();
  
      const browser = getBrowserInfo();
      const os = getOSInfo();
  
      const eventData = {
        event_id: crypto.randomUUID(),
        event_type: eventType,
        event_timestamp: new Date().toISOString(),
        session_id: sessionId,
        user_id: localStorage.getItem("userId") || null,
        anonymous_id: anonymousId,
        project_id: "your-project-id",
        page_url: window.location.href,
        page_title: document.title,
        referrer_url: document.referrer || null,
        device_type: getDeviceType(),
        browser: browser.name,
        browser_version: browser.version,
        os: os.name,
        os_version: os.version,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        page_load_time: getPageLoadTime(),
        entry_page: isEntryPage(),
        exit_page: isExitPage(),
        language: navigator.language,
        ip_address: ipAddress,
        location_country: "Fetching...",
        location_city: "Fetching...",
        utm_source: getUTM("utm_source"),
        utm_medium: getUTM("utm_medium"),
        utm_campaign: getUTM("utm_campaign"),
        utm_term: getUTM("utm_term"),
        utm_content: getUTM("utm_content"),
        ...additionalData,
      };
  
      console.log("Tracking Event:", eventData);
  
      fetch("https://69db-106-222-197-88.ngrok-free.app/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      })
        .then((res) => res.json())
        .then((data) => console.log("Event Tracked:", data))
        .catch((err) => console.error("Tracking Error:", err));
    }
  
    // === Auto Bind Default Events ===
    document.addEventListener("click", (e) => {
      if (e.target.closest("button, a")) {
        trackEvent("click", {
          element: e.target.tagName,
          element_text: e.target.innerText,
        });
      }
    });
  
    document.addEventListener("submit", (e) => {
      trackEvent("form_submit", {
        form_id: e.target.id || "unknown-form",
      });
    });
  
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.matches("input[type='search']")) {
        trackEvent("search", {
          query: e.target.value,
        });
      }
    });
  
    document.getElementById("start-chat")?.addEventListener("click", () => {
      trackEvent("chat_start", { chat_with: "support" });
    });
  
    document.getElementById("end-chat")?.addEventListener("click", () => {
      trackEvent("chat_end", { chat_duration: 120 });
    });
  
    // Expose globally if needed
    window.TrackX = {
      trackEvent,
    };
  })();
  