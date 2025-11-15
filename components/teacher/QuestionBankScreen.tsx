import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface QuestionBankItem {
  id: string;
  question_text: string;
  answers: string[];
  correct_answer_index: number;
  category?: string;
  difficulty?: string;
  created_at: string;
}

interface QuestionBankScreenProps {
  teacherId: string;
  onBack: () => void;
}

const QuestionBankScreen: React.FC<QuestionBankScreenProps> = ({ teacherId, onBack }) => {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);

  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');

  useEffect(() => {
    loadQuestions();
  }, [teacherId]);

  const loadQuestions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('question_bank')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading questions:', error);
    } else {
      setQuestions(data || []);
    }
    setIsLoading(false);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setAnswers(['', '', '', '']);
    setCorrectIndex(0);
    setCategory('');
    setDifficulty('medio');
    setShowAddModal(true);
  };

  const handleEditQuestion = (question: QuestionBankItem) => {
    setEditingQuestion(question);
    setQuestionText(question.question_text);
    setAnswers(question.answers);
    setCorrectIndex(question.correct_answer_index);
    setCategory(question.category || '');
    setDifficulty((question.difficulty as 'facil' | 'medio' | 'dificil') || 'medio');
    setShowAddModal(true);
  };

  const handleSaveQuestion = async () => {
    if (questionText.trim() === '' || answers.some(a => a.trim() === '')) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (editingQuestion) {
      const { error } = await supabase
        .from('question_bank')
        .update({
          question_text: questionText,
          answers: answers,
          correct_answer_index: correctIndex,
          category: category || null,
          difficulty: difficulty,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingQuestion.id);

      if (error) {
        console.error('Error updating question:', error);
        alert('Error al actualizar la pregunta');
      } else {
        setShowAddModal(false);
        loadQuestions();
      }
    } else {
      const { error } = await supabase
        .from('question_bank')
        .insert({
          teacher_id: teacherId,
          question_text: questionText,
          answers: answers,
          correct_answer_index: correctIndex,
          category: category || null,
          difficulty: difficulty,
        });

      if (error) {
        console.error('Error adding question:', error);
        alert('Error al agregar la pregunta');
      } else {
        setShowAddModal(false);
        loadQuestions();
      }
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta pregunta?')) return;

    const { error } = await supabase
      .from('question_bank')
      .delete()
      .eq('id', questionId);

    if (error) {
      console.error('Error deleting question:', error);
      alert('Error al eliminar la pregunta');
    } else {
      loadQuestions();
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
            >
              ← Volver
            </button>
            <h1 className="text-3xl font-bold">📚 Banco de Preguntas</h1>
          </div>
          <button
            onClick={handleAddQuestion}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition"
          >
            + Agregar Pregunta
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Cargando preguntas...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-xl">
            <p className="text-slate-400 text-lg mb-4">No tienes preguntas en tu banco</p>
            <p className="text-slate-500">Crea tu primera pregunta para comenzar</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {questions.map((q, index) => (
              <div key={q.id} className="bg-slate-800 rounded-xl p-6 hover:bg-slate-750 transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-sky-400">#{index + 1}</span>
                      {q.difficulty && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          q.difficulty === 'facil' ? 'bg-green-500/20 text-green-400' :
                          q.difficulty === 'medio' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {q.difficulty.toUpperCase()}
                        </span>
                      )}
                      {q.category && (
                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                          {q.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{q.question_text}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {q.answers.map((answer, idx) => (
                        <div
                          key={idx}
                          className={`px-3 py-2 rounded-lg text-sm ${
                            idx === q.correct_answer_index
                              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {idx === q.correct_answer_index && '✓ '}
                          {answer}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditQuestion(q)}
                      className="px-3 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg text-sm transition"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Pregunta</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-400 text-white"
                  rows={3}
                  placeholder="Escribe tu pregunta aquí..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Categoría (Opcional)</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-400 text-white"
                    placeholder="Ej: Matemáticas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Dificultad</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'facil' | 'medio' | 'dificil')}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-400 text-white"
                  >
                    <option value="facil">Fácil</option>
                    <option value="medio">Medio</option>
                    <option value="dificil">Difícil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">Respuestas</label>
                {answers.map((answer, idx) => (
                  <div key={idx} className="flex items-center gap-3 mb-3">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={correctIndex === idx}
                      onChange={() => setCorrectIndex(idx)}
                      className="w-5 h-5"
                    />
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => handleAnswerChange(idx, e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-400 text-white"
                      placeholder={`Respuesta ${idx + 1}`}
                    />
                    {correctIndex === idx && (
                      <span className="text-green-400 font-semibold">✓ Correcta</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveQuestion}
                className="px-6 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg font-semibold transition"
              >
                {editingQuestion ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankScreen;
