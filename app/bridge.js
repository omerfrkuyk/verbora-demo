// VERBORA — what the web demo asks of the browser: sound effects, speech,
// the address bar, the link to follow. Loaded by index.html before the
// app; the app reaches it through lib/core/web_bridge_web.dart.
(function () {
  'use strict';

  var embedded =
    new URLSearchParams(location.search).has('embed') ||
    window.self !== window.top;

  // ── Sound effects ───────────────────────────────────────────────────────
  // One AudioContext for every sound. A page may only make sound after the
  // visitor touched it, so the context is created (or woken) on the first
  // press; until then playSound is silent.
  var audio = null;
  var sounds = {}; // name -> {rate, samples, buffer}

  function unlock() {
    if (!audio) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        audio = new AC();
      } catch (e) {
        return;
      }
    }
    if (audio.state !== 'running') audio.resume();
  }
  // Touch counts as "the visitor did something" when the finger lifts
  // (pointerup, touchend); a mouse when the button goes down.
  ['pointerdown', 'pointerup', 'touchend', 'keydown'].forEach(function (type) {
    window.addEventListener(type, unlock, true);
  });

  // The app makes its sounds itself, as 16-bit mono WAV (44-byte header).
  function registerSound(name, wav) {
    var view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
    var count = (wav.byteLength - 44) >> 1;
    var samples = new Float32Array(count);
    for (var i = 0; i < count; i++) {
      samples[i] = view.getInt16(44 + i * 2, true) / 32768;
    }
    sounds[name] = { rate: view.getUint32(24, true), samples: samples };
  }

  function playSound(name) {
    var s = sounds[name];
    if (!s || !audio || audio.state !== 'running') return;
    if (!s.buffer) {
      s.buffer = audio.createBuffer(1, s.samples.length, s.rate);
      s.buffer.getChannelData(0).set(s.samples);
    }
    var source = audio.createBufferSource();
    source.buffer = s.buffer;
    source.connect(audio.destination);
    source.start();
  }

  // ── Speech ──────────────────────────────────────────────────────────────
  // The browser's own voices. Some in-app browsers have none: then pickVoice
  // returns null and the app shows no speaker.
  var synth = window.speechSynthesis || null;
  var speaking = null; // kept so the browser does not drop its events
  var voiceListeners = [];

  // Apple lists joke voices and robotic ones next to the real voice of a
  // language; they come first in the alphabet.
  var AVOID =
    /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Junior|Kathy|Ralph|Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley)\b/;
  var PREFER = /^(Samantha|M[oó]nica|Anna|Thomas|Alice|Microsoft)/;

  // Android Chrome writes en_US.
  function tag(lang) {
    return (lang || '').replace('_', '-');
  }

  function voices() {
    try {
      return synth ? synth.getVoices() : [];
    } catch (e) {
      return [];
    }
  }

  function pickVoice(locale) {
    var want = locale.toLowerCase();
    var language = want.split('-')[0];
    var best = null;
    var bestScore = -1;
    voices().forEach(function (v) {
      var lang = tag(v.lang).toLowerCase();
      if (lang.split('-')[0] !== language) return;
      // A voice on the device before one that sends the word to a server
      // (Chrome's "Google" voices).
      var score =
        (lang === want ? 16 : 0) +
        (AVOID.test(v.name) ? 0 : 8) +
        (v.localService ? 4 : 0) +
        (PREFER.test(v.name) ? 2 : 0);
      if (score > bestScore) {
        best = v;
        bestScore = score;
      }
    });
    return best ? { name: best.name, lang: best.lang } : null;
  }

  function onVoicesChanged(listener) {
    voiceListeners.push(listener);
  }

  function voicesChanged() {
    voiceListeners.forEach(function (l) {
      l();
    });
  }

  if (synth) {
    // Chrome hands out its list late and says so; Safari may fill it in
    // without a word, so look again for a few seconds.
    if (synth.addEventListener) {
      synth.addEventListener('voiceschanged', voicesChanged);
    }
    var known = voices().length;
    var looks = 0;
    var timer = setInterval(function () {
      var now = voices().length;
      if (now !== known) {
        known = now;
        voicesChanged();
      }
      if (++looks >= 20) clearInterval(timer);
    }, 250);
  }

  function speak(text, voiceName, lang, rate, onDone) {
    var voice = null;
    voices().forEach(function (v) {
      if (!voice && v.name === voiceName && v.lang === lang) voice = v;
    });
    if (!voice) return false;

    var u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = tag(voice.lang);
    u.rate = rate;
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      if (speaking === u) speaking = null;
      onDone();
    }
    u.onend = finish;
    u.onerror = finish;
    // A browser that reports neither still lets the speaker go idle.
    setTimeout(finish, 8000);

    var busy = synth.speaking || synth.pending;
    if (busy) synth.cancel();
    speaking = u;
    if (busy) {
      // Chrome loses a word queued in the same turn as cancel().
      setTimeout(function () {
        if (speaking === u) synth.speak(u);
      }, 60);
    } else {
      synth.speak(u);
    }
    return true;
  }

  function stopSpeaking() {
    speaking = null;
    if (synth) synth.cancel();
  }

  // ── The page ────────────────────────────────────────────────────────────
  function stripQueryParam(name) {
    var url = new URL(location.href);
    if (!url.searchParams.has(name)) return;
    url.searchParams.delete(name);
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  }

  // The Instagram account to follow (web/site.js), as a plain link: nothing
  // goes to Instagram unless the visitor follows it. Empty if no account is
  // named, or the name is not one Instagram could have.
  var account = String((window.verboraSite || {}).instagram || '').replace(/^@/, '');
  var followUrl = /^[A-Za-z0-9._]{1,30}$/.test(account)
    ? 'https://www.instagram.com/' + account + '/'
    : '';

  // Opens the account in a new tab (on a phone: in the Instagram app).
  function openFollow() {
    if (!followUrl) return false;
    var link = document.createElement('a');
    link.href = followUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  }

  window.verboraBridge = {
    embedded: embedded,
    stripQueryParam: stripQueryParam,
    reload: function () {
      location.reload();
    },
    followUrl: followUrl,
    openFollow: openFollow,
    registerSound: registerSound,
    playSound: playSound,
    pickVoice: pickVoice,
    onVoicesChanged: onVoicesChanged,
    speak: speak,
    stopSpeaking: stopSpeaking,
  };
})();
