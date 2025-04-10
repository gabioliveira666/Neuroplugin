chrome.runtime.onInstalled.addListener(() => {
    console.log("Extensão instalada!");
});

chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
    });
});
