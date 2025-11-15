import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface QuestionSet {
  id: string;
  set_name: string;
  description?: string;
  question_count: number;
}

interface CreateBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (battleName: string, roundCount: number, groupCount: number, questions: { text: string; answers: string[]; correctIndex: number }[], studentsPerGroup: number) => void;
  teacherId: string;
  isLoading?: boolean;
}

const CreateBattleModal: React.FC<CreateBattleModalProps> = ({ isOpen, onClose, onCreate, teacherId, isLoading = false }) => {
  const [battleName, setBattleName] = useState('');
  const [groupCount, setGroupCount] = useState(4);
  const [studentsPerGroup, setStudentsPerGroup] = useState(4);
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadQuestionSets();
    }
  }, [isOpen, teacherId]);

  const loadQuestionSets = async () => {
    const { data: setsData, error } = await supabase
      .from('question_sets')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading sets:', error);
    } else {
      const setsWithCount = await Promise.all(
        (setsData || []).map(async (set) => {
          const { count } = await supabase
            .from('question_bank')
            .select('*', { count: 'exact', head: true })
            .eq('set_id', set.id);
          return { ...set, question_count: count || 0 };
        })
      );
      setQuestionSets(setsWithCount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (battleName.trim() === '') {
      alert('Por favor, dale un nombre a la batalla.');
      return;
    }

    if (!selectedSetId) {
      alert('Debes seleccionar un set de preguntas.');
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

    const { data: questions, error } = await supabase
      .from('question_bank')
      .select('*')
      .eq('set_id', selectedSetId);

    if (error || !questions || questions.length === 0) {
      alert('Error al cargar las preguntas del set');
      return;
    }

    const formattedQuestions = questions.map(q => ({
      text: q.question_text,
      answers: q.answers,
      correctIndex: q.correct_answer_index,
    }));

    const roundCount = questions.length;

    onCreate(battleName, roundCount, groupCount, formattedQuestions, studentsPerGroup);
    setBattleName('');
    setGroupCount(4);
    setStudentsPerGroup(4);
    setSelectedSetId('');
  };

  if (!isOpen) return null;

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

            <div className="grid grid-cols-2 gap-4">
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
                Seleccionar Set de Preguntas
              </h3>
              {questionSets.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-slate-500 dark:text-slate-400 mb-3">No hay sets de preguntas</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    Crea un set desde el Banco de Preguntas primero
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                  {questionSets.map(set => (
                    <label
                      key={set.id}
                      className={`flex items-start space-x-3 cursor-pointer p-3 rounded-lg transition ${
                        selectedSetId === set.id
                          ? 'bg-sky-100 dark:bg-sky-900/30 border-2 border-sky-500'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-transparent'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedSet"
                        checked={selectedSetId === set.id}
                        onChange={() => setSelectedSetId(set.id)}
                        className="mt-1"
                        disabled={isLoading}
                      />
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 dark:text-slate-100">{set.set_name}</p>
                        {set.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">{set.description}</p>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {set.question_count} pregunta{set.question_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
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
              disabled={isLoading || questionSets.length === 0}
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
