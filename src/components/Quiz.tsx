import { useState } from 'react';

interface QuizProps {
  onClose: () => void;
}

interface SlotState {
  id: string;
  correctAnswer: string;
  label: string;
  filledAnswer: string | null;
  isCorrect: boolean | null;
}

const INITIAL_SLOTS: SlotState[] = [
  { id: 'slot1', correctAnswer: 'Испарение', label: 'Вода → Пар ↑', filledAnswer: null, isCorrect: null },
  { id: 'slot2', correctAnswer: 'Конденсация', label: 'Пар → Облака ☁️', filledAnswer: null, isCorrect: null },
  { id: 'slot3', correctAnswer: 'Осадки', label: 'Облака → Дождь 🌧️', filledAnswer: null, isCorrect: null },
  { id: 'slot4', correctAnswer: 'Сток', label: 'Река → Океан 🌊', filledAnswer: null, isCorrect: null },
];

const ANSWERS = ['Испарение', 'Конденсация', 'Осадки', 'Сток', 'Инфильтрация', 'Транспирация'];

export default function Quiz({ onClose }: QuizProps) {
  const [slots, setSlots] = useState<SlotState[]>(INITIAL_SLOTS);
  const [draggedAnswer, setDraggedAnswer] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Список ответов, которые уже размещены в слотах
  const usedAnswers = slots
    .map(s => s.filledAnswer)
    .filter((a): a is string => a !== null);

  const isAnswerUsed = (answer: string) => usedAnswers.includes(answer);

  const handleDragStart = (answer: string) => {
    if (isAnswerUsed(answer)) return;
    setDraggedAnswer(answer);
  };

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDragOverSlot(slotId);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (slotId: string) => {
    if (!draggedAnswer) return;
    // Не позволяем разместить уже использованный ответ в новый слот
    if (isAnswerUsed(draggedAnswer)) {
      setDraggedAnswer(null);
      setDragOverSlot(null);
      return;
    }

    setSlots(prev => prev.map(slot => {
      if (slot.id === slotId && !slot.filledAnswer) {
        const isCorrect = slot.correctAnswer === draggedAnswer;
        return { ...slot, filledAnswer: draggedAnswer, isCorrect };
      }
      return slot;
    }));

    setDraggedAnswer(null);
    setDragOverSlot(null);
  };

  const handleAnswerClick = (answer: string) => {
    // Блокируем выбор уже использованного ответа
    if (isAnswerUsed(answer)) return;

    if (selectedAnswer === answer) {
      setSelectedAnswer(null);
    } else {
      setSelectedAnswer(answer);
    }
  };

  const handleSlotClick = (slotId: string) => {
    if (!selectedAnswer) return;
    // Дополнительная проверка: не размещать уже использованный ответ
    if (isAnswerUsed(selectedAnswer)) {
      setSelectedAnswer(null);
      return;
    }

    setSlots(prev => prev.map(slot => {
      if (slot.id === slotId && !slot.filledAnswer) {
        const isCorrect = slot.correctAnswer === selectedAnswer;
        return { ...slot, filledAnswer: selectedAnswer, isCorrect };
      }
      return slot;
    }));
    setSelectedAnswer(null);
  };

  const handleClearSlot = (slotId: string) => {
    setSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        return { ...slot, filledAnswer: null, isCorrect: null };
      }
      return slot;
    }));
    // Если проверяли результат — сбрасываем
    if (score !== null) {
      setScore(null);
      setShowSuccess(false);
    }
  };

  const checkAnswers = () => {
    const correctCount = slots.filter(s => s.isCorrect === true).length;
    setScore(correctCount);
    if (correctCount === 4) {
      setShowSuccess(true);
    }
  };

  const resetQuiz = () => {
    // Создаём новый массив, чтобы избежать проблем с ссылками
    setSlots(INITIAL_SLOTS.map(s => ({ ...s })));
    setScore(null);
    setShowSuccess(false);
    setSelectedAnswer(null);
  };

  const allFilled = slots.every(s => s.filledAnswer !== null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-5 flex items-center justify-between flex-shrink-0">
          <h2 className="text-white text-xl md:text-2xl font-bold flex items-center gap-2">
            🧩 Собери цикл круговорота воды
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white text-xl"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        {/* Инструкция */}
        <div className="px-5 pt-4 pb-2 flex-shrink-0">
          <p className="text-gray-600 text-center text-sm md:text-base">
            Перетащите (или нажмите) названия процессов на правильные места в схеме. Расположите этапы в правильном порядке!
          </p>
        </div>

        {/* Схема */}
        <div className="px-5 py-3 flex-1 overflow-y-auto">
          <div className="relative bg-gradient-to-b from-sky-100 to-green-50 rounded-xl p-4 md:p-6 min-h-[300px]">
            {/* Стрелки цикла */}
            <div className="hidden md:block absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 400 250" preserveAspectRatio="none">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
                  </marker>
                </defs>
                <path d="M 80 180 Q 40 100 100 50" stroke="#9ca3af" strokeWidth="2" fill="none" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
                <path d="M 130 40 Q 200 20 270 50" stroke="#9ca3af" strokeWidth="2" fill="none" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
                <path d="M 290 80 Q 320 150 300 200" stroke="#9ca3af" strokeWidth="2" fill="none" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
                <path d="M 270 210 Q 180 230 100 200" stroke="#9ca3af" strokeWidth="2" fill="none" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
              </svg>
            </div>

            {/* Слоты */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              {slots.map((slot, index) => (
                <div
                  key={slot.id}
                  className={`relative rounded-xl p-3 border-2 transition-all duration-300 min-h-[120px] flex flex-col items-center justify-center cursor-pointer ${
                    dragOverSlot === slot.id ? 'border-blue-400 bg-blue-50 scale-105' :
                    slot.isCorrect === true ? 'border-green-400 bg-green-50' :
                    slot.isCorrect === false ? 'border-red-400 bg-red-50' :
                    'border-gray-300 bg-white hover:border-blue-300'
                  }`}
                  onDragOver={(e) => handleDragOver(e, slot.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(slot.id)}
                  onClick={() => handleSlotClick(slot.id)}
                >
                  <div className="absolute -top-3 -left-2 w-7 h-7 bg-gray-700 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>

                  <p className="text-xs md:text-sm text-gray-500 text-center mb-2 font-medium">
                    {slot.label}
                  </p>

                  {slot.filledAnswer ? (
                    <div
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold text-center ${
                        slot.isCorrect === true ? 'bg-green-200 text-green-800' :
                        slot.isCorrect === false ? 'bg-red-200 text-red-800' :
                        'bg-gray-200 text-gray-700'
                      }`}
                      onClick={(e) => { e.stopPropagation(); handleClearSlot(slot.id); }}
                      title="Нажмите, чтобы убрать ответ"
                    >
                      {slot.filledAnswer}
                      {slot.isCorrect === true && ' ✓'}
                      {slot.isCorrect === false && ' ✗'}
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 text-sm text-center">
                      {selectedAnswer ? '← Нажмите сюда' : 'Перетащите сюда'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Варианты ответов */}
          <div className="mt-5">
            <p className="text-sm text-gray-500 mb-2 text-center font-medium">
              Варианты ответов {selectedAnswer && <span className="text-blue-500">(выбрано: {selectedAnswer})</span>}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {ANSWERS.map(answer => {
                const used = isAnswerUsed(answer);
                const isSelected = selectedAnswer === answer;
                return (
                  <div
                    key={answer}
                    draggable={!used}
                    onDragStart={() => handleDragStart(answer)}
                    onClick={() => handleAnswerClick(answer)}
                    className={`px-4 py-3 rounded-xl text-sm md:text-base font-bold transition-all min-h-[60px] select-none ${
                      used
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-blue-500 text-white shadow-lg scale-105 ring-2 ring-blue-300 cursor-pointer'
                        : 'bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 hover:from-blue-200 hover:to-purple-200 hover:scale-105 shadow-sm cursor-grab active:cursor-grabbing'
                    }`}
                  >
                    {answer}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Результат и кнопки */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          {showSuccess && (
            <div className="mb-3 p-3 bg-green-100 border border-green-300 rounded-xl text-center">
              <p className="text-green-800 font-bold text-lg">🎉 Отлично! Все ответы правильные!</p>
              <p className="text-green-600 text-sm">Ты отлично разбираешься в круговороте воды!</p>
            </div>
          )}

          {score !== null && !showSuccess && (
            <div className="mb-3 p-3 bg-yellow-100 border border-yellow-300 rounded-xl text-center">
              <p className="text-yellow-800 font-bold text-lg">Результат: {score} из 4</p>
              <p className="text-yellow-600 text-sm">
                {score >= 3 ? 'Почти идеально! Попробуй ещё раз.' :
                 score >= 2 ? 'Неплохо! Но есть над чем поработать.' :
                 'Не расстраивайся! Перечитай справочник и попробуй снова.'}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={resetQuiz}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors text-base"
            >
              🔄 Начать заново
            </button>
            {allFilled && score === null && (
              <button
                onClick={checkAnswers}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors text-base"
              >
                ✅ Проверить
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-colors text-base"
            >
              ← Назад
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
