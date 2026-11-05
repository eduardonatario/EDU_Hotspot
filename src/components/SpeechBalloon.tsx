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
}) => {
  const word = hotspot.translations[currentLanguage] || hotspot.text || '';
  const secondaryWord = hotspot.secondaryText?.trim();

  // Determine smart placement: if hotspot is in top 35%, place balloon BELOW; otherwise ABOVE
  const placeBelow = hotspot.y < 35;
  // If hotspot is too far left (< 22%), shift right; if too far right (> 78%), shift left
  let horizontalAlignClass = '-translate-x-1/2 left-1/2';
  let arrowHorizontalClass = 'left-1/2 -translate-x-1/2';

  if (hotspot.x < 22) {
    horizontalAlignClass = 'left-0 translate-x-1';
    arrowHorizontalClass = 'left-5';
  } else if (hotspot.x > 78) {
    horizontalAlignClass = 'right-0 -translate-x-1';
    arrowHorizontalClass = 'right-5';
  }

  const handleBalloonClick = () => {
    if (!disableAudio) {
      onPlayAudio(hotspot, currentLanguage);
    }
  };

  return (
    <div
      className={`absolute z-30 transition-all duration-200 pointer-events-auto w-max max-w-[85vw] sm:max-w-[380px] ${horizontalAlignClass} ${
        placeBelow ? 'top-full mt-3' : 'bottom-full mb-3'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Speech Balloon Bubble Container - Adapts to text content naturally */}
      <div className="relative bg-white/98 dark:bg-slate-900/98 backdrop-blur-md rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 shadow-xl border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-100 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
        {/* Balloon Stem / Pointer Arrow */}
        <div
          className={`absolute w-3.5 h-3.5 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-700 transform rotate-45 ${arrowHorizontalClass} ${
            placeBelow
              ? '-top-2 border-t border-l'
              : '-bottom-2 border-b border-r'
          }`}
        />

        {/* Balloon Content: Word first, then Play button in light gray, secondary word below, then Close 'X' */}
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div
            onClick={handleBalloonClick}
            title={disableAudio ? '' : 'Clique para ouvir a pronúncia'}
            className={`${disableAudio ? 'cursor-default' : 'cursor-pointer group'} flex flex-col select-text min-w-0`}
          >
            {/* Primary Word and Play Button row */}
            <div className="flex items-center gap-2">
              <span
                style={{ fontSize: `${fontSize}px` }}
                className={`font-bold text-slate-900 dark:text-white tracking-tight leading-snug transition-colors whitespace-nowrap ${
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

            {/* Secondary Word: in gray and smaller font size directly below primary word */}
            {secondaryWord && (
              <span className="text-xs text-slate-400 dark:text-slate-400 font-medium leading-tight mt-0.5 whitespace-nowrap">
                {secondaryWord}
              </span>
            )}
          </div>

          {/* 'X' Close Button */}
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
        </div>
      </div>
    </div>
  );
};
