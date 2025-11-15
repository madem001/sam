import React, { useState } from 'react';
import { Question } from '../../types';

interface CreateBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (battleName: string, roundCount: number, groupCount: number, questions: { text: string; answers: string[]; correctIndex: number }[], studentsPerGroup: number) => void;
  existingQuestions: Question[];
  isLoading?: boolean;
}

const CreateBattleModal: React.FC<CreateBattleModalProps> = ({ isOpen, onClose, onCreate, existingQuestions, isLoading = false }) => {
  const [battleName, setBattleName] = useState('');
  const [roundCount, setRoundCount] = useState(10);
  const [groupCount, setGroupCount] = useState(4);
  const [studentsPerGroup, setStudentsPerGroup] = useState(4);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  const [newQuestionText, setNewQuestionText] = useState('');
  const [newAnswers, setNewAnswers] = useState(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0);
  const [tempAddedQuestions, setTempAddedQuestions] = useState<Question[]>([]);

  if (!isOpen) return null;

  const handleToggleQuestion = (questionId: string) => {
    const newSet = new Set(selectedQuestionIds);
    if (newSet.has(questionId)) {
      newSet.delete(questionId);
    } else {
      newSet.add(questionId);
    }
    setSelectedQuestionIds(newSet);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const updatedAnswers = [...newAnswers];
    updatedAnswers[index] = value;
    setNewAnswers(updatedAnswers);
  };

  const handleAddNewQuestion = () => {
    if (newQuestionText.trim() === '' || newAnswers.some(a => a.trim() === '')) {
      alert('Por favor, completa la nueva pregunta y todas sus respuestas.');
      return;
    }
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      text: newQuestionText,
      answers: newAnswers,
      correctAnswerIndex: newCorrectAnswer,
    };
    setTempAddedQuestions([...tempAddedQuestions, newQuestion]);
    setNewQuestionText('');
    setNewAnswers(['', '', '', '']);
    setNewCorrectAnswer(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (battleName.trim() === '') {
      alert('Por favor, dale un nombre a la batalla.');
      return;
    }

    const selectedFromBank = existingQuestions.filter(q => selectedQuestionIds.has(q.id));
    const finalQuestions = [...selectedFromBank, ...tempAddedQuestions];

    if (finalQuestions.length === 0) {
      alert('Debes seleccionar o añadir al menos una pregunta.');
      return;
    }

    if (finalQuestions.length < roundCount) {
      alert(`Necesitas al menos ${roundCount} preguntas para ${roundCount} rondas.`);
      return;
    }

    if (roundCount < 5 || roundCount > 20) {
      alert('El número de rondas debe estar entre 5 y 20.');
      return;
    }

    if (groupCount < 1 || groupCount > 10) {
      alert('El número de grupos debe estar entre 1 y 10.');
      return;
    }

    if (studentsPerGroup < 2 || studentsPerGroup > 10) {
      alert('Los estudiantes por grupo deben estar entre 2 y 10.');
      return;
    }

    const formattedQuestions = finalQuestions.slice(0, roundCount).map(q => ({
      text: q.text,
      answers: q.answers,
      correctIndex: q.correctAnswerIndex,
    }));

    onCreate(battleName, roundCount, groupCount, formattedQuestions, studentsPerGroup);
    setBattleName('');
    setRoundCount(10);
    setGroupCount(4);
    setStudentsPerGroup(4);
    setSelectedQuestionIds(new Set());
    setTempAddedQuestions([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Crear Nueva Batalla</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Nombre de la Batalla
              </label>
              <input
                type="text"
                value={battleName}
                onChange={(e) => setBattleName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-400 dark:bg-slate-700 dark:text-slate-100"
                placeholder="Ej: Batalla de Matemáticas"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Rondas (5-20)
                </label>
                <input
                  type="number"
                  min="5"
                  max="20"
                  value={roundCount}
                  onChange={(e) => setRoundCount(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-400 dark:bg-slate-700 dark:text-slate-100"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Grupos (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={groupCount}
                  onChange={(e) => setGroupCount(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-400 dark:bg-slate-700 dark:text-slate-100"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Por Grupo (2-10)
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={studentsPerGroup}
                  onChange={(e) => setStudentsPerGroup(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-400 dark:bg-slate-700 dark:text-slate-100"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">
                Banco de Preguntas ({selectedQuestionIds.size + tempAddedQuestions.length} seleccionadas)
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                {existingQuestions.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-4">No hay preguntas en el banco</p>
                ) : (
                  existingQuestions.map(q => (
                    <label key={q.id} className="flex items-start space-x-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.has(q.id)}
                        onChange={() => handleToggleQuestion(q.id)}
                        className="mt-1"
                        disabled={isLoading}
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-200">{q.text}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-600 pt-4">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">Agregar Nueva Pregunta</h3>
              <input
                type="text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Texto de la pregunta"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg mb-3 dark:bg-slate-700 dark:text-slate-100"
                disabled={isLoading}
              />
              {newAnswers.map((ans, idx) => (
                <div key={idx} className="flex items-center space-x-2 mb-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={newCorrectAnswer === idx}
                    onChange={() => setNewCorrectAnswer(idx)}
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    value={ans}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    placeholder={`Respuesta ${idx + 1}`}
                    className="flex-1 px-3 py-1 border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:text-slate-100"
                    disabled={isLoading}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddNewQuestion}
                className="mt-2 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                disabled={isLoading}
              >
                Agregar Pregunta
              </button>
            </div>

            {tempAddedQuestions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Preguntas Agregadas ({tempAddedQuestions.length})
                </h4>
                <div className="space-y-1">
                  {tempAddedQuestions.map(q => (
                    <div key={q.id} className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 p-2 rounded">
                      {q.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition disabled:opacity-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creando...' : 'Crear Batalla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBattleModal;
