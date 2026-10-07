import { useState, useCallback } from 'react';
import WaterCycleCanvas from './components/WaterCycleCanvas';
import ControlPanel from './components/ControlPanel';
import InfoPanel from './components/InfoPanel';
import Glossary from './components/Glossary';
import Quiz from './components/Quiz';
import { infoData, InfoData } from './data/content';
import { useAudio } from './hooks/useAudio';

type Screen = 'main' | 'glossary' | 'quiz';

export default function App() {
  const [screen, setScreen] = useState<Screen>('main');
  const [isPaused, setIsPaused] = useState(false);
  const [sunIntensity, setSunIntensity] = useState(0.5);
  const [showLabels, setShowLabels] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [highlightProcess, setHighlightProcess] = useState<string | null>(null);
  const [infoPanelData, setInfoPanelData] = useState<InfoData | null>(null);

  const { playClick, playSuccess, playError } = useAudio();

  const handleElementClick = useCallback((elementId: string) => {
    const data = infoData[elementId];
    if (data) {
      setInfoPanelData(data);
      if (soundEnabled) playClick();
    }
  }, [soundEnabled, playClick]);

  const handleCloseInfo = useCallback(() => {
    setInfoPanelData(null);
  }, []);

  const handleTogglePause = useCallback(() => {
    setIsPaused(prev => !prev);
    if (soundEnabled) playClick();
  }, [soundEnabled, playClick]);

  const handleToggleLabels = useCallback(() => {
    setShowLabels(prev => !prev);
    if (soundEnabled) playClick();
  }, [soundEnabled, playClick]);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
    if (!soundEnabled) playClick();
  }, [soundEnabled, playClick]);

  const handleOpenGlossary = useCallback(() => {
    setScreen('glossary');
    if (soundEnabled) playClick();
  }, [soundEnabled, playClick]);

  const handleOpenQuiz = useCallback(() => {
    setScreen('quiz');
    if (soundEnabled) playClick();
  }, [soundEnabled, playClick]);

  const handleCloseModal = useCallback(() => {
    setScreen('main');
    if (soundEnabled) playClick();
  }, [soundEnabled, playClick]);

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-sky-200">
      {/* Основной экран — симуляция */}
      <div className="absolute inset-0">
        <WaterCycleCanvas
          sunIntensity={sunIntensity}
          isPaused={isPaused}
          showLabels={showLabels}
          highlightProcess={highlightProcess}
          onElementClick={handleElementClick}
        />
      </div>

      {/* Информационная плашка */}
      <InfoPanel data={infoPanelData} onClose={handleCloseInfo} />

      {/* Панель управления */}
      <ControlPanel
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        sunIntensity={sunIntensity}
        onSunIntensityChange={setSunIntensity}
        showLabels={showLabels}
        onToggleLabels={handleToggleLabels}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenGlossary={handleOpenGlossary}
        onOpenQuiz={handleOpenQuiz}
        highlightProcess={highlightProcess}
        onHighlightProcess={setHighlightProcess}
      />

      {/* Заголовок */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
          <h1 className="text-lg md:text-xl font-bold text-gray-800">
            🌍 Круговорот воды в природе
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">
            Нажимайте на элементы, чтобы узнать больше
          </p>
        </div>
      </div>

      {/* Модальные окна */}
      {screen === 'glossary' && <Glossary onClose={handleCloseModal} />}
      {screen === 'quiz' && <Quiz onClose={handleCloseModal} />}
    </div>
  );
}
