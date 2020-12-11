/* global chrome, MutationObserver, Node */

// ==UserScript==
// @name         MuteAds
// @author       spddl
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

// chrome-extension://aodfehgjdhhkbcbcbmeahkhpkepennil/content.js
// url:chrome-extension://aodfehgjdhhkbcbcbmeahkhpkepennil/content.js

let timeoutID
const createEvent = targetNode => {
  checkAds()
  const observer = new MutationObserver(() => { // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
    window.clearTimeout(timeoutID)
    timeoutID = window.setTimeout(() => {
      checkAds()
    }, 1000)
  })
  observer.observe(targetNode, {
    childList: true,
    subtree: true
  })

  window.addEventListener('beforeunload', () => {
    observer.disconnect()
  })
}

const checkDiv = () => {
  setTimeout(() => {
    const CommunityPointsSummary = document.querySelectorAll('div.tw-absolute.avap-ads-container').length !== 0 ? document.querySelectorAll('div.tw-absolute.avap-ads-container')[0] : []
    if (CommunityPointsSummary instanceof Node) {
      createEvent(CommunityPointsSummary)
    } else {
      checkDiv()
    }
  }, 500)
}

if (typeof (chrome) !== 'undefined' && chrome.runtime !== 'undefined') {
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log({ msg, sender, sendResponse })
    if (msg.text === 'createEvent') {
      if (window.muteAds) {
        sendResponse(false)
      } else {
        window.muteAds = true
        checkDiv()
        sendResponse(true)
      }
    }
  })
} else {
  checkDiv()
}

const MuteIcon = 'button[data-a-target="player-mute-unmute-button"] path[d="M5 7l4.146-4.146a.5.5 0 01.854.353v13.586a.5.5 0 01-.854.353L5 13H4a2 2 0 01-2-2V9a2 2 0 012-2h1zM12 8.414L13.414 7l1.623 1.623L16.66 7l1.414 1.414-1.623 1.623 1.623 1.623-1.414 1.414-1.623-1.623-1.623 1.623L12 11.66l1.623-1.623L12 8.414z"]'
const checkMute = () => {
  if (document.querySelector(MuteIcon) === null) {
    return false // Volume Up
  } else {
    return true // Mute
  }
}

const checkAds = () => {
  if (document.querySelector('span[data-test-selector="ad-banner-default-text"]') !== null && !checkMute()) {
    document.querySelector('button[data-a-target="player-mute-unmute-button"]').click()
  } else if (checkMute()) {
    document.querySelector('button[data-a-target="player-mute-unmute-button"]').click()
  }
}
