/**
 * Content script for the AntiFeed extension. This script is injected into the pages of the supported platforms
 * and is responsible for blocking the appropriate elements based on the user's settings.
 */

// Creates a single stylesheet for this extension and adds it alongside any others
const antifeedStyleSheet = new CSSStyleSheet();
document.adoptedStyleSheets = [...document.adoptedStyleSheets, antifeedStyleSheet];

// Gets the settings from storage
chrome.storage.sync.get(['settings'], (data) => {
  // Gets the domain name from the URL
  var domain = window.location.hostname;
  var path = window.location.pathname;

  // Clears any previously inserted rules
  while (antifeedStyleSheet.cssRules.length > 0) {
    antifeedStyleSheet.deleteRule(0);
  }

  // Goes through the platforms, blocking the appropriate elements
  /** Facebook */
  if (domain.includes("facebook.com") && data.settings.Facebook.block) {
    /** If on the friends page, add friends to whitelist */
    if (path.includes("/friends/")) {
      const updateWLButton = document.createElement("div");
      updateWLButton.id = "antifeed-button-fb";
      updateWLButton.className = "xdwrcjd x2fvf9 x1xmf6yo x1w6jkce xusnbm3";
      document.getElementsByClassName("x6s0dn4 x78zum5 x1iyjqo2")[0].appendChild(updateWLButton);
    }

    /** Removes the bad elements */
    // Gets rid of advertisements
    antifeedStyleSheet.insertRule('div[class="x1y1aw1k"] > div > div[data-visualcompletion="ignore-late-mutation"] { display: none !important; }', antifeedStyleSheet.cssRules.length);

    // Main Feed
    if (data.settings.Facebook.feeds["Main Feed"]) {
      // Removes posts elements
      antifeedStyleSheet.insertRule('div[class="x78zum5 xdt5ytf"], div[class="x1xzczws"] { display: none !important; }', antifeedStyleSheet.cssRules.length);

      // Remove endcard element
      const endcardElement = document.getElementsByClassName('div.x1xzczws')[0];
      if (endcardElement) {
        endcardElement.remove();
      }
    }

    // Reels
    if (data.settings.Facebook.feeds["Reels"]) {
      // Removes the reels button from the home toolbar
      antifeedStyleSheet.insertRule('li:has(span):has(div[class="x6s0dn4 x78zum5 x1s65kcs x1n2onr6"]):has(a[aria-label="Reels"]) { display: none !important; }', antifeedStyleSheet.cssRules.length);
      antifeedStyleSheet.insertRule('li:has(span):has(div):has(div):has(div):has(a[href*="/reel"]) { display: none !important }', antifeedStyleSheet.cssRules.length);

      // Removes the reels shelf on the home feed
      antifeedStyleSheet.insertRule('div[class="x6ikm8r x10wlt62"] { display: none !important; }', antifeedStyleSheet.cssRules.length);
      
      // Removes the reels themselves
      if (path.includes("/reel")) {
        antifeedStyleSheet.insertRule('div.x78zum5.x5yr21d.xl56j7k.x1n2onr6.xh8yej3 { display: none !important; }', antifeedStyleSheet.cssRules.length);
      }
    }

    // Stories
    if (data.settings.Facebook.feeds["Stories"]) {
      antifeedStyleSheet.insertRule('div.x193iq5w.xgmub6v.x1ceravr.x1v0nzow { display: none !important; }', antifeedStyleSheet.cssRules.length);
    }

    // Marketplace
    if (data.settings.Facebook.feeds["Marketplace"]) {
      // Removes the marketplace icon on the home page
      antifeedStyleSheet.insertRule('li:has(span):has(div[class="x6s0dn4 x78zum5 x1s65kcs x1n2onr6"]):has(a[aria-label="Marketplace"]) { display: none !important; }', antifeedStyleSheet.cssRules.length);
      antifeedStyleSheet.insertRule('li:has(span):has(div):has(div):has(div):has(a[href*="/marketplace"]) { display: none !important }', antifeedStyleSheet.cssRules.length);

      // Removes marketplace items
      if (path.includes("/marketplace")) {
        antifeedStyleSheet.insertRule('div.x9f619.x78zum5.x1r8uery.xdt5ytf.x1iyjqo2.xs83m0k.x135b78x.x11lfxj5.xexx8yu.x18d9i69.xnpuxes.x1cjf5ee.x17dddeq { display: none !important; }', antifeedStyleSheet.cssRules.length);
      }
    }
  } else if (domain.includes("instagram.com") && data.settings.Instagram.block) {
    // Main Feed
    if (data.settings.Instagram.feeds["Main Feed"]) {
      // Aggressively removes posts elements from non-friends
      antifeedStyleSheet.insertRule('article > div[class="x78zum5 xdt5ytf x5yr21d xa1mljc xh8yej3 x1bs97v6 x1q0q8m5 x11aubdm xnc8uc2 x1qhh985"] { display: none !important; }', antifeedStyleSheet.cssRules.length);

      // Removes loading wheel
      const loadingWheel = document.querySelector('div.x1qjc9v5.x972fbf.x10w94by.x1qhh985.x14e42zd.x9f619.x78zum5.xdt5ytf.x2lah0s.xln7xf2.xk390pu.xsdox4t.x14z9mp.xat24cr.x1lziwak.x1tfhste.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x1n2onr6.x11njtxf');
      if (loadingWheel) {
        loadingWheel.remove();
      }
    }

    // Reels
    if (data.settings.Instagram.feeds["Reels"]) {
      // Blocks the reels button on the homefeed
      antifeedStyleSheet.insertRule('a[href="/reels/"] { display: none !important; }', antifeedStyleSheet.cssRules.length);
      const reelsButton = document.querySelectorAll('a[href="/reels/"]');
      if (reelsButton) {
        reelsButton.remove();
      }
      
      if (path.includes("/reels")) {
        // Blocks reels themselves
        antifeedStyleSheet.insertRule('div.x1qjc9v5.x9f619.x78zum5.xg7h5cd.x1mfogq2.xsfy40s.x1bhewko.xgv127d.xh8yej3.xl56j7k { display: none !important; }', antifeedStyleSheet.cssRules.length);
      }
    }

    // Stories
    if (data.settings.Instagram.feeds["Stories"]) {
      antifeedStyleSheet.insertRule('div.x1qjc9v5.x78zum5.x1q0g3np.xl56j7k.xh8yej3 { display: none !important; }', antifeedStyleSheet.cssRules.length);
    }

    // Explore
    if (data.settings.Instagram.feeds["Explore"] && path.includes("/explore")) {
      antifeedStyleSheet.insertRule('div.html-div.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x9f619.xjbqb8w.x1lliihq.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.x1n2onr6.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1oa3qoh { display: none !important; }', antifeedStyleSheet.cssRules.length);
    }
  } else if (domain.includes("linkedin.com") && data.settings.Linkedin.block) {
    // Removes advertisements
    antifeedStyleSheet.insertRule('section.ad-banner-container, div._3767aa75._310aeaef.c42a767a { display: none !important; }', antifeedStyleSheet.cssRules.length);
    const adBanners = document.querySelectorAll('section.ad-banner-container, div._3767aa75._310aeaef.c42a767a');
    if (adBanners) {
      adBanners.forEach(banner => banner.remove());
    }
    
    // Main Feed
    if (data.settings.Linkedin.feeds["Main Feed"] && path.includes("/feed")) {
      // Removes posts elements
      antifeedStyleSheet.insertRule('div[class="_8a5a9952"] > div._3767aa75._310aeaef._8b0c9d66, div._91bc9763.f0ce467e > button.f7a41b1a._56d5d0a4._0965d7a4._8661433d._1b69bc9e._5e152a36.ae12f788._4d5d92d1._4c318dc5.ce9b4e4a.e92911b6.acd246fe.ed82b20b.a5921d00 { display: none !important; }', antifeedStyleSheet.cssRules.length);
    
      // Removes load more button
      const loadMoreButton = document.querySelector('div._91bc9763.f0ce467e > button.f7a41b1a._56d5d0a4._0965d7a4._8661433d._1b69bc9e._5e152a36.ae12f788._4d5d92d1._4c318dc5.ce9b4e4a.e92911b6.acd246fe.ed82b20b.a5921d00');
      if (loadMoreButton) {
        loadMoreButton.remove();
      }
    }

    // News Feed
    if (data.settings.Linkedin.feeds["LinkedIn News"] && path.includes("/feed")) {
      antifeedStyleSheet.insertRule('div.cece70c4._46e18102._10200235.f8d593db._561d6991._008ac792.a0acfc66._34031b43._3df979da.ef615a28._4fd88664._3fa8b346.ed82b20b { display: none !important; }', antifeedStyleSheet.cssRules.length);
      const newsFeed = document.querySelector('div.cece70c4._46e18102._10200235.f8d593db._561d6991._008ac792.a0acfc66._34031b43._3df979da.ef615a28._4fd88664._3fa8b346.ed82b20b');
      if (newsFeed) {
        newsFeed.remove();
      }
    }
  } else if (domain.includes("reddit.com") && data.settings.Reddit.block) {
    console.log(window.location.search);

    // Main Feed
    if (data.settings.Reddit.feeds["Main Feed"] && !window.location.search.includes("feed=news")) {
      // Removes posts elements
      antifeedStyleSheet.insertRule('article[class="w-full m-0"], shreddit-ad-post, hr.border-0.border-b-sm.border-solid.border-b-neutral-border-weak, shreddit-feed-page-loading { display: none !important; }', antifeedStyleSheet.cssRules.length);
    
      // Removes loading icon
      const loadingIcons = document.querySelectorAll('shreddit-feed-page-loading');
      if (loadingIcons) {
        loadingIcons.forEach(icon => icon.remove());
      }
    }

    // Reddit News Feed
    if (data.settings.Reddit.feeds["News Feed"] && window.location.search.includes("feed=news")) {
      // Removes posts elements
      antifeedStyleSheet.insertRule('article[class="w-full m-0"], shreddit-ad-post, hr.border-0.border-b-sm.border-solid.border-b-neutral-border-weak, shreddit-feed-page-loading { display: none !important; }', antifeedStyleSheet.cssRules.length);
    
      // Removes loading icon
      const loadingIcons = document.querySelectorAll('shreddit-feed-page-loading');
      if (loadingIcons) {
        loadingIcons.forEach(icon => icon.remove());
      }
    }

    // Games on Reddit
    if (data.settings.Reddit.feeds["Games on Reddit"]) {
      // Games on Reddit section
      antifeedStyleSheet.insertRule('faceplate-tracker[noun="games_drawer"], faceplate-tracker[noun="games_drawer"] + hr { display: none !important; }', antifeedStyleSheet.cssRules.length);
    }
  } else if (domain.includes("threads.com") && data.settings.Threads.block) {
    // Main Feed
    if (data.settings.Threads.feeds["Main Feed"]) {
      // Removes posts elements
      antifeedStyleSheet.insertRule('div[class="x78zum5 xdt5ytf"], div.x78zum5.xl56j7k.xwib8y2.xljfnv1.xh8yej3 { display: none !important; }', antifeedStyleSheet.cssRules.length);
    
      // Removes scroll wheel
      const scrollWheel = document.querySelector('div.x78zum5.xl56j7k.xwib8y2.xljfnv1.xh8yej3');
      if (scrollWheel) {
        scrollWheel.remove();
      }
    }
  } else if (domain.includes("x.com") && data.settings["Twitter/X"].block) {
    // Removes advertisements
    antifeedStyleSheet.insertRule('div[data-testid="placementTracking"], aside[aria-label="Subscribe to Premium"] { display: none !important; }', antifeedStyleSheet.cssRules.length);

    // Main Feed
    if (data.settings["Twitter/X"].feeds["Main Feed"] && path === "/home") {        
      // Removes posts elements
      antifeedStyleSheet.insertRule('div.css-175oi2r[data-testid="cellInnerDiv"] { display: none !important; }', antifeedStyleSheet.cssRules.length);
      // Removes loading icon
      /*const loadingIcons = document.querySelectorAll('div[data-testid="cellInnerDiv"] > div > div > div > div > div > div > div > div[data-testid="tweet"]');
      if (loadingIcons) {
        loadingIcons.forEach(icon => icon.remove());
      }*/
    }

    // Today's News Widget
    if (data.settings["Twitter/X"].feeds["Today's News Widget"]) {
      antifeedStyleSheet.insertRule('div[class="css-175oi2r r-13awgt0"] { display: none !important; }', antifeedStyleSheet.cssRules.length);
      const newsWidgets = document.querySelectorAll('div[class="css-175oi2r r-13awgt0"]');
      if (newsWidgets) {
        newsWidgets.forEach(widget => widget.remove());
      }
    }

    // What's Happening Widget
    if (data.settings["Twitter/X"].feeds["What's Happening Widget"]) {
      antifeedStyleSheet.insertRule('div[aria-label="Timeline: Trending now"] { display: none !important; }', antifeedStyleSheet.cssRules.length);
      const happeningWidgets = document.querySelectorAll('div[aria-label="Timeline: Trending now"]');
      if (happeningWidgets) {
        happeningWidgets.forEach(widget => widget.remove());
      }
    }
  } else if (domain.includes("youtube.com") && data.settings.Youtube.block) {
    // Removes advertisements
    antifeedStyleSheet.insertRule('div#player-ads { display: none !important; }', antifeedStyleSheet.cssRules.length);
    var playerAds = document.getElementById('player-ads');
    if (playerAds) {
      playerAds.remove();
    }


    // Homepage
    if (data.settings.Youtube.feeds["Homepage"] && path === "/") {
      // Removes video previews
      antifeedStyleSheet.insertRule('ytd-rich-item-renderer[class="style-scope ytd-rich-grid-renderer"], ytd-rich-section-renderer[class="style-scope ytd-rich-grid-renderer"] { display: none !important; }', antifeedStyleSheet.cssRules.length);

      // Removes loader
      //const loadingIcons = document.querySelectorAll('ytd-continuation-item-renderer[class="style-scope ytd-rich-grid-renderer"]');
      //const loadingIcons = document.querySelectorAll('ytd-refresh#refresh');
      const loadingIcons = document.querySelectorAll('div#reload-content');
      if (loadingIcons) {
        loadingIcons.forEach(icon => icon.remove());
      }
    }

    // Shorts
    if (data.settings.Youtube.feeds["Shorts"]) {
      // Removes shorts previews
      antifeedStyleSheet.insertRule('ytd-reel-item-renderer[class="style-scope ytd-reel-carousel-item-renderer"] { display: none !important; }', antifeedStyleSheet.cssRules.length);
    
      // Removes shorts button from the homepage
      antifeedStyleSheet.insertRule('ytd-mini-guide-entry-renderer:has(> a[title="Shorts"]) { display: none !important; }', antifeedStyleSheet.cssRules.length);
      antifeedStyleSheet.insertRule('ytd-guide-entry-renderer:has(> a[title="Shorts"]) { display: none !important; }', antifeedStyleSheet.cssRules.length);

      // Removes shorts from shorts page
      if (path.includes("/shorts")) {
        antifeedStyleSheet.insertRule('div.reel-video-in-sequence-new.style-scope.ytd-shorts { display: none !important; }', antifeedStyleSheet.cssRules.length);
      }

      // Removes shorts shelf from recommended videos
      if (path.includes("/watch")) {
        antifeedStyleSheet.insertRule('ytd-reel-shelf-renderer { display: none !important }, antifeedStyleSheet.cssRules.length');
      }
    }

    // Sidebar Suggested Videos
    if (data.settings.Youtube.feeds["Sidebar Suggested Videos"] && path.includes("/watch")) {
      // Removes suggested videos in the sidebar
      antifeedStyleSheet.insertRule('yt-lockup-view-model[class="ytd-item-section-renderer lockup yt-lockup-view-model--wrapper"] { display: none !important; }', antifeedStyleSheet.cssRules.length);
    
      // Removes spinner container
      antifeedStyleSheet.insertRule('#spinner-container { display: none !important; }', antifeedStyleSheet.cssRules.length);
      antifeedStyleSheet.insertRule('#continuations { display: none !important; }', antifeedStyleSheet.cssRules.length);
    
      var spinnerContainer = document.getElementById('spinner-container');
      if (spinnerContainer) {
        spinnerContainer.remove();
      }

      var continuations = document.getElementById('continuations');
      if (continuations) {
        continuations.remove();
      }
    }

    // Endcard Suggested Videos
    if (data.settings.Youtube.feeds["Endcard Suggested Videos"] && path.includes("/watch")) {
      antifeedStyleSheet.insertRule('a[class="ytp-modern-videowall-still ytp-suggestion-set"] { display: none !important; }', antifeedStyleSheet.cssRules.length);
    }
  }
});