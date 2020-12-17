/* global chrome, MutationObserver, Node */

// ==UserScript==
// @name         MuteAds
// @author       spddl
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

const MuteIcon = 'button[data-a-target="player-mute-unmute-button"] path[d="M5 7l4.146-4.146a.5.5 0 01.854.353v13.586a.5.5 0 01-.854.353L5 13H4a2 2 0 01-2-2V9a2 2 0 012-2h1zM12 8.414L13.414 7l1.623 1.623L16.66 7l1.414 1.414-1.623 1.623 1.623 1.623-1.414 1.414-1.623-1.623-1.623 1.623L12 11.66l1.623-1.623L12 8.414z"]'
const checkMute = () => {
  if (document.querySelector(MuteIcon) === null) {
    return false // Volume Up
  } else {
    return true // Mute
  }
}

const checkAds = (targetNode) => {
  if (targetNode.querySelector('div[data-test-selector="sad-overlay"]') === null) {
    if (AdsPlaying && checkMute()) {
      document.querySelector('button[data-a-target="player-mute-unmute-button"]').click()
      AdsPlaying = false
    }
  } else {
    if (!AdsPlaying && !checkMute()) {
      document.querySelector('button[data-a-target="player-mute-unmute-button"]').click()
      AdsPlaying = true
    }
  }
}

let AdsPlaying
const createEvent = targetNode => {
  checkAds(targetNode)
  const observer = new MutationObserver(async () => { // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
    checkAds(targetNode)
  })
  observer.observe(targetNode, {
    childList: true,
    subtree: true
  })

  window.addEventListener('beforeunload', () => {
    observer.disconnect()
  })
}

const checkDiv = (delay = 0) => {
  setTimeout(() => {
    const defaultPlayer = document.querySelectorAll('div.video-player__overlay').length !== 0 ? document.querySelectorAll('div.video-player__overlay')[0] : []
    if (defaultPlayer instanceof Node) {
      createEvent(defaultPlayer)
    } else {
      checkDiv(delay + 100 > 1000 ? 1000 : delay + 100)
    }
  }, delay)
}

if (typeof (chrome) !== 'undefined' && chrome.runtime !== 'undefined') {
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
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
