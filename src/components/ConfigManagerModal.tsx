import React, { useState } from 'react';
import {
  X,
  Settings,
  Image as ImageIcon,
  Plus,
  Trash2,
  Volume2,
  Play,
  Pause,
  Music,
  Check,
  AlertCircle,
  Ratio,
  Sliders,
  Type,
  MousePointer,
  MapPin,
  Hash,
  VolumeX,
  ChevronDown,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { Hotspot, HotspotProject, LanguageCode, PinStyleType } from '../types/hotspot';
import { createEmptyHotspot } from '../utils/exportImport';
import { audioManager } from '../utils/audio';

interface ConfigManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: HotspotProject;
  onSaveProject: (updatedProject: HotspotProject) => void;
  currentLanguage: LanguageCode;
}

export const ConfigManagerModal: React.FC<ConfigManagerModalProps> = ({
  isOpen,
  onClose,
  project,
  onSaveProject,
  currentLanguage,
}) => {
  const [formData, setFormData] = useState<HotspotProject>(() => ({
    ...project,
    audioAutoPlay: project.audioAutoPlay ?? true,
    enableSpeechSynthesis: project.enableSpeechSynthesis ?? true,
    showHoverTooltip: project.showHoverTooltip ?? false,
    imageFormat: project.imageFormat || 'free',
    pinStyle: project.pinStyle || 'pin',
    balloonFontSize: project.balloonFontSize || 15,
    showPlayButtonInBalloon: project.showPlayButtonInBalloon ?? false,
    hideBalloonClose: project.hideBalloonClose ?? false,
    readSecondaryTextDefault: project.readSecondaryTextDefault ?? false,
  }));

  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [testingHotspotId, setTestingHotspotId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'image' | 'hotspots' | 'balloon'>('image');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [expandedHotspotIds, setExpandedHotspotIds] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        ...project,
        audioAutoPlay: project.audioAutoPlay ?? true,
        enableSpeechSynthesis: project.enableSpeechSynthesis ?? true,
        showHoverTooltip: project.showHoverTooltip ?? false,
        imageFormat: project.imageFormat || 'free',
        pinStyle: project.pinStyle || 'pin',
        balloonFontSize: project.balloonFontSize || 15,
        showPlayButtonInBalloon: project.showPlayButtonInBalloon ?? false,
        hideBalloonClose: project.hideBalloonClose ?? false,
        readSecondaryTextDefault: project.readSecondaryTextDefault ?? false,
      });
      // All hotspots closed by default
      setExpandedHotspotIds({});
      setFeedbackNotice(null);
    }
  }, [isOpen, project]);

  const toggleExpandHotspot = (id: string) => {
    setExpandedHotspotIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleUpdateHotspotContentType = (id: string, contentType: 'text' | 'image') => {
    setFormData((prev) => ({
      ...prev,
      hotspots: prev.hotspots.map((hs) => (hs.id === id ? { ...hs, contentType } : hs)),
    }));
  };

  const handleUpdateHotspotBalloonImageUrl = (id: string, balloonImageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      hotspots: prev.hotspots.map((hs) => (hs.id === id ? { ...hs, balloonImageUrl } : hs)),
    }));
  };

  const handleUpdateHotspotSyncClose = (id: string, syncImageAudioClose: boolean) => {
    setFormData((prev) => ({
      ...prev,
      hotspots: prev.hotspots.map((hs) => (hs.id === id ? { ...hs, syncImageAudioClose } : hs)),
    }));
  };

  if (!isOpen) return null;

  const handleUpdateMainImageUrl = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: url,
    }));
    setImagePreviewError(false);
  };

  // Update hotspot word and its reading language (single word input with language selection)
  const handleUpdateHotspotWord = (id: string, newWord: string) => {
    setFormData((prev) => ({
      ...prev,
      hotspots: prev.hotspots.map((hs) => {
        if (hs.id !== id) return hs;
        const currentWordLang = hs.wordLanguage || 'pt';
        return {
          ...hs,
          text: newWord,
          translations: {
            ...hs.translations,
            [currentWordLang]: newWord,
            // Mirror to both for consistent display
            pt: currentWordLang === 'pt' ? newWord : (hs.translations?.pt || newWord),
            en: currentWordLang === 'en' ? newWord : (hs.translations?.en || newWord),
          },
        };
      }),
    }));
  };

  const handleUpdateHotspotLanguage = (id: string, lang: LanguageCode) => {
    setFormData((prev) => ({
      ...prev,
      hotspots: prev.hotspots.map((hs) => {
        if (hs.id !== id) return hs;
        const currentWord = hs.text || hs.translations[hs.wordLanguage || 'pt'] || '';
        return {
          ...hs,
          wordLanguage: lang,
          translations: {
            ...hs.translations,
            [lang]: currentWord,
          },
        };
      }),
    }));
  };

  const handleUpdateHotspotAudioUrl = (id: string, audioUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      hotspots: prev.hotspots.map((hs) => (hs.id === id ? { ...hs, audioUrl } : hs)),
    }));
  };

  const handleUpdateHotspotSecondaryWord = (id: string, secondaryText: string) => {
    setFormData((prev) => ({
      ...prev,
      hotspots: prev.hotspots.map((hs) => (hs.id === id ? { ...hs, secondaryText } : hs)),
    }));
  };

  const handleUpdateHotspotReadSecondaryText = (id: string, readSecondaryText: boolean) => {
    setFormData((prev) => ({
      ...prev,
      hotspots: prev.hotspots.map((hs) => (hs.id === id ? { ...hs, readSecondaryText } : hs)),
    }));
  };

  const handleUpdateHotspotSystemSpeech = (id: string, useSystemSpeech: boolean) => {
    setFormData((prev) => ({
      ...prev,
      hotspots: prev.hotspots.map((hs) => (hs.id === id ? { ...hs, useSystemSpeech } : hs)),
    }));
  };

  const handleAddNewHotspot = () => {
    const newHs = createEmptyHotspot(50, 50, 'Nova Palavra');
    newHs.wordLanguage = 'pt';
    setFormData((prev) => ({
      ...prev,
      hotspots: [...prev.hotspots, newHs],
    }));
    setExpandedHotspotIds((prev) => ({
      ...prev,
      [newHs.id]: true,
    }));
    setActiveTab('hotspots');
    setFeedbackNotice('Novo hotspot adicionado à tabela.');
  };

  // Fixed delete function: deletes immediately and reliably
  const handleDeleteHotspot = (id: string) => {
    if (testingHotspotId === id) {
      audioManager.stop();
      setTestingHotspotId(null);
    }
    setFormData((prev) => ({
      ...prev,
      hotspots: prev.hotspots.filter((hs) => hs.id !== id),
    }));
    setFeedbackNotice('Hotspot excluído com sucesso.');
    setTimeout(() => setFeedbackNotice(null), 2500);
  };

  const handleTestAudio = (hotspot: Hotspot) => {
    if (testingHotspotId === hotspot.id) {
      audioManager.stop();
      setTestingHotspotId(null);
    } else {
      setTestingHotspotId(hotspot.id);
      audioManager
        .playHotspotAudio(
          hotspot,
          hotspot.wordLanguage || currentLanguage,
          true,
          Boolean(formData.readSecondaryTextDefault)
        )
        .then(() => {
          setTimeout(() => setTestingHotspotId(null), 2500);
        });
    }
  };

  const handleSave = () => {
    onSaveProject(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header - Renamed to "Configurações" as requested */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Configurações
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gerencie a imagem, o formato de tamanho, os hotspots com áudio e a personalização dos balões.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 gap-3 bg-slate-50/50 dark:bg-slate-900/50 flex-wrap">
          <button
            onClick={() => setActiveTab('image')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'image'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Imagem & Proporção</span>
          </button>
          <button
            onClick={() => setActiveTab('hotspots')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'hotspots'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Hotspots & Áudios ({formData.hotspots.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('balloon')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'balloon'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Balão & Estilo dos Pins</span>
          </button>
        </div>

        {/* Feedback Notice */}
        {feedbackNotice && (
          <div className="mx-6 mt-3 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <span>{feedbackNotice}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: IMAGEM & PROPORÇÕES (Placed solely here as requested) */}
          {activeTab === 'image' && (
            <div className="space-y-6">
              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  URL da Imagem Principal
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleUpdateMainImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/minha-imagem.jpg"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Aspect Ratio Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Ratio className="w-4 h-4 text-indigo-500" />
                  <span>Escolha o Tamanho da Imagem</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  {/* 16:9 */}
                  <div
                    onClick={() => setFormData({ ...formData, imageFormat: '16:9' })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.imageFormat === '16:9'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">16:9</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">1920 × 1080 (Paisagem)</div>
                  </div>

                  {/* 9:16 */}
                  <div
                    onClick={() => setFormData({ ...formData, imageFormat: '9:16' })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.imageFormat === '9:16'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">9:16</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">720 × 1280 (Vertical/Celular)</div>
                  </div>

                  {/* Livre */}
                  <div
                    onClick={() => setFormData({ ...formData, imageFormat: 'free' })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.imageFormat === 'free'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Tamanho Livre</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Dimensão natural</div>
                  </div>

                  {/* Personalizado */}
                  <div
                    onClick={() => setFormData({ ...formData, imageFormat: 'custom' })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.imageFormat === 'custom'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Personalizado</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Definir pixels (px)</div>
                  </div>
                </div>

                {/* Custom dimensions inputs if selected */}
                {formData.imageFormat === 'custom' && (
                  <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <div>
                      <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                        Largura (px):
                      </label>
                      <input
                        type="number"
                        min="200"
                        max="3840"
                        value={formData.customWidth || 1200}
                        onChange={(e) =>
                          setFormData({ ...formData, customWidth: parseInt(e.target.value, 10) || 800 })
                        }
                        className="w-28 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                        Altura (px):
                      </label>
                      <input
                        type="number"
                        min="200"
                        max="2160"
                        value={formData.customHeight || 800}
                        onChange={(e) =>
                          setFormData({ ...formData, customHeight: parseInt(e.target.value, 10) || 600 })
                        }
                        className="w-28 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Box */}
              <div>
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Prévia da Imagem:
                </span>
                <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center shadow-inner">
                  <img
                    src={formData.imageUrl}
                    alt="Prévia"
                    onError={() => setImagePreviewError(true)}
                    onLoad={() => setImagePreviewError(false)}
                    className={`max-w-full max-h-full object-contain ${imagePreviewError ? 'hidden' : 'block'}`}
                  />
                  {imagePreviewError && (
                    <div className="text-center p-4 text-red-400 text-xs">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                      <span>URL inválida ou imagem inacessível.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOTSPOTS E ARQUIVOS DE AUDIO (Renamed as requested) */}
          {activeTab === 'hotspots' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  {/* Renamed text from & to 'e' as requested */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tabela de Hotspots e Arquivos de Áudio
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Insira a palavra do hotspot e escolha o idioma selecionado para leitura (Português ou Inglês).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddNewHotspot}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Hotspot</span>
                </button>
              </div>

              {/* Hotspots Editable List */}
              <div className="space-y-3.5">
                {formData.hotspots.map((hs, index) => {
                  const isTesting = testingHotspotId === hs.id;
                  const wordLang = hs.wordLanguage || 'pt';
                  const currentWord = hs.text || hs.translations[wordLang] || '';
                  const isExpanded = Boolean(expandedHotspotIds[hs.id]);
                  const isImageMode = hs.contentType === 'image';

                  return (
                    <div
                      key={hs.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm overflow-hidden transition-all"
                    >
                      {/* Collapsible Card Header: Clicking toggles expand/collapse */}
                      <div
                        onClick={() => toggleExpandHotspot(hs.id)}
                        className="p-3.5 sm:p-4 flex items-center justify-between gap-2 cursor-pointer bg-slate-50/80 hover:bg-slate-100/80 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors select-none"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-500" />
                            )}
                          </button>

                          <span
                            className="w-6 h-6 rounded-full text-white text-xs font-extrabold flex items-center justify-center shadow-sm shrink-0"
                            style={{ backgroundColor: hs.color || '#4F46E5' }}
                          >
                            {formData.pinStyle === 'pin' ? (
                              <MapPin className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              index + 1
                            )}
                          </span>

                          <div className="flex items-center gap-2 truncate">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              Hotspot #{index + 1}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                              — {isImageMode ? '🖼️ (Apenas Imagem)' : currentWord || '(Sem palavra)'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleTestAudio(hs)}
                            title="Ouvir áudio"
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center gap-1 border border-slate-200/80 dark:border-slate-600 transition-colors shadow-xs"
                          >
                            {isTesting ? (
                              <Pause className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                            )}
                            <span className="hidden sm:inline">{isTesting ? 'Tocando...' : 'Testar'}</span>
                          </button>

                          {/* Fixed Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteHotspot(hs.id)}
                            title="Apagar este hotspot"
                            className="p-1 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Collapsible Content */}
                      {isExpanded && (
                        <div className="p-4 space-y-3.5 border-t border-slate-100 dark:border-slate-800">
                          {/* Option: Tipo de Conteúdo do Balão (Texto vs Apenas Imagem) */}
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                              Exibição no Balão:
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateHotspotContentType(hs.id, 'text')}
                                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                                  !isImageMode
                                    ? 'bg-white dark:bg-slate-800 text-indigo-600 border-indigo-500 shadow-sm'
                                    : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Texto (Palavra)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleUpdateHotspotContentType(hs.id, 'image')}
                                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                                  isImageMode
                                    ? 'bg-white dark:bg-slate-800 text-indigo-600 border-indigo-500 shadow-sm'
                                    : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>Apenas Imagem</span>
                              </button>
                            </div>
                          </div>

                          {/* Se for APENAS IMAGEM */}
                          {isImageMode ? (
                            <div className="space-y-3 p-3 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                  URL da Imagem que aparecerá no balão
                                </label>
                                <input
                                  type="url"
                                  value={hs.balloonImageUrl || ''}
                                  onChange={(e) => handleUpdateHotspotBalloonImageUrl(hs.id, e.target.value)}
                                  placeholder="https://exemplo.com/foto-do-objeto.png"
                                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>

                              {/* Preview da imagem se preenchida */}
                              {hs.balloonImageUrl && (
                                <div className="flex items-center gap-3">
                                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0">
                                    <img
                                      src={hs.balloonImageUrl}
                                      alt="Prévia do balão"
                                      className="max-w-full max-h-full object-contain"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  </div>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Esta imagem será exibida dentro do balão ao clicar no hotspot.
                                  </span>
                                </div>
                              )}

                              {/* Opção imagem+audio sync */}
                              <div className="pt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(hs.syncImageAudioClose)}
                                    onChange={(e) => handleUpdateHotspotSyncClose(hs.id, e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                                  />
                                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    imagem+audio sync
                                  </span>
                                </label>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 ml-6">
                                  Quando ativada e tiver imagem e áudio, quando o áudio encerrar o balão se fecha automaticamente.
                                </p>
                              </div>
                            </div>
                          ) : (
                            /* Se for MODO TEXTO NORMAL */
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                  Palavra do Hotspot
                                </label>
                                <input
                                  type="text"
                                  value={currentWord}
                                  onChange={(e) => handleUpdateHotspotWord(hs.id, e.target.value)}
                                  placeholder="Digite a palavra que aparecerá no balão..."
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-semibold focus:bg-white dark:focus:bg-slate-800"
                                />
                              </div>

                              {/* Idioma para leitura */}
                              <div className="flex items-center gap-3 pt-1">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                  Idioma para leitura da palavra:
                                </span>
                                <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateHotspotLanguage(hs.id, 'pt')}
                                    className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                                      wordLang === 'pt'
                                        ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                  >
                                    <span>🇧🇷</span>
                                    <span>Português</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateHotspotLanguage(hs.id, 'en')}
                                    className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                                      wordLang === 'en'
                                        ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                  >
                                    <span>🇺🇸</span>
                                    <span>Inglês</span>
                                  </button>
                                </div>
                              </div>

                              {/* Secondary Word Field */}
                              <div className="pt-1">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                                  <span>Segunda Palavra / Subtítulo (opcional)</span>
                                  <span className="text-[11px] text-slate-400">Exibida abaixo em cinza (quebra automática)</span>
                                </label>
                                <textarea
                                  rows={2}
                                  value={hs.secondaryText || ''}
                                  onChange={(e) => handleUpdateHotspotSecondaryWord(hs.id, e.target.value)}
                                  placeholder="Ex: tradução, frase de exemplo, explicação longa..."
                                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-800 resize-y"
                                />

                                {/* Toggle: Ativar ou não leitura da Segunda Palavra / Subtítulo */}
                                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Volume2 className="w-4 h-4 text-indigo-500 shrink-0" />
                                    <div>
                                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                                        Ler também a segunda palavra / subtítulo
                                      </span>
                                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                                        Na reprodução de voz (TTS), lê o subtítulo logo após a palavra principal
                                      </span>
                                    </div>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(hs.readSecondaryText ?? formData.readSecondaryTextDefault)}
                                      onChange={(e) => handleUpdateHotspotReadSecondaryText(hs.id, e.target.checked)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* MP3 URL & System Speech */}
                          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                                <Music className="w-3.5 h-3.5 text-indigo-500" />
                                <span>URL do Arquivo MP3 (opcional)</span>
                              </label>
                              <input
                                type="url"
                                value={hs.audioUrl || ''}
                                onChange={(e) => handleUpdateHotspotAudioUrl(hs.id, e.target.value)}
                                placeholder="https://exemplo.com/audio.mp3"
                                disabled={hs.useSystemSpeech}
                                className={`w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono transition-opacity ${
                                  hs.useSystemSpeech
                                    ? 'opacity-40 bg-slate-100 dark:bg-slate-900 cursor-not-allowed'
                                    : 'bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800'
                                }`}
                              />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                              <input
                                type="checkbox"
                                checked={Boolean(hs.useSystemSpeech)}
                                onChange={(e) => handleUpdateHotspotSystemSpeech(hs.id, e.target.checked)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                              />
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Usar voz do próprio sistema (TTS nativo)
                              </span>
                              <span className="text-[11px] text-slate-400">
                                (fala a palavra no idioma selecionado acima)
                              </span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {formData.hotspots.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-slate-400">
                    <p className="text-sm font-semibold">Nenhum hotspot cadastrado.</p>
                    <p className="text-xs mt-1">Clique em "Novo Hotspot" acima para adicionar.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BALÃO & ESTILO DOS PINS */}
          {activeTab === 'balloon' && (
            <div className="space-y-6">
              {/* Option: Hotspot Pin Style (Number vs Pin Icon) */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Estilo dos Marcadores (Pins na Imagem)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Escolha se os hotspots serão exibidos como ícone de pin ou com o número correspondente.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-md">
                  {/* Pin Icon option */}
                  <div
                    onClick={() => setFormData({ ...formData, pinStyle: 'pin' })}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                      formData.pinStyle === 'pin'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Ícone de Pin</div>
                      <div className="text-[11px] text-slate-400">Marcador estilo mapa</div>
                    </div>
                  </div>

                  {/* Number option */}
                  <div
                    onClick={() => setFormData({ ...formData, pinStyle: 'number' })}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                      formData.pinStyle === 'number'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Número</div>
                      <div className="text-[11px] text-slate-400">1, 2, 3...</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Option: Show or hide name on hover */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-indigo-500" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Exibir nome do hotspot ao passar o mouse
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Mostra uma etiqueta flutuante sobre o ponto antes de clicar. Padrão desativado.
                      </div>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showHoverTooltip}
                      onChange={(e) =>
                        setFormData({ ...formData, showHoverTooltip: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* Option: Balloon Font Size */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-indigo-500" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Tamanho do texto dentro do balão
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Personalize o tamanho da palavra exibida.
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {formData.balloonFontSize} px
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">12px</span>
                  <input
                    type="range"
                    min="12"
                    max="28"
                    step="1"
                    value={formData.balloonFontSize}
                    onChange={(e) =>
                      setFormData({ ...formData, balloonFontSize: parseInt(e.target.value, 10) || 15 })
                    }
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="text-xs text-slate-400">28px</span>
                </div>

                {/* Live Preview Box */}
                <div className="mt-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <span
                    style={{ fontSize: `${formData.balloonFontSize}px` }}
                    className="font-bold text-slate-900 dark:text-white"
                  >
                    Exemplo de Palavra ({formData.balloonFontSize}px)
                  </span>
                </div>
              </div>

              {/* Option: Hotspot Pulse Animation */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-indigo-500 animate-pulse" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Cintilar Marcadores (Pins)
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Ativa um efeito de pulsação suave nos hotspots.
                      </div>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enablePinPulse !== false}
                      onChange={(e) =>
                        setFormData({ ...formData, enablePinPulse: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* Option: Show Play Button in Balloon */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-indigo-500" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Exibir pequeno botão de play dentro do balão
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Insere um botão circular com ícone de play (▶) ao lado da palavra no balão.
                      </div>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showPlayButtonInBalloon}
                      onChange={(e) =>
                        setFormData({ ...formData, showPlayButtonInBalloon: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* Option: Audio Playback Mode (Auto vs Only on Play Click) */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-indigo-500" />
                    <span>Modo de Reprodução do Áudio</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Defina se o áudio/pronúncia deve tocar automaticamente ao clicar no ponto ou apenas ao apertar o play.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() =>
                      setFormData({
                        ...formData,
                        audioAutoPlay: true,
                        audioTriggerMode: 'auto',
                        disableGlobalAudio: false,
                      })
                    }
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                      formData.audioAutoPlay && !formData.disableGlobalAudio
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Volume2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Tocar Automaticamente
                      </div>
                      <div className="text-[10px] text-slate-400">Ao clicar no ponto</div>
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      setFormData({
                        ...formData,
                        audioAutoPlay: false,
                        audioTriggerMode: 'click',
                        disableGlobalAudio: false,
                        showPlayButtonInBalloon: true,
                      })
                    }
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                      !formData.audioAutoPlay && !formData.disableGlobalAudio
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Apenas ao Apertar Play
                      </div>
                      <div className="text-[10px] text-slate-400">Manual pelo botão</div>
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      setFormData({
                        ...formData,
                        disableGlobalAudio: true,
                        audioAutoPlay: false,
                      })
                    }
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                      formData.disableGlobalAudio
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-400 text-white flex items-center justify-center shrink-0">
                      <VolumeX className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Sem Áudio
                      </div>
                      <div className="text-[10px] text-slate-400">Apenas texto no balão</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Option: Enable or Disable Speech Synthesis (TTS) */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-indigo-500" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Opção de falar o texto do balão (Voz nativa / TTS)
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Quando desativado, o sistema não falará a palavra e tocará apenas se houver MP3.
                      </div>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enableSpeechSynthesis !== false}
                      onChange={(e) =>
                        setFormData({ ...formData, enableSpeechSynthesis: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* Option: Leitura da Segunda Palavra / Subtítulo */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-indigo-500" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Leitura da Segunda Palavra / Subtítulo (Voz / TTS)
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Ativa a leitura por voz do subtítulo após a palavra principal nos balões com texto secundário.
                      </div>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.readSecondaryTextDefault)}
                      onChange={(e) =>
                        setFormData({ ...formData, readSecondaryTextDefault: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* Option: Hide Balloon 'X' Close Button */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4 text-indigo-500" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        Ocultar botão "X" de fechar no balão
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Quando ativado, o balão não exibe o botão X de fechar.
                      </div>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.hideBalloonClose)}
                      onChange={(e) =>
                        setFormData({ ...formData, hideBalloonClose: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Total: <strong>{formData.hotspots.length} hotspots</strong> | Marcador:{' '}
            <strong>{formData.pinStyle === 'pin' ? 'Ícone de Pin' : 'Número'}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar e Aplicar Alterações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
