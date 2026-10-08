import { InfoData } from '../data/content';

interface InfoPanelProps {
  data: InfoData | null;
  onClose: () => void;
}

export default function InfoPanel({ data, onClose }: InfoPanelProps) {
  if (!data) return null;

  return (
    <>
      {/* Overlay для закрытия по клику в любое место */}
      <div
        className="fixed inset-0 z-20 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute top-4 right-4 z-30 max-w-md w-[90%] sm:w-96 animate-fadeIn">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Заголовок */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 flex items-center justify-between">
            <h3 className="text-white text-lg md:text-xl font-bold pr-2">
              {data.title}
            </h3>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white text-xl"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
          {/* Содержимое */}
          <div className="p-5">
            <p className="text-gray-800 text-base md:text-lg leading-relaxed">
              {data.description}
            </p>
          </div>
          {/* Подсказка */}
          <div className="px-5 pb-4">
            <p className="text-xs text-gray-400 italic">
              Нажмите в любое место, чтобы закрыть
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
