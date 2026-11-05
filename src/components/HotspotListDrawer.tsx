import React, { useState } from 'react';
import {
  X,
  Plus,
  Volume2,
  Edit3,
  Trash2,
  Search,
  Music,
} from 'lucide-react';
import { Hotspot, LanguageCode, SUPPORTED_LANGUAGES } from '../types/hotspot';

interface HotspotListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hotspots: Hotspot[];
  currentLanguage: LanguageCode;
  selectedHotspotId: string | null;
  onSelectHotspot: (id: string) => void;
  onOpenEditModal: (hotspot: Hotspot) => void;
  onDeleteHotspot: (id: string) => void;
  onAddNewHotspot: () => void;
  onPlayAudio: (hotspot: Hotspot, lang: LanguageCode) => void;
}

export const HotspotListDrawer: React.FC<HotspotListDrawerProps> = ({
  isOpen,
  onClose,
  hotspots,
  currentLanguage,
  selectedHotspotId,
  onSelectHotspot,
  onOpenEditModal,
  onDeleteHotspot,
  onAddNewHotspot,
  onPlayAudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredHotspots = hotspots.filter((h) => {
    const text = (h.translations[currentLanguage] || h.text || '').toLowerCase();
    const sec = (h.secondaryText || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return text.includes(query) || sec.includes(query);
  });

  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Lista de Hotspots</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              {hotspots.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Idioma atual: {currentLangMeta?.flag} {currentLangMeta?.name}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por palavra..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={onAddNewHotspot}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Novo Hotspot</span>
          </button>
        </div>
      </div>

      {/* Hotspots List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredHotspots.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-400">
            <p className="text-sm font-medium">Nenhum hotspot encontrado.</p>
            <p className="text-xs mt-1">Clique na imagem para adicionar ou mude sua busca.</p>
          </div>
        ) : (
          filteredHotspots.map((hotspot, idx) => {
            const isSelected = hotspot.id === selectedHotspotId;
            const text = hotspot.translations[currentLanguage] || hotspot.text;
            const hasMp3 = Boolean(hotspot.audioUrlsByLang?.[currentLanguage] || hotspot.audioUrl);

            return (
              <div
                key={hotspot.id}
                onClick={() => {
                  onSelectHotspot(hotspot.id);
                  onPlayAudio(hotspot, currentLanguage);
                }}
                className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm"
                    style={{ backgroundColor: hotspot.color || '#3B82F6' }}
                  >
                    {idx + 1}
                  </span>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {text}
                    </h4>
                    {hotspot.secondaryText && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">
                        {hotspot.secondaryText}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>({hotspot.x}%, {hotspot.y}%)</span>
                      {hasMp3 ? (
                        <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Music className="w-3 h-3" /> MP3
                        </span>
                      ) : (
                        <span className="text-slate-400">Voz</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayAudio(hotspot, currentLanguage);
                    }}
                    title="Ouvir áudio"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditModal(hotspot);
                    }}
                    title="Editar hotspot"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onDeleteHotspot(hotspot.id);
                    }}
                    title="Excluir hotspot"
                    className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
