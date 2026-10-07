import { glossaryItems } from '../data/content';

interface GlossaryProps {
  onClose: () => void;
}

export default function Glossary({ onClose }: GlossaryProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex items-center justify-between flex-shrink-0">
          <h2 className="text-white text-xl md:text-2xl font-bold flex items-center gap-2">
            📖 Справочник
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white text-xl"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        {/* Содержимое */}
        <div className="overflow-y-auto p-5 flex-1">
          <div className="space-y-4">
            {glossaryItems.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-indigo-200 transition-colors"
              >
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  {item.term}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Кнопка закрытия внизу */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-lg"
          >
            Понятно! ✓
          </button>
        </div>
      </div>
    </div>
  );
}
