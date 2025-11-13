// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_CURRENT_TIME") {
        const video = document.querySelector('video');
        
        if (video && !isNaN(video.currentTime)) {
            // Send current video time back to popup
            sendResponse({ currentTime: video.currentTime });
        } else {
            sendResponse({ currentTime: null });
        }
    }
    return true; // Keep message channel open for async response
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getChannelName") {
    // ✅ Try multiple selectors (YouTube UI updates often)
    const channel =
      document.querySelector("#channel-name a") ||
      document.querySelector("ytd-channel-name a");

    if (channel) {
      sendResponse({ channelName: channel.textContent.trim() });
    } else {
      sendResponse({ channelName: null });
    }
  }
});
chrome.runtime.onMessage.addListener((request,sender,sendResponse)=>{
  if(request.action==="getVideoTitle"){
    const channelTitle=document.querySelector("#title yt-formatted-string")
    if(channelTitle){
      sendResponse({channelTitle:channelTitle.textContent.trim()})
    }
    else{
      sendResponse({channelTitle:null})
    }
  }
})





// <------------------------------------->
// <------------Custom Div--------------->
// <------------------------------------->
function injectOverlay() {
  const videoPlayer = document.querySelector(".html5-video-player");
  if (!videoPlayer) {
    console.log("Waiting for video player...");
    setTimeout(injectOverlay, 1000);
    return;
  }
  const video = document.querySelector("video");
  if (!video) {
    console.log("Waiting for the video element...");
    setTimeout(injectOverlay, 1000);
    return;
  }

  // Wait until video metadata is loaded
  if (video.readyState >= 1) { // HAVE_ENOUGH_DATA
    checkVideoDuration(video, videoPlayer);
  } else {
    video.addEventListener("loadedmetadata", () => {
      checkVideoDuration(video, videoPlayer);
    });
  }
}


function checkVideoDuration(video, videoPlayer) {
  const existingOverlay = document.querySelector('.farhan-overlay');
  
  if (video.duration > 600) {
    // Video is longer than 10 minutes - SHOW overlay
    if (!existingOverlay) {
      showOverlay(videoPlayer);
      console.log("🎬 This video is longer than 10 minutes. Overlay shown!");
    }
  } else {
    // Video is shorter than 10 minutes - REMOVE overlay
    if (existingOverlay) {
      existingOverlay.remove();
      console.log("⏱️ Video is shorter than 10 minutes. Overlay removed!");
    } else {
      console.log("⏱️ Video is shorter than 10 minutes. No overlay to remove.");
    }
  }
}

function showOverlay(player) {
  // Remove existing overlay first (safety check)
  const existingOverlay = document.querySelector('.farhan-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  const overlay = document.createElement("div");
  overlay.className = "farhan-overlay";
  overlay.style.position = "absolute";
  overlay.style.top = "20px";
  overlay.style.right = "20px";
  overlay.style.background = "rgba(255, 0, 0, 0.8)";
  overlay.style.color = "white";
  overlay.style.padding = "10px 15px";
  overlay.style.borderRadius = "6px";
  overlay.style.zIndex = "999999";
  overlay.style.pointerEvents = "none";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.gap = "10px";

  // Image
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("assets/star1.png");
  img.style.width = "30px";
  img.style.borderRadius = "8px";

  // Text
  const text = document.createElement("span");
  text.textContent = "Farhan Khan";
  text.style.fontSize = "16px";
  text.style.fontWeight = "bold";

  
  overlay.appendChild(text);
  overlay.appendChild(img);

  player.style.position = "relative";
  player.appendChild(overlay);
}

// 🟢 Enhanced system to handle video changes automatically
function initOverlaySystem() {
  // Initial injection
  injectOverlay();

  // Observe for URL changes (YouTube navigation)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log("URL changed, checking video duration...");
      setTimeout(injectOverlay, 1000);
    }
  }).observe(document, { subtree: true, childList: true });

  // Observe for video player changes
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        const videoPlayer = document.querySelector(".html5-video-player");
        if (videoPlayer) {
          console.log("Video player changed, checking duration...");
          setTimeout(injectOverlay, 500);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // YouTube SPA navigation events
  window.addEventListener('yt-navigate-finish', () => {
    console.log("YouTube navigation finished, checking video duration...");
    setTimeout(injectOverlay, 1000);
  });

  // 🟢 NEW: Listen for video changes specifically
  const video = document.querySelector("video");
  if (video) {
    video.addEventListener('loadedmetadata', () => {
      console.log("Video metadata loaded, checking duration...");
      setTimeout(injectOverlay, 100);
    });
    
    video.addEventListener('durationchange', () => {
      console.log("Video duration changed, checking...");
      setTimeout(injectOverlay, 100);
    });
  }

  // 🟢 NEW: Periodic check to ensure overlay state is correct
  setInterval(() => {
    const video = document.querySelector("video");
    const overlay = document.querySelector('.farhan-overlay');
    
    if (video && video.duration > 0) {
      if (video.duration > 600 && !overlay) {
        console.log("Periodic check: Should show overlay");
        injectOverlay();
      } else if (video.duration <= 600 && overlay) {
        console.log("Periodic check: Should remove overlay");
        overlay.remove();
      }
    }
  }, 3000);
}

