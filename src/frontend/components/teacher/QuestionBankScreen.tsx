import React, { useState, useEffect } from 'react';
// import { supabase } from '../../lib/supabase'; // DESHABILITADO - Ver GUIA_CONEXION_BACKEND.md

interface QuestionSet {
  id: string;
  set_name: string;
  description?: string;
  created_at: string;
  question_count?: number;
}

interface Question {
  id?: string;
  question_text: string;
  answers: string[];
  correct_answer_index: number;
}

interface QuestionBankScreenProps {
  teacherId: string;
  onBack: () => void;
}

const QuestionBankScreen: React.FC<QuestionBankScreenProps> = ({ teacherId, onBack }) => {
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<QuestionSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [setName, setSetName] = useState('');
  const [setDescription, setSetDescription] = useState('');
  const [newQuestions, setNewQuestions] = useState<Question[]>([
    { question_text: '', answers: ['', '', '', ''], correct_answer_index: 0 }
  ]);

  useEffect(() => {
    loadSets();
  }, [teacherId]);

  const loadSets = async () => {
    setIsLoading(true);
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
      setSets(setsWithCount);
    }
    setIsLoading(false);
  };

  const loadSetQuestions = async (setId: string) => {
    const { data, error } = await supabase
      .from('question_bank')
      .select('*')
      .eq('set_id', setId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading questions:', error);
    } else {
      setQuestions(data || []);
    }
  };

  const handleAddQuestion = () => {
    if (newQuestions.length >= 20) {
      alert('Máximo 20 preguntas por set');
      return;
    }
    setNewQuestions([
      ...newQuestions,
      { question_text: '', answers: ['', '', '', ''], correct_answer_index: 0 }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (newQuestions.length <= 1) {
      alert('Mínimo 1 pregunta');
      return;
    }
    setNewQuestions(newQuestions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updated = [...newQuestions];
    if (field === 'question_text') {
      updated[index].question_text = value;
    } else if (field === 'correct_answer_index') {
      updated[index].correct_answer_index = value;
    }
    setNewQuestions(updated);
  };

  const handleAnswerChange = (qIndex: number, aIndex: number, value: string) => {
    const updated = [...newQuestions];
    updated[qIndex].answers[aIndex] = value;
    setNewQuestions(updated);
  };

  const handleCreateSet = async () => {
    if (!setName.trim()) {
      alert('Ingresa un nombre para el set');
      return;
    }

    if (newQuestions.length < 5) {
      alert('Un set debe tener mínimo 5 preguntas');
      return;
    }

    if (newQuestions.length > 20) {
      alert('Un set debe tener máximo 20 preguntas');
      return;
    }

    for (let i = 0; i < newQuestions.length; i++) {
      const q = newQuestions[i];
      if (!q.question_text.trim()) {
        alert(`Pregunta ${i + 1} está vacía`);
        return;
      }
      if (q.answers.some(a => !a.trim())) {
        alert(`Pregunta ${i + 1} tiene respuestas vacías`);
        return;
      }
    }

    const { data: newSet, error: setError } = await supabase
      .from('question_sets')
      .insert({
        teacher_id: teacherId,
        set_name: setName,
        description: setDescription
      })
      .select()
      .single();

    if (setError || !newSet) {
      alert('Error al crear el set: ' + (setError?.message || 'desconocido'));
      console.error('Error creating set:', setError);
      return;
    }

    const questionsToInsert = newQuestions.map(q => ({
      teacher_id: teacherId,
      set_id: newSet.id,
      question_text: q.question_text,
      answers: q.answers,
      correct_answer_index: q.correct_answer_index
    }));

    const { error: questionsError } = await supabase
      .from('question_bank')
      .insert(questionsToInsert);

    if (questionsError) {
      alert('Error al agregar preguntas: ' + (questionsError?.message || 'desconocido'));
      console.error('Error creating questions:', questionsError);
      return;
    }

    alert('Set creado exitosamente con ' + newQuestions.length + ' preguntas');

    setShowCreateModal(false);
    setSetName('');
    setSetDescription('');
    setNewQuestions([{ question_text: '', answers: ['', '', '', ''], correct_answer_index: 0 }]);
    setShowCreateModal(false);
    loadSets();
  };

  const handleDeleteSet = async (setId: string) => {
    if (!confirm('¿Eliminar este set y todas sus preguntas?')) return;

    const { error } = await supabase
      .from('question_sets')
      .delete()
      .eq('id', setId);

    if (error) {
      alert('Error al eliminar');
      console.error(error);
    } else {
      loadSets();
      if (selectedSet?.id === setId) {
        setSelectedSet(null);
        setQuestions([]);
      }
    }
  };

  const handleViewSet = async (set: QuestionSet) => {
    setSelectedSet(set);
    await loadSetQuestions(set.id);
  };

  if (selectedSet) {
    return (
      <div className="relative h-full overflow-y-auto">
        <button
          onClick={() => {
            setSelectedSet(null);
            setQuestions([]);
          }}
          className="absolute top-0 left-0 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/50 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
        </button>

        <div className="p-6 pt-14 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{selectedSet.set_name}</h1>
            {selectedSet.description && (
              <p className="text-slate-600 mt-1">{selectedSet.description}</p>
            )}
            <p className="text-sm text-slate-500 mt-2">{questions.length} preguntas</p>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-800 mb-2">{idx + 1}. {q.question_text}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.answers.map((answer, aIdx) => (
                    <div
                      key={aIdx}
                      className={`p-2 rounded text-sm ${
                        aIdx === q.correct_answer_index
                          ? 'bg-green-100 border-2 border-green-500 font-semibold'
                          : 'bg-slate-50'
                      }`}
                    >
                      {answer}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showCreateModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Crear Set de Preguntas</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nombre del Set
                </label>
                <input
                  type="text"
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:text-slate-100"
                  placeholder="Ej: Matemáticas Básicas"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={setDescription}
                  onChange={(e) => setSetDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:text-slate-100"
                  placeholder="Descripción del tema"
                />
              </div>
            </div>

            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-700">
                Preguntas ({newQuestions.length}/20)
              </h3>
              <button
                onClick={handleAddQuestion}
                disabled={newQuestions.length >= 20}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                <ion-icon name="add-outline" class="mr-1"></ion-icon>
                Agregar Pregunta
              </button>
            </div>

            <div className="space-y-6 mb-6">
              {newQuestions.map((q, qIdx) => (
                <div key={qIdx} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-700">Pregunta {qIdx + 1}</h4>
                    {newQuestions.length > 1 && (
                      <button
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <ion-icon name="trash-outline" class="text-xl"></ion-icon>
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={q.question_text}
                    onChange={(e) => handleQuestionChange(qIdx, 'question_text', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded mb-3 dark:bg-slate-700 dark:text-slate-100"
                    placeholder="Texto de la pregunta"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    {q.answers.map((answer, aIdx) => (
                      <div key={aIdx} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correct_answer_index === aIdx}
                          onChange={() => handleQuestionChange(qIdx, 'correct_answer_index', aIdx)}
                        />
                        <input
                          type="text"
                          value={answer}
                          onChange={(e) => handleAnswerChange(qIdx, aIdx, e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded dark:bg-slate-700 dark:text-slate-100"
                          placeholder={`Respuesta ${aIdx + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSetName('');
                  setSetDescription('');
                  setNewQuestions([{ question_text: '', answers: ['', '', '', ''], correct_answer_index: 0 }]);
                }}
                className="px-6 py-2 bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateSet}
                className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
              >
                Crear Set
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto">
      <button
        onClick={onBack}
        className="absolute top-0 left-0 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/50 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
      >
        <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
      </button>

      <div className="p-6 pt-14 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">Banco de Preguntas</h1>
          <p className="text-slate-500 mt-1">Crea sets de 5-20 preguntas</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 flex items-center justify-center"
        >
          <ion-icon name="add-circle-outline" class="mr-2 text-xl"></ion-icon>
          Crear Nuevo Set
        </button>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        ) : sets.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No hay sets creados</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sets.map((set) => (
              <div key={set.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{set.set_name}</h3>
                    {set.description && (
                      <p className="text-sm text-slate-600">{set.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {set.question_count} pregunta{set.question_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewSet(set)}
                      className="px-3 py-1 bg-sky-500 text-white text-sm rounded-lg hover:bg-sky-600"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleDeleteSet(set.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBankScreen;
