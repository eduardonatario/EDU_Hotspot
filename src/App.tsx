/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SAMPLE_PROJECTS } from './data/sampleProjects';
import { Hotspot, HotspotProject, LanguageCode } from './types/hotspot';
import { audioManager } from './utils/audio';
import { Header } from './components/Header';
import { ImageHotspotViewer } from './components/ImageHotspotViewer';
import { HotspotEditorModal } from './components/HotspotEditorModal';
import { ConfigManagerModal } from './components/ConfigManagerModal';
import { HotspotListDrawer } from './components/HotspotListDrawer';
import { HelpModal } from './components/HelpModal';
import { createEmptyHotspot } from './utils/exportImport';
import { downloadProjectAsHtml } from './utils/exportHtml';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'interactive_hotspots_project_v3';

export default function App() {
  // Load initial project from localStorage or default sample
  const [project, setProject] = useState<HotspotProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.imageUrl && Array.isArray(parsed.hotspots)) {
          return {
            ...parsed,
            audioAutoPlay: parsed.audioAutoPlay !== undefined ? Boolean(parsed.audioAutoPlay) : true,
            audioTriggerMode: parsed.audioTriggerMode || (parsed.audioAutoPlay === false ? 'click' : 'auto'),
            enableSpeechSynthesis: parsed.enableSpeechSynthesis !== undefined ? Boolean(parsed.enableSpeechSynthesis) : true,
            showHoverTooltip: Boolean(parsed.showHoverTooltip), // default: false
            imageFormat: parsed.imageFormat || 'free',
            pinStyle: parsed.pinStyle === 'number' ? 'number' : 'pin',
            customWidth: parsed.customWidth || 1200,
            customHeight: parsed.customHeight || 800,
            balloonFontSize: typeof parsed.balloonFontSize === 'number' ? parsed.balloonFontSize : 15,
            showPlayButtonInBalloon: Boolean(parsed.showPlayButtonInBalloon),
          };
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return SAMPLE_PROJECTS[0];
  });

  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('pt');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [audioAutoPlay, setAudioAutoPlay] = useState<boolean>(() => project.audioAutoPlay ?? true);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);

  // Audio Playback state from audioManager
  const [audioState, setAudioState] = useState<{
    isPlaying: boolean;
    currentId: string | null;
    progress: number;
  }>({
    isPlaying: false,
    currentId: null,
    progress: 0,
  });

  // Modals & Drawer states
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // AI Batch translation state
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [project]);

  // Subscribe to audio manager updates
  useEffect(() => {
    const unsubscribe = audioManager.subscribe((state) => {
      setAudioState(state);
    });
    return () => {
      unsubscribe();
      audioManager.stop();
    };
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handlePlayAudio = useCallback(
    (hotspot: Hotspot, lang: LanguageCode) => {
      audioManager.playHotspotAudio(hotspot, lang, project.enableSpeechSynthesis !== false);
    },
    [project.enableSpeechSynthesis]
  );

  const handleLanguageChange = (newLang: LanguageCode) => {
    setCurrentLanguage(newLang);
    showToast(newLang === 'pt' ? 'Idioma: Português (BR)' : 'Language: English (EN)', 'info');

    // If a hotspot balloon is currently open and auto-play is enabled, replay in the new language!
    if (selectedHotspotId && audioAutoPlay) {
      const activeHs = project.hotspots.find((h) => h.id === selectedHotspotId);
      if (activeHs) {
        audioManager.playHotspotAudio(activeHs, newLang, project.enableSpeechSynthesis !== false);
      }
    }
  };

  const handleUpdateHotspots = (updatedHotspots: Hotspot[]) => {
    setProject((prev) => ({
      ...prev,
      hotspots: updatedHotspots,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSaveHotspot = (updated: Hotspot) => {
    setProject((prev) => {
      const exists = prev.hotspots.some((h) => h.id === updated.id);
      const nextHotspots = exists
        ? prev.hotspots.map((h) => (h.id === updated.id ? updated : h))
        : [...prev.hotspots, updated];
      return {
        ...prev,
        hotspots: nextHotspots,
        updatedAt: new Date().toISOString(),
      };
    });
    showToast('Hotspot salvo com sucesso!');
  };

  const handleDeleteHotspot = (id: string) => {
    setProject((prev) => ({
      ...prev,
      hotspots: prev.hotspots.filter((h) => h.id !== id),
      updatedAt: new Date().toISOString(),
    }));
    if (selectedHotspotId === id) {
      setSelectedHotspotId(null);
    }
    audioManager.stop();
    showToast('Hotspot removido.', 'info');
  };

  const handleOpenEditModal = (hotspot: Hotspot) => {
    setEditingHotspot(hotspot);
    setIsEditModalOpen(true);
  };

  const handleAddNewHotspotManual = () => {
    const newHs = createEmptyHotspot(50, 50, 'Novo Objeto');
    handleSaveHotspot(newHs);
    setSelectedHotspotId(newHs.id);
    handleOpenEditModal(newHs);
  };

  const handleDownloadHtml = () => {
    downloadProjectAsHtml(project);
    showToast('Download do arquivo HTML iniciado!', 'success');
  };

  // Batch AI Translation BR <-> EN
  const handleTranslateAllWithAI = async () => {
    if (project.hotspots.length === 0) return;

    setIsTranslatingAll(true);
    showToast('Traduzindo com IA...', 'info');

    try {
      const updatedList: Hotspot[] = [];

      for (const hs of project.hotspots) {
        const ptWord = hs.translations?.pt || hs.text;
        const enWord = hs.translations?.en;

        if (ptWord && (!enWord || enWord.trim() === '')) {
          try {
            const resp = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: ptWord,
                sourceLang: 'pt',
                targetLangs: ['pt', 'en'],
              }),
            });

            if (resp.ok) {
              const data = await resp.json();
              if (data.translations) {
                updatedList.push({
                  ...hs,
                  translations: {
                    pt: ptWord,
                    en: data.translations?.en || ptWord,
                  },
                });
                continue;
              }
            }
          } catch (e) {
            console.warn('Batch translation error for item:', hs.id, e);
          }
        }
        updatedList.push(hs);
      }

      setProject((prev) => ({
        ...prev,
        hotspots: updatedList,
        updatedAt: new Date().toISOString(),
      }));

      showToast('Traduções concluídas com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro durante a tradução.', 'error');
    } finally {
      setIsTranslatingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header with BR/EN Switch and Download HTML */}
      {/* Top Header with BR/EN Switch and Download HTML */}
      <Header
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        hotspotsCount={project.hotspots.length}
        onOpenConfigManager={() => setIsConfigModalOpen(true)}
        onDownloadHtml={handleDownloadHtml}
        onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-lg flex items-center gap-2 border ${
              toastMessage.type === 'error'
                ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800'
                : toastMessage.type === 'info'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Interactive Workspace Area (Removed the subtitle text as requested) */}
      <main className="flex-1 p-2 sm:p-4 max-w-7xl w-full mx-auto flex flex-col">
        {/* Interactive Viewer Canvas */}
        <div className="flex-1 w-full min-h-[500px] flex">
          <ImageHotspotViewer
            imageUrl={project.imageUrl}
            hotspots={project.hotspots}
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            isEditMode={isEditMode}
            audioAutoPlay={audioAutoPlay}
            selectedHotspotId={selectedHotspotId}
            onSelectHotspot={setSelectedHotspotId}
            onUpdateHotspots={handleUpdateHotspots}
            onOpenEditModal={handleOpenEditModal}
            onPlayAudio={handlePlayAudio}
            isPlayingAudio={audioState.isPlaying}
            playingHotspotId={audioState.currentId}
            audioProgress={audioState.progress}
            showHoverTooltip={project.showHoverTooltip ?? false}
            imageFormat={project.imageFormat || 'free'}
            pinStyle={project.pinStyle || 'pin'}
            customWidth={project.customWidth || 1200}
            customHeight={project.customHeight || 800}
            balloonFontSize={project.balloonFontSize || 15}
            showPlayButtonInBalloon={project.showPlayButtonInBalloon ?? false}
            enablePinPulse={project.enablePinPulse !== false}
            disableGlobalAudio={project.disableGlobalAudio}
          />
        </div>
      </main>

      {/* Hotspots Side Drawer */}
      <HotspotListDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        hotspots={project.hotspots}
        currentLanguage={currentLanguage}
        selectedHotspotId={selectedHotspotId}
        onSelectHotspot={(id) => setSelectedHotspotId(id)}
        onOpenEditModal={handleOpenEditModal}
        onDeleteHotspot={handleDeleteHotspot}
        onAddNewHotspot={handleAddNewHotspotManual}
        onPlayAudio={handlePlayAudio}
        disableGlobalAudio={project.disableGlobalAudio}
      />

      {/* Edit Single Hotspot Modal */}
      <HotspotEditorModal
        hotspot={editingHotspot}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingHotspot(null);
        }}
        onSave={handleSaveHotspot}
        onDelete={handleDeleteHotspot}
        activeLanguage={currentLanguage}
      />

      {/* Dedicated Project & Hotspots Configuration Management Modal */}
      <ConfigManagerModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        project={project}
        onSaveProject={(updatedProject) => {
          setProject(updatedProject);
          setAudioAutoPlay(updatedProject.audioAutoPlay ?? true);
          showToast('Configurações salvas e aplicadas com sucesso!');
        }}
        currentLanguage={currentLanguage}
      />

      {/* Help Instructions Modal */}
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </div>
  );
}
