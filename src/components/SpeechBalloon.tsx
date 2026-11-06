import React from 'react';
import { X, Play } from 'lucide-react';
import { Hotspot, LanguageCode } from '../types/hotspot';

interface SpeechBalloonProps {
  hotspot: Hotspot;
  currentLanguage: LanguageCode;
  onPlayAudio: (hotspot: Hotspot, lang: LanguageCode) => void;
  onClose: () => void;
  isPlaying: boolean;
  fontSize?: number;
  showPlayButton?: boolean;
  disableAudio?: boolean;
  hideCloseButton?: boolean;
}

export const SpeechBalloon: React.FC<SpeechBalloonProps> = ({
  hotspot,
  currentLanguage,
  onPlayAudio,
  onClose,
  isPlaying,
  fontSize = 16,
  showPlayButton = false,
  disableAudio = false,
  hideCloseButton = false,
}) => {
  const isImageMode = hotspot.contentType === 'image';
  const word = hotspot.translations[currentLanguage] || hotspot.text || '';
  const secondaryWord = hotspot.secondaryText?.trim();
  const balloonImg = hotspot.balloonImageUrl?.trim() || '';
  const isLongSecondary = Boolean(secondaryWord && secondaryWord.length > 35);

  // Determine smart placement: if hotspot is in top 35%, place balloon BELOW; otherwise ABOVE
  const placeBelow = hotspot.y < 35;
  // If hotspot is too far left (< 28%), shift right; if too far right (> 72%), shift left
  let horizontalAlignClass = '-translate-x-1/2 left-1/2';
  let arrowHorizontalClass = 'left-1/2 -translate-x-1/2';

  if (hotspot.x < 28) {
    horizontalAlignClass = 'left-0 translate-x-1';
    arrowHorizontalClass = 'left-4';
  } else if (hotspot.x > 72) {
    horizontalAlignClass = 'right-0 -translate-x-1';
    arrowHorizontalClass = 'right-4';
  }

  const handleBalloonClick = () => {
    if (!disableAudio) {
      onPlayAudio(hotspot, currentLanguage);
    }
  };

  return (
    <div
      className={`absolute z-[80] transition-all duration-200 pointer-events-auto ${
        isImageMode
          ? 'w-max max-w-[85vw] sm:max-w-[320px]'
          : isLongSecondary
          ? 'w-max max-w-[90vw] sm:max-w-[480px]'
          : 'w-max max-w-[85vw] sm:max-w-[380px]'
      } ${horizontalAlignClass} ${
        placeBelow ? 'top-full mt-3' : 'bottom-full mb-3'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Speech Balloon Bubble Container */}
      <div className="relative bg-white/98 dark:bg-slate-900/98 backdrop-blur-md rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 shadow-xl border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-100 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150 max-w-full">
        {/* Balloon Stem / Pointer Arrow */}
        <div
          className={`absolute w-3.5 h-3.5 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-700 transform rotate-45 ${arrowHorizontalClass} ${
            placeBelow
              ? '-top-2 border-t border-l'
              : '-bottom-2 border-b border-r'
          }`}
        />

        {/* Balloon Content */}
        <div className="flex items-start justify-between gap-3 min-w-0">
          {isImageMode ? (
            /* Mode: Apenas Imagem */
            <div
              onClick={handleBalloonClick}
              title={disableAudio ? '' : 'Clique para ouvir áudio'}
              className={`${disableAudio ? 'cursor-default' : 'cursor-pointer group'} flex flex-col items-center select-none min-w-0`}
            >
              {balloonImg ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 max-w-[260px] max-h-[200px]">
                  <img
                    src={balloonImg}
                    alt={word || 'Hotspot imagem'}
                    className="w-full h-full object-contain rounded-xl max-h-[190px]"
                  />
                  {showPlayButton && !disableAudio && (
                    <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white p-1.5 rounded-full shadow-md hover:bg-slate-900 transition-colors">
                      <Play className={`w-3.5 h-3.5 fill-current ${isPlaying ? 'text-indigo-400 scale-110' : ''}`} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  (Nenhuma imagem configurada)
                </div>
              )}
            </div>
          ) : (
            /* Mode: Texto Normal */
            <div
              onClick={handleBalloonClick}
              title={disableAudio ? '' : 'Clique para ouvir a pronúncia'}
              className={`${disableAudio ? 'cursor-default' : 'cursor-pointer group'} flex flex-col select-text min-w-0 flex-1`}
            >
              {/* Primary Word and Play Button row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  style={{ fontSize: `${fontSize}px` }}
                  className={`font-bold text-slate-900 dark:text-white tracking-tight leading-snug transition-colors break-words ${
                    !disableAudio ? 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400' : ''
                  }`}
                >
                  {word}
                </span>

                {/* Play button: positioned AFTER the word, styled in cinza claro (light gray) */}
                {showPlayButton && !disableAudio && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayAudio(hotspot, currentLanguage);
                    }}
                    title="Ouvir áudio"
                    className={`p-1 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0 ${
                      isPlaying ? 'text-slate-600 dark:text-slate-200 scale-110' : ''
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                )}
              </div>

              {/* Secondary Word: wrapped and expands naturally */}
              {secondaryWord && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1 break-words whitespace-normal text-left max-w-full">
                  {secondaryWord}
                </span>
              )}
            </div>
          )}

          {/* 'X' Close Button - Conditionally hidden if hideCloseButton is true */}
          {!hideCloseButton && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              title="Fechar balão"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 -mr-1 mt-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
