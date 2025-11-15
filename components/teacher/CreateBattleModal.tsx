import React, { useState } from 'react';
import { Question } from '../../types';

interface CreateBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (battleName: string, questions: Question[]) => void;
  existingQuestions: Question[];
}

const CreateBattleModal: React.FC<CreateBattleModalProps> = ({ isOpen, onClose, onCreate, existingQuestions }) => {
  const [battleName, setBattleName] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  
  // State for the new question form inside the modal
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
    // Reset form
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

    onCreate(battleName, finalQuestions);
    // Reset state for next time
    setBattleName('');
    setSelectedQuestionIds(new Set());
    setTempAddedQuestions([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Crear Nueva Batalla</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
            <ion-icon name="close-outline" class="text-2xl"></ion-icon>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-4 space-y-6">
          <div>
            <label htmlFor="battleName" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Nombre de la Batalla</label>
            <input 
              id="battleName"
              type="text" 
              value={battleName}
              onChange={e => setBattleName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
              placeholder="Ej: Repaso de React Hooks"
              required
            />
          </div>

          {/* Select Questions */}
          <div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">Seleccionar del Banco</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto border dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-900">
              {existingQuestions.map(q => (
                <label key={q.id} className="flex items-center space-x-3 p-2 bg-white dark:bg-slate-800 rounded cursor-pointer">
                  <input type="checkbox" checked={selectedQuestionIds.has(q.id)} onChange={() => handleToggleQuestion(q.id)} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"/>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{q.text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Add New Question Form */}
           <div className="space-y-3 p-4 border-t dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Añadir Pregunta Nueva</h3>
              <textarea 
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-400"
                  placeholder="Texto de la pregunta"
              />
              {newAnswers.map((answer, index) => (
                  <div key={index} className="flex items-center space-x-2">
                      <input type="radio" name="newCorrectAnswer" checked={newCorrectAnswer === index} onChange={() => setNewCorrectAnswer(index)} className="h-4 w-4 text-sky-600 border-slate-300 focus:ring-sky-500" />
                      <input type="text" value={answer} onChange={(e) => handleAnswerChange(index, e.target.value)} className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-400" placeholder={`Respuesta ${index + 1}`} />
                  </div>
              ))}
              <button type="button" onClick={handleAddNewQuestion} className="w-full py-2 text-sm bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition">Añadir a la Batalla</button>
           </div>
            {tempAddedQuestions.length > 0 && (
                <div className="p-2 border-t dark:border-slate-700">
                    <h4 className="text-sm font-bold mb-1 dark:text-slate-200">Preguntas añadidas:</h4>
                    <ul className="text-xs list-disc pl-5 text-slate-600 dark:text-slate-400">
                        {tempAddedQuestions.map(q => <li key={q.id}>{q.text}</li>)}
                    </ul>
                </div>
            )}
        </form>

        <div className="p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <button 
              type="submit"
              onClick={handleSubmit}
              className="w-full py-3 rounded-lg bg-sky-500 text-white font-bold shadow-md hover:bg-sky-600 transition"
            >
              Crear Sala
            </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBattleModal;