interface ControlPanelProps {
  isPaused: boolean;
  onTogglePause: () => void;
  sunIntensity: number;
  onSunIntensityChange: (value: number) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenGlossary: () => void;
  onOpenQuiz: () => void;
  highlightProcess: string | null;
  onHighlightProcess: (process: string | null) => void;
}

export default function ControlPanel({
  isPaused,
  onTogglePause,
  sunIntensity,
  onSunIntensityChange,
  showLabels,
  onToggleLabels,
  soundEnabled,
  onToggleSound,
  onOpenGlossary,
  onOpenQuiz,
  highlightProcess,
  onHighlightProcess,
}: ControlPanelProps) {
  const processes = [
    { id: 'evaporation', label: '💨 Испарение', color: 'bg-orange-400' },
    { id: 'condensation', label: '☁️ Конденсация', color: 'bg-purple-400' },
    { id: 'precipitation', label: '🌧️ Осадки', color: 'bg-blue-400' },
    { id: 'runoff', label: '🏞️ Сток', color: 'bg-cyan-400' },
    { id: 'infiltration', label: '💧 Инфильтрация', color: 'bg-amber-700' },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/95 to-gray-900/80 backdrop-blur-sm text-white p-3 z-20">
      {/* Верхний ряд — кнопки процессов */}
      <div className="flex flex-wrap gap-2 mb-3 justify-center">
        <span className="text-xs text-gray-300 self-center mr-2 hidden md:inline">Поэтапно:</span>
        {processes.map(p => (
          <button
            key={p.id}
            onClick={() => onHighlightProcess(highlightProcess === p.id ? null : p.id)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[60px] min-w-[60px] ${
              highlightProcess === p.id
                ? `${p.color} text-white shadow-lg scale-105`
                : 'bg-white/10 hover:bg-white/20 text-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
        {highlightProcess && (
          <button
            onClick={() => onHighlightProcess(null)}
            className="px-3 py-2 rounded-full text-sm bg-red-500/70 hover:bg-red-500 text-white min-h-[60px]"
          >
            ✕ Сброс
          </button>
        )}
      </div>

      {/* Нижний ряд — основные элементы управления */}
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
        {/* Пауза/Старт */}
        <button
          onClick={onTogglePause}
          className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg transition-all min-h-[50px] min-w-[60px]"
          title={isPaused ? 'Запустить' : 'Пауза'}
        >
          <span className="text-xl">{isPaused ? '▶️' : '⏸️'}</span>
          <span className="text-sm hidden sm:inline">{isPaused ? 'Старт' : 'Пауза'}</span>
        </button>

        {/* Ползунок солнца */}
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
          <span className="text-lg">🌡️</span>
          <span className="text-xs text-gray-300 hidden sm:inline">Сила солнца:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={sunIntensity * 100}
            onChange={(e) => onSunIntensityChange(Number(e.target.value) / 100)}
            className="w-24 md:w-32 h-2 accent-yellow-400 cursor-pointer"
          />
          <span className="text-xs text-yellow-300 w-8">{Math.round(sunIntensity * 100)}%</span>
        </div>

        {/* Подписи */}
        <button
          onClick={onToggleLabels}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all min-h-[50px] min-w-[60px] ${
            showLabels ? 'bg-green-500/30 hover:bg-green-500/40' : 'bg-white/15 hover:bg-white/25'
          }`}
          title="Показать/скрыть подписи"
        >
          <span className="text-lg">🏷️</span>
          <span className="text-sm hidden sm:inline">{showLabels ? 'Подписи ✓' : 'Подписи'}</span>
        </button>

        {/* Звук */}
        <button
          onClick={onToggleSound}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all min-h-[50px] min-w-[60px] ${
            soundEnabled ? 'bg-green-500/30 hover:bg-green-500/40' : 'bg-white/15 hover:bg-white/25'
          }`}
          title="Включить/выключить звук"
        >
          <span className="text-lg">{soundEnabled ? '🔊' : '🔇'}</span>
          <span className="text-sm hidden sm:inline">{soundEnabled ? 'Звук' : 'Тихо'}</span>
        </button>

        {/* Справочник */}
        <button
          onClick={onOpenGlossary}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-500/30 hover:bg-indigo-500/40 rounded-lg transition-all min-h-[50px] min-w-[60px]"
          title="Справочник"
        >
          <span className="text-lg">📖</span>
          <span className="text-sm hidden sm:inline">Справочник</span>
        </button>

        {/* Проверь себя */}
        <button
          onClick={onOpenQuiz}
          className="flex items-center gap-2 px-3 py-2 bg-pink-500/30 hover:bg-pink-500/40 rounded-lg transition-all min-h-[50px] min-w-[60px]"
          title="Проверь себя"
        >
          <span className="text-lg">🧩</span>
          <span className="text-sm hidden sm:inline">Проверь себя</span>
        </button>
      </div>
    </div>
  );
}
