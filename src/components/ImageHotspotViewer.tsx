import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  Volume2,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { Hotspot, ImageFormatType, LanguageCode, PinStyleType } from '../types/hotspot';
import { SpeechBalloon } from './SpeechBalloon';
import { createEmptyHotspot } from '../utils/exportImport';

interface ImageHotspotViewerProps {
  imageUrl: string;
  hotspots: Hotspot[];
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  isEditMode: boolean;
  audioAutoPlay: boolean;
  selectedHotspotId: string | null;
  onSelectHotspot: (id: string | null) => void;
  onUpdateHotspots: (hotspots: Hotspot[]) => void;
  onOpenEditModal: (hotspot: Hotspot) => void;
  onPlayAudio: (hotspot: Hotspot, lang: LanguageCode) => void;
  isPlayingAudio: boolean;
  playingHotspotId: string | null;
  audioProgress: number;
  showHoverTooltip?: boolean;
  imageFormat?: ImageFormatType;
  pinStyle?: PinStyleType;
  customWidth?: number;
  customHeight?: number;
  balloonFontSize?: number;
  showPlayButtonInBalloon?: boolean;
  enablePinPulse?: boolean;
  disableGlobalAudio?: boolean;
}

export const ImageHotspotViewer: React.FC<ImageHotspotViewerProps> = ({
  imageUrl,
  hotspots,
  currentLanguage,
  isEditMode,
  audioAutoPlay,
  selectedHotspotId,
  onSelectHotspot,
  onUpdateHotspots,
  onOpenEditModal,
  onPlayAudio,
  isPlayingAudio,
  playingHotspotId,
  showHoverTooltip = false, // Default is false as requested
  imageFormat = 'free',
  pinStyle = 'pin', // 'pin' or 'number'
  customWidth = 1200,
  customHeight = 800,
  balloonFontSize = 15,
  showPlayButtonInBalloon = false,
  enablePinPulse = true,
  disableGlobalAudio = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [draggingHotspotId, setDraggingHotspotId] = useState<string | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [imageUrl]);

  // Handle image click to add hotspot in Edit Mode
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !containerRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if clicked inside image bounds
    if (clickX < 0 || clickX > rect.width || clickY < 0 || clickY > rect.height) {
      return;
    }

    const xPercent = (clickX / rect.width) * 100;
    const yPercent = (clickY / rect.height) * 100;

    if (isEditMode) {
      const newHotspot = createEmptyHotspot(xPercent, yPercent, 'Novo Objeto');
      const updated = [...hotspots, newHotspot];
      onUpdateHotspots(updated);
      onSelectHotspot(newHotspot.id);
      onOpenEditModal(newHotspot);
    }
  };

  // Hotspot Dragging support in Edit Mode
  const handleMouseDownOnPin = (e: React.MouseEvent, hotspot: Hotspot) => {
    e.stopPropagation();
    if (isEditMode) {
      // Don't select the hotspot in edit mode to prevent balloon, just drag
      setDraggingHotspotId(hotspot.id);
    } else {
      const isAlreadySelected = selectedHotspotId === hotspot.id;
      onSelectHotspot(hotspot.id);

      if (!disableGlobalAudio && (audioAutoPlay || isAlreadySelected)) {
        onPlayAudio(hotspot, currentLanguage);
      }
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingHotspotId || !imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      let xPercent = Math.max(1, Math.min(99, (currentX / rect.width) * 100));
      let yPercent = Math.max(1, Math.min(99, (currentY / rect.height) * 100));

      xPercent = Math.round(xPercent * 10) / 10;
      yPercent = Math.round(yPercent * 10) / 10;

      onUpdateHotspots(
        hotspots.map((h) => (h.id === draggingHotspotId ? { ...h, x: xPercent, y: yPercent } : h))
      );
    },
    [draggingHotspotId, hotspots, onUpdateHotspots]
  );

  const handleMouseUp = useCallback(() => {
    if (draggingHotspotId) {
      setDraggingHotspotId(null);
    }
  }, [draggingHotspotId]);

  useEffect(() => {
    if (draggingHotspotId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingHotspotId, handleMouseMove, handleMouseUp]);

  // Determine sizing classes based on chosen aspect ratio
  let formatWrapperClass = '';
  let formatStyle: React.CSSProperties = {};

  if (imageFormat === '16:9') {
    formatWrapperClass = 'aspect-[16/9] w-[860px] max-w-[85vw] max-h-[75vh]';
  } else if (imageFormat === '9:16') {
    formatWrapperClass = 'aspect-[9/16] h-[72vh] max-w-[420px]';
  } else if (imageFormat === 'custom') {
    formatStyle = {
      width: customWidth ? `${customWidth}px` : '800px',
      height: customHeight ? `${customHeight}px` : '600px',
      maxWidth: '90vw',
      maxHeight: '75vh',
    };
  } else {
    // 'free'
    formatWrapperClass = 'max-w-full max-h-[75vh]';
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-slate-100/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 select-none">
      {/* Top Right Mode Banner */}
      <div className="absolute top-4 right-4 z-20">
        {isEditMode ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg text-xs animate-in fade-in">
            <MapPin className="w-4 h-4 fill-current" />
            <span>Mover hotspot: Arraste para reposicionar | Clique para criar</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/90 text-white font-medium rounded-xl shadow-lg text-xs backdrop-blur-md">
            <MapPin className="w-3.5 h-3.5 fill-current" />
            <span>Clique nos pontos para ver/ouvir a palavra</span>
          </div>
        )}
      </div>

      {/* Main Pan/Zoom Canvas Wrapper (Clean without dark borders or ratio balloons) */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className={`w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-auto ${
          isEditMode ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        {/* Fixed positioning container: using inline-block so it fits the image exactly */}
        <div className="relative inline-block max-w-full max-h-full">
          {/* Framed Image Container respecting chosen aspect ratio - Clean borderless */}
          <div
            style={formatStyle}
            className={`relative rounded-xl overflow-hidden flex items-center justify-center ${formatWrapperClass}`}
          >
            {/* Main Image */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Imagem Interativa com Hotspots"
              onLoad={() => {
                setImageLoaded(true);
                setImageError(false);
              }}
              onError={() => {
                setImageLoaded(false);
                setImageError(true);
              }}
              className={`rounded-xl transition-opacity duration-300 pointer-events-auto shadow-md ${
                imageFormat === 'free' ? 'max-w-full max-h-[75vh]' : 'w-full h-full object-cover'
              } ${imageLoaded ? 'opacity-100' : 'opacity-20'}`}
            />

            {/* Loading Skeleton */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-200/80 dark:bg-slate-800/80 rounded-xl text-slate-600 dark:text-slate-400">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm font-medium">Carregando imagem...</p>
              </div>
            )}

            {/* Image Error Alert */}
            {imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-700 dark:text-slate-300 p-6 text-center border border-slate-200 dark:border-slate-800">
                <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">Não foi possível carregar a imagem</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-4">
                  Verifique se o link da imagem é acessível publicamente ou configure uma nova URL nas Configurações.
                </p>
              </div>
            )}

            {/* Hotspots Render Layer */}
            {imageLoaded &&
              hotspots.map((hotspot, index) => {
                const isSelected = hotspot.id === selectedHotspotId;
                const isHovered = hotspot.id === hoveredHotspotId;
                const isPlaying = isPlayingAudio && playingHotspotId === hotspot.id;
                const displayText = hotspot.translations[currentLanguage] || hotspot.text;
                const pinColor = hotspot.color || '#3B82F6';

                return (
                  <div
                    key={hotspot.id}
                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-transform ${
                      draggingHotspotId === hotspot.id ? 'scale-125 z-40' : 'hover:scale-110'
                    }`}
                    onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                    onMouseLeave={() => setHoveredHotspotId(null)}
                  >
                    {/* Hotspot Pin Element */}
                    <button
                      type="button"
                      onMouseDown={(e) => handleMouseDownOnPin(e, hotspot)}
                      className={`relative group flex items-center justify-center transition-all duration-200 outline-none ${
                        isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                      }`}
                    >
                      {/* Animated Ripple / Pulse Rings - Conditionally animated */}
                      <span
                        className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          enablePinPulse ? 'animate-ping' : ''
                        }`}
                        style={{ backgroundColor: pinColor }}
                      />

                      {/* Outer Glow Ring with Pin Icon or Number (always remains constant, never changes icon when clicked or playing) */}
                      <span
                        className={`relative flex items-center justify-center w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full text-white font-bold text-xs shadow-lg transition-transform ${
                          isSelected
                            ? 'ring-4 ring-white shadow-2xl scale-110'
                            : 'ring-2 ring-white/80 hover:ring-white'
                        }`}
                        style={{ backgroundColor: pinColor }}
                      >
                        {pinStyle === 'pin' ? (
                          <MapPin className="w-4 h-4 fill-current drop-shadow-sm" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </span>

                      {/* Tooltip on hover when not selected: ONLY IF showHoverTooltip is true */}
                      {isHovered && !isSelected && showHoverTooltip && (
                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 bg-slate-900/90 text-white text-xs font-semibold rounded-lg shadow-xl pointer-events-none z-30 border border-slate-700/60 backdrop-blur-sm animate-in fade-in">
                          {displayText}
                        </span>
                      )}
                    </button>

                    {/* Speech Balloon Callout (active when hotspot is selected) */}
                    {isSelected && (
                      <SpeechBalloon
                        hotspot={hotspot}
                        currentLanguage={currentLanguage}
                        onPlayAudio={onPlayAudio}
                        onClose={() => onSelectHotspot(null)}
                        isPlaying={isPlaying}
                        fontSize={balloonFontSize}
                        showPlayButton={showPlayButtonInBalloon}
                        disableAudio={disableGlobalAudio}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
