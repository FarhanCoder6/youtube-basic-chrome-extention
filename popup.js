const youtubeTimeInput = document.getElementById('youtubeTime');
const sendBtn = document.getElementById('sendBtn');
const channelName=document.getElementById('channelName')
const channelTitle=document.getElementById("channelTitle")

// 🟢 When popup opens, get current video time
document.addEventListener('DOMContentLoaded', () => {
    // Get current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        
        if (currentTab.url.includes('youtube.com')) {
            // Send message to content script to get current time
            chrome.tabs.sendMessage(currentTab.id, { action: "GET_CURRENT_TIME" }, (response) => {
                if (response && response.currentTime !== undefined) {
                    youtubeTimeInput.value = formatTime(response.currentTime);
                } else {
                    youtubeTimeInput.value = "No video playing";
                }
            });
        } else {
            youtubeTimeInput.value = "Not on YouTube";
        }
    });
});


document.addEventListener('DOMContentLoaded',async()=>{
    const [tab]=await chrome.tabs.query({active:true,currentWindow:true})
    if (tab.url.includes('youtube.com')){
        chrome.tabs.sendMessage(tab.id,{action:"getChannelName"},(response)=>{
            if(response&&response.channelName){
                channelName.innerHTML=`<span class="channel-Name">Channel Name:</span> ${response.channelName}`
            }
            else{
                channelName.innerHTML="No Name"
            }
        })
    }
    else{
        channelName.innerHTML=`Channel Title: Not the Youtube page found`
    }
})

document.addEventListener('DOMContentLoaded',async()=>{
    const [tab]=await chrome.tabs.query({active:true,currentWindow:true})
    if (tab.url.includes('youtube.com')){
        chrome.tabs.sendMessage(tab.id,{action:"getVideoTitle"},(response)=>{
            if(response&&response.channelTitle){
                channelTitle.innerHTML=`<span class="channel-title">Channel Title:</span> ${response.channelTitle}`
            }
            else{
                channelTitle.innerHTML="No Title"
            }
        })
    }
    else{
            channelTitle.innerHTML=`Channel Name: Not the Youtube page found`
        }
})

// 🟢 Save button functionality
sendBtn.addEventListener('click', () => {
    const timeToSave = youtubeTimeInput.value;
    
    if (timeToSave && timeToSave !== "No video playing" && timeToSave !== "Not on YouTube") {
        // Save to Chrome storage
        chrome.storage.sync.set({
             savedTime: timeToSave,
               channelName: channelName.textContent,
             channelTitle: channelTitle.textContent

            
            }, () => {
            alert(`Data add saved successfully!`);
        });
    } else {
        alert("Please wait for current time to load or play a YouTube video");
    }
});
chrome.storage.sync.get(["savedTime", "channelName", "channelTitle"], (data) => {
  if (data.savedTime) youtubeTimeInput.value = data.savedTime;
  if (data.channelName) channelName.textContent = data.channelName;
  if (data.channelTitle) channelTitle.textContent = data.channelTitle;
});

// 🟢 Format seconds to MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 🟢 Auto-focus on input
youtubeTimeInput.focus();


