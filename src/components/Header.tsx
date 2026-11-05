import React from 'react';
import {
  Volume2,
  VolumeX,
  Edit2,
  Settings,
  FileDown,
  List,
  Headphones,
} from 'lucide-react';

interface HeaderProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  audioAutoPlay: boolean;
  onToggleAudioAutoPlay: () => void;
  hotspotsCount: number;
  onOpenConfigManager: () => void;
  onDownloadHtml: () => void;
  onToggleDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isEditMode,
  onToggleEditMode,
  audioAutoPlay,
  onToggleAudioAutoPlay,
  hotspotsCount,
  onOpenConfigManager,
  onDownloadHtml,
  onToggleDrawer,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                Hotspot
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Clique nos pontos para ver a palavra e ouvir a pronúncia
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mover Hotspot Button in Blue */}
          <button
            onClick={onToggleEditMode}
            title={isEditMode ? 'Clique para desativar movimentação dos hotspots' : 'Ativar modo para mover os hotspots na imagem'}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isEditMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400/40'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Mover hotspot</span>
          </button>

          {/* Audio Auto-Play Toggle */}
          <button
            onClick={onToggleAudioAutoPlay}
            title={audioAutoPlay ? 'Auto-play de áudio ativado ao clicar nos pontos' : 'Auto-play de áudio desligado'}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
              audioAutoPlay
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
            }`}
          >
            {audioAutoPlay ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Configuration Area Button */}
          <button
            onClick={onOpenConfigManager}
            title="Gerenciar URL da Imagem, Textos dos Hotspots e Arquivos MP3"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center gap-1.5 transition-colors shadow-sm border border-slate-200/60 dark:border-slate-700/60"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-500" />
            <span>Configurações</span>
          </button>

          {/* Download HTML Button */}
          <button
            onClick={onDownloadHtml}
            title="Baixar arquivo HTML autônomo com a imagem, balões e sons"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <FileDown className="w-4 h-4" />
            <span>Baixar HTML</span>
          </button>

          {/* Hotspot Drawer List Toggle */}
          <button
            onClick={onToggleDrawer}
            title="Ver lista de hotspots"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors relative"
          >
            <List className="w-4 h-4" />
            <span className="hidden md:inline">Hotspots</span>
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
              {hotspotsCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
