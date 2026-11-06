import { HotspotProject } from '../types/hotspot';

export function generateStandaloneHtml(project: HotspotProject): string {
  const serializedProject = JSON.stringify(project);
  const fontSize = project.balloonFontSize || 15;
  const showPlayBtn = Boolean(project.showPlayButtonInBalloon);
  const showHoverTooltip = Boolean(project.showHoverTooltip);
  const format = project.imageFormat || 'free';

  let formatCss = '';
  if (format === '16:9') {
    formatCss = 'aspect-ratio: 16/9; width: 920px; max-width: 90vw; max-height: 76vh;';
  } else if (format === '9:16') {
    formatCss = 'aspect-ratio: 9/16; height: 74vh; max-width: 440px;';
  } else if (format === 'custom') {
    formatCss = `width: ${project.customWidth || 1200}px; height: ${project.customHeight || 800}px; max-width: 92vw; max-height: 76vh;`;
  } else {
    formatCss = 'max-width: 100%; max-height: 76vh;';
  }

  // Generate inner HTML & CSS for the Shadow DOM
  const innerCss = `
    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
      line-height: normal;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    .embed-container {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px 0;
      background: transparent;
    }
    .canvas-wrapper {
      position: relative;
      display: inline-block;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      border: none;
      overflow: visible;
      max-width: 100%;
      height: auto;
      ${formatCss}
    }
    .main-image {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 16px;
      object-fit: ${format === 'free' ? 'contain' : 'cover'};
    }
    .hotspot-pin {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #4f46e5;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 12px;
      cursor: pointer;
      border: 2px solid #ffffff;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 20;
    }
    .hotspot-pin:hover {
      transform: translate(-50%, -50%) scale(1.1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
    }
    .pulse-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: inherit;
      opacity: 0.6;
      animation: pulse 2s infinite ease-out;
      pointer-events: none;
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    .hover-tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.95);
      color: #ffffff;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      display: none;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 50;
    }
    .hotspot-pin:hover .hover-tooltip {
      display: ${showHoverTooltip ? 'block' : 'none'};
    }
    .hotspot-pin.active {
      z-index: 999 !important;
    }
    .speech-balloon {
      position: absolute;
      z-index: 1000 !important;
      background: #ffffff;
      color: #0f172a;
      padding: 10px 14px;
      border-radius: 14px;
      box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05);
      width: max-content;
      max-width: min(90vw, 480px);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      animation: balloonIn 0.15s ease-out;
      pointer-events: auto;
    }
    @keyframes balloonIn {
      from { opacity: 0; transform: scale(0.92); }
      to { opacity: 1; transform: scale(1); }
    }
    .speech-balloon.place-top {
      bottom: 100%;
      margin-bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
    }
    .speech-balloon.place-bottom {
      top: 100%;
      margin-top: 12px;
      left: 50%;
      transform: translateX(-50%);
    }
    .balloon-stem {
      position: absolute;
      width: 10px;
      height: 10px;
      background: #ffffff;
      transform: rotate(45deg);
      left: calc(50% - 5px);
    }
    .speech-balloon.place-top .balloon-stem {
      bottom: -5px;
    }
    .speech-balloon.place-bottom .balloon-stem {
      top: -5px;
    }
    .balloon-body {
      display: flex;
      flex-direction: column;
      cursor: pointer;
      min-width: 0;
      flex: 1;
    }
    .balloon-main-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .balloon-image-container {
      max-width: 260px;
      max-height: 200px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.08);
      position: relative;
    }
    .balloon-image-container img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      border-radius: 12px;
      max-height: 190px;
    }
    .balloon-image-play {
      position: absolute;
      bottom: 6px;
      right: 6px;
      background: rgba(15, 23, 42, 0.85);
      color: #ffffff;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .balloon-play-btn {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: transparent;
      color: #94a3b8;
      border: 1px solid #cbd5e1;
      display: ${showPlayBtn && !project.disableGlobalAudio ? 'flex' : 'none'};
      align-items: center;
      justify-content: center;
      font-size: 9px;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.15s;
    }
    .balloon-play-btn:hover {
      background: #f1f5f9;
      color: #475569;
      border-color: #94a3b8;
    }
    .balloon-word {
      font-size: ${fontSize}px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
      line-height: 1.25;
      word-break: break-word;
    }
    .balloon-word:hover {
      color: #4f46e5;
    }
    .balloon-sec {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
      margin-top: 4px;
      line-height: 1.35;
      white-space: normal;
      word-break: break-word;
      overflow-wrap: break-word;
      text-align: left;
      max-width: 100%;
    }
    .balloon-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      padding: 3px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s;
    }
    .balloon-close:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
  `;

  return `<!-- INÍCIO DO EMBED HOTSPOT INTERATIVO (SANDBOX / SHADOW DOM ISOLADO) -->
<hotspot-widget></hotspot-widget>
<script>
(function() {
  if (customElements.get('hotspot-widget')) return;

  class HotspotWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      const projectData = ${serializedProject};
      let currentLang = projectData.defaultLanguage || 'pt';
      let selectedHotspotId = null;
      let currentAudio = null;

      const style = document.createElement('style');
      style.textContent = ${JSON.stringify(innerCss)};

      const container = document.createElement('div');
      container.className = 'embed-container';
      container.innerHTML = \`
        <div class="canvas-wrapper" id="canvasWrapper">
          <img src="\${${JSON.stringify(escapeHtml(project.imageUrl))}}" alt="Imagem Interativa" class="main-image" id="mainImage">
          <div id="hotspotsLayer"></div>
        </div>
      \`;

      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(container);

      const hotspotsLayer = this.shadowRoot.querySelector('#hotspotsLayer');
      const canvasWrapper = this.shadowRoot.querySelector('#canvasWrapper');

      // Click on canvas / image outside hotspot closes active balloon
      canvasWrapper.addEventListener('click', function(e) {
        if (selectedHotspotId) {
          closeBalloon();
        }
      });

      const onAudioEnd = (hs) => {
        if (hs && hs.contentType === 'image' && hs.syncImageAudioClose && selectedHotspotId === hs.id) {
          closeBalloon();
        }
      };

      const playAudio = (hotspot) => {
        if (hotspot.noAudio || projectData.disableGlobalAudio) return;
        const primaryText = (hotspot.translations && hotspot.translations[currentLang]) || hotspot.text || '';
        const speechLang = hotspot.wordLanguage || currentLang;
        const readSec = hotspot.readSecondaryText ?? projectData.readSecondaryTextDefault;
        const textToSpeak = (readSec && hotspot.secondaryText && hotspot.secondaryText.trim())
          ? (primaryText + '. ' + hotspot.secondaryText.trim())
          : primaryText;

        if (currentAudio) {
          currentAudio.pause();
          currentAudio = null;
        }
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }

        const allowTTS = projectData.enableSpeechSynthesis !== false;

        if (hotspot.useSystemSpeech || !hotspot.audioUrl) {
          if (allowTTS) speakSystem(textToSpeak, speechLang, hotspot);
          return;
        }

        try {
          const audio = new Audio(hotspot.audioUrl);
          currentAudio = audio;
          audio.addEventListener('ended', function() {
            onAudioEnd(hotspot);
          });
          audio.play().catch(function() {
            if (allowTTS) speakSystem(textToSpeak, speechLang, hotspot);
          });
        } catch (err) {
          if (allowTTS) speakSystem(textToSpeak, speechLang, hotspot);
        }
      };

      const speakSystem = (text, lang, hotspot) => {
        if (!('speechSynthesis' in window) || !text) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'en' ? 'en-US' : 'pt-BR';
        utterance.rate = 0.95;
        utterance.onend = function() {
          if (hotspot) onAudioEnd(hotspot);
        };
        window.speechSynthesis.speak(utterance);
      };

      const selectHotspot = (id) => {
        selectedHotspotId = id;
        renderHotspots();
        const hs = projectData.hotspots.find(function(h) { return h.id === id; });
        if (hs && projectData.audioAutoPlay !== false) {
          playAudio(hs);
        }
      };

      const closeBalloon = () => {
        selectedHotspotId = null;
        if (currentAudio) {
          currentAudio.pause();
          currentAudio = null;
        }
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        renderHotspots();
      };

      const renderHotspots = () => {
        hotspotsLayer.innerHTML = '';

        projectData.hotspots.forEach(function(hs, index) {
          const pin = document.createElement('div');
          pin.className = 'hotspot-pin';
          pin.style.left = hs.x + '%';
          pin.style.top = hs.y + '%';
          if (hs.color) pin.style.backgroundColor = hs.color;

          if (projectData.enablePinPulse !== false) {
            const pulse = document.createElement('div');
            pulse.className = 'pulse-ring';
            pin.appendChild(pulse);
          }

          const label = document.createElement('span');
          label.style.display = 'flex';
          label.style.alignItems = 'center';
          label.style.justifyContent = 'center';
          if (projectData.pinStyle === 'number') {
            label.innerText = String(index + 1);
          } else {
            label.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
          }
          pin.appendChild(label);

          const wordText = (hs.translations && hs.translations[currentLang]) || hs.text || '';
          const tooltip = document.createElement('div');
          tooltip.className = 'hover-tooltip';
          tooltip.innerText = wordText;
          pin.appendChild(tooltip);

          pin.addEventListener('click', function(e) {
            e.stopPropagation();
            selectHotspot(hs.id);
          });

          if (selectedHotspotId === hs.id) {
            pin.classList.add('active');
            pin.style.zIndex = '999';
            const placeTop = hs.y >= 35;
            const balloon = document.createElement('div');
            balloon.className = 'speech-balloon ' + (placeTop ? 'place-top' : 'place-bottom');
            balloon.addEventListener('click', function(e) {
              e.stopPropagation();
            });

            const stem = document.createElement('div');
            stem.className = 'balloon-stem';
            balloon.appendChild(stem);

            const body = document.createElement('div');
            body.className = 'balloon-body';
            body.title = 'Clique para ouvir áudio';
            body.addEventListener('click', function(e) {
              e.stopPropagation();
              playAudio(hs);
            });

            if (hs.contentType === 'image') {
              const imgContainer = document.createElement('div');
              imgContainer.className = 'balloon-image-container';
              const img = document.createElement('img');
              img.src = hs.balloonImageUrl || '';
              img.alt = wordText || 'Hotspot';
              imgContainer.appendChild(img);

              if (!hs.noAudio && !projectData.disableGlobalAudio && (projectData.showPlayButtonInBalloon || hs.audioUrl)) {
                const playBtn = document.createElement('div');
                playBtn.className = 'balloon-image-play';
                playBtn.innerHTML = '▶';
                imgContainer.appendChild(playBtn);
              }

              body.appendChild(imgContainer);
            } else {
              const mainRow = document.createElement('div');
              mainRow.className = 'balloon-main-row';

              const wordSpan = document.createElement('span');
              wordSpan.className = 'balloon-word';
              wordSpan.innerText = wordText;
              mainRow.appendChild(wordSpan);

              if (!hs.noAudio && !projectData.disableGlobalAudio) {
                const playBtn = document.createElement('button');
                playBtn.className = 'balloon-play-btn';
                playBtn.innerHTML = '▶';
                playBtn.title = 'Ouvir pronúncia';
                mainRow.appendChild(playBtn);
              }

              body.appendChild(mainRow);

              if (hs.secondaryText) {
                const secSpan = document.createElement('span');
                secSpan.className = 'balloon-sec';
                secSpan.innerText = hs.secondaryText;
                body.appendChild(secSpan);
              }
            }

            balloon.appendChild(body);

            if (!projectData.hideBalloonClose) {
              const closeBtn = document.createElement('button');
              closeBtn.className = 'balloon-close';
              closeBtn.innerHTML = '✕';
              closeBtn.title = 'Fechar';
              closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeBalloon();
              });
              balloon.appendChild(closeBtn);
            }

            pin.appendChild(balloon);
          }

          hotspotsLayer.appendChild(pin);
        });
      };

      renderHotspots();
    }
  }

  customElements.define('hotspot-widget', HotspotWidget);
})();
</script>
<!-- FIM DO EMBED HOTSPOT INTERATIVO -->`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function downloadProjectAsHtml(project: HotspotProject, filename?: string) {
  const htmlContent = generateStandaloneHtml(project);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  const sanitizedTitle = (project.title || 'imagem-interativa')
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '_')
    .substring(0, 30);
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', filename || `${sanitizedTitle}.html`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
}

export async function copyProjectHtmlToClipboard(project: HotspotProject): Promise<boolean> {
  const htmlContent = generateStandaloneHtml(project);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(htmlContent);
      return true;
    }
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = htmlContent;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy HTML to clipboard', err);
    return false;
  }
}