// 🟢 Start the overlay system
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOverlaySystem);
} else {
  initOverlaySystem();
}

// home page pa custom div
// ***********************


function injectCustomDiv() {
  // Select all YouTube video cards that are not yet processed
  const videoCards = document.querySelectorAll('ytd-rich-item-renderer:not(.farhan-marked)');

  videoCards.forEach(card => {
    card.classList.add('farhan-marked'); // Mark processed cards
    // Create custom div
    const customDiv = document.createElement('div');
    customDiv.className = 'farhan-custom';
    
    // Styling
    customDiv.style.position = 'absolute';
    customDiv.style.top = '10px';
    customDiv.style.right = '10px';
    customDiv.style.background = 'rgba(255, 0, 0, 0.8)';
    customDiv.style.color = 'white';
    customDiv.style.padding = '8px 12px';
    customDiv.style.borderRadius = '8px';
    customDiv.style.fontSize = '14px';
    customDiv.style.zIndex = '9999';
    customDiv.style.pointerEvents = 'none';
    customDiv.style.display = 'flex';
    customDiv.style.alignItems = 'center';
    customDiv.style.gap = '8px';

    // ✅ Image
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('assets/star1.png');
    img.style.width = '24px';
    img.style.height = '24px';
    img.style.borderRadius = '6px';

    // ✅ Text
    const text = document.createElement('span');
    text.textContent = 'Farhan Khan';
    text.style.fontSize = '13px';
    text.style.fontWeight = 'bold';

    // Append elements
    customDiv.appendChild(img);
    customDiv.appendChild(text);
    

    // Ensure the card has relative positioning
    const computedStyle = window.getComputedStyle(card);
    if (computedStyle.position === 'static' || !computedStyle.position) {
      card.style.position = 'relative';
    }

    // Append overlay to the card
    card.appendChild(customDiv);
  });
}

// 🟢 Run once when page loads
injectCustomDiv();

// 🟢 Observe new YouTube videos (when scrolling / navigating)
const observer = new MutationObserver(() => {
  injectCustomDiv();
});
observer.observe(document.body, { childList: true, subtree: true });

// 🟢 Re-check every few seconds (extra safety for slow loads)
setInterval(() => injectCustomDiv(), 3000);



// scroll bar code of youtube 
// **************************//

function initVideoCounter() {
  let lastCount = 0;

  function countVideos() {
    const videos = document.querySelectorAll('ytd-rich-item-renderer');
    const currentCount = videos.length;

    if (currentCount !== lastCount) {
      console.log(`✅ Total videos loaded: ${currentCount}`);
      lastCount = currentCount;
    }
  }

  // Initial count
  countVideos();

  // Detect DOM changes (like new videos loaded)
  const observer = new MutationObserver(() => {
    countVideos();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Scroll check as backup
  window.addEventListener('scroll', () => {
    setTimeout(countVideos, 800);
  });
}

initVideoCounter();


