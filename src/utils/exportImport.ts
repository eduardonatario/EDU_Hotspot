import { Hotspot, HotspotProject, LanguageCode } from '../types/hotspot';

export function createEmptyHotspot(x: number, y: number, initialText: string = 'Novo Objeto'): Hotspot {
  const id = 'hs-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
  return {
    id,
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    text: initialText,
    translations: {
      pt: initialText,
      en: initialText,
    },
    audioUrl: '',
    useSystemSpeech: false,
    phonetic: '',
    description: '',
    color: '#3B82F6',
  };
}

export function downloadProjectJson(project: HotspotProject, filename?: string) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
  const downloadAnchor = document.createElement('a');
  const sanitizedTitle = (project.title || 'hotspots-config')
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '_')
    .substring(0, 30);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename || `${sanitizedTitle}_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function validateAndParseProjectJson(jsonString: string): { success: boolean; data?: HotspotProject; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'O conteúdo JSON deve ser um objeto válido.' };
    }

    if (!parsed.imageUrl || typeof parsed.imageUrl !== 'string') {
      return { success: false, error: 'O JSON deve conter o campo "imageUrl" válido.' };
    }

    if (!Array.isArray(parsed.hotspots)) {
      return { success: false, error: 'O JSON deve conter um array "hotspots".' };
    }

    // Sanitize hotspots
    const sanitizedHotspots: Hotspot[] = parsed.hotspots.map((h: any, idx: number) => {
      const defaultText = h.text || h.word || `Item ${idx + 1}`;
      const translations: Record<LanguageCode, string> = {
        pt: h.translations?.pt || defaultText,
        en: h.translations?.en || defaultText,
      };

      return {
        id: h.id || `hs-${Date.now()}-${idx}`,
        x: typeof h.x === 'number' ? Math.max(0, Math.min(100, h.x)) : 50,
        y: typeof h.y === 'number' ? Math.max(0, Math.min(100, h.y)) : 50,
        text: defaultText,
        secondaryText: h.secondaryText || '',
        readSecondaryText: Boolean(h.readSecondaryText),
        translations,
        audioUrl: h.audioUrl || h.mp3Url || h.audio || '',
        audioUrlsByLang: h.audioUrlsByLang || {},
        useSystemSpeech: Boolean(h.useSystemSpeech),
        noAudio: Boolean(h.noAudio),
        contentType: h.contentType === 'image' ? 'image' : 'text',
        balloonImageUrl: h.balloonImageUrl || '',
        syncImageAudioClose: Boolean(h.syncImageAudioClose),
        phonetic: h.phonetic || '',
        description: h.description || '',
        color: h.color || '#3B82F6',
        category: h.category || '',
        icon: h.icon || '',
      };
    });

    const project: HotspotProject = {
      version: '1.0',
      id: parsed.id || `project-${Date.now()}`,
      title: parsed.title || 'Projeto de Imagem Interativa',
      description: parsed.description || '',
      imageUrl: parsed.imageUrl,
      defaultLanguage: parsed.defaultLanguage || 'pt',
      audioAutoPlay: parsed.audioAutoPlay !== false,
      readSecondaryTextDefault: Boolean(parsed.readSecondaryTextDefault),
      showHoverTooltip: Boolean(parsed.showHoverTooltip),
      imageFormat: parsed.imageFormat || 'free',
      pinStyle: parsed.pinStyle === 'number' ? 'number' : 'pin',
      customWidth: typeof parsed.customWidth === 'number' ? parsed.customWidth : 1200,
      customHeight: typeof parsed.customHeight === 'number' ? parsed.customHeight : 800,
      balloonFontSize: typeof parsed.balloonFontSize === 'number' ? parsed.balloonFontSize : 15,
      showPlayButtonInBalloon: Boolean(parsed.showPlayButtonInBalloon),
      hideBalloonClose: Boolean(parsed.hideBalloonClose),
      disableGlobalAudio: Boolean(parsed.disableGlobalAudio),
      enablePinPulse: parsed.enablePinPulse !== false,
      hotspots: sanitizedHotspots,
      createdAt: parsed.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { success: true, data: project };
  } catch (err: any) {
    return { success: false, error: 'Erro de sintaxe JSON: ' + (err.message || 'Arquivo inválido') };
  }
}
