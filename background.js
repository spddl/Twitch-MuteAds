/* global window, chrome */

chrome.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.indexOf('https://www.twitch.tv/') === 0) {
    chrome.tabs.sendMessage(tab.id, { text: 'createEvent' }, () => { })
  }
})
