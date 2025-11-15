import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import { getQuestionBank } from '../../api';

interface QuestionBankScreenProps {
    onBack: () => void;
}

const QuestionBankScreen: React.FC<QuestionBankScreenProps> = ({ onBack }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswers, setNewAnswers] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState(0);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await getQuestionBank();
                setQuestions(data);
            } catch (error) {
                console.error("Failed to fetch questions:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    const handleAnswerChange = (index: number, value: string) => {
        const updatedAnswers = [...newAnswers];
        updatedAnswers[index] = value;
        setNewAnswers(updatedAnswers);
    };

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newQuestion.trim() === '' || newAnswers.some(a => a.trim() === '')) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const questionToAdd: Omit<Question, 'id'> = {
            text: newQuestion,
            answers: newAnswers,
            correctAnswerIndex: correctAnswer,
        };
        
        try {
            // En una app real: const savedQuestion = await api.addQuestion(questionToAdd);
            // Simulación:
             const savedQuestion: Question = { ...questionToAdd, id: `q${Date.now()}`};
             setQuestions([savedQuestion, ...questions]);

            // Reset form
            setNewQuestion('');
            setNewAnswers(['', '', '', '']);
            setCorrectAnswer(0);

        } catch (error) {
             console.error("Failed to add question:", error);
             alert('Error al guardar la pregunta.');
        }
    };

    return (
       <div className="relative">
           <button
                onClick={onBack}
                className="absolute top-0 left-0 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                aria-label="Regresar"
            >
                {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
            </button>
            <div className="p-2 space-y-6">
                <div className="animate-stagger text-center" style={{ '--stagger-delay': '100ms' } as React.CSSProperties}>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Banco de Preguntas</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Añade y gestiona las preguntas para las batallas.</p>
                </div>

                {/* Add Question Form */}
                <form onSubmit={handleAddQuestion} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 space-y-4 animate-stagger" style={{ '--stagger-delay': '200ms' } as React.CSSProperties}>
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Añadir Nueva Pregunta</h2>
                    <div>
                        <label htmlFor="questionText" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Texto de la pregunta</label>
                        <textarea 
                            id="questionText"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 transition text-slate-900 dark:text-slate-100"
                            placeholder="Ej: ¿Qué renderiza un componente de React?"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Opciones de respuesta</label>
                        {newAnswers.map((answer, index) => (
                             <div key={index} className="flex items-center space-x-2 mb-2">
                                 <input 
                                    type="radio" 
                                    name="correctAnswer" 
                                    id={`answer_radio_${index}`}
                                    checked={correctAnswer === index}
                                    onChange={() => setCorrectAnswer(index)}
                                    className="h-4 w-4 text-sky-600 border-slate-300 focus:ring-sky-500"
                                />
                                <input 
                                    type="text" 
                                    value={answer}
                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-400 transition text-slate-900 dark:text-slate-100"
                                    placeholder={`Respuesta ${index + 1}`}
                                    required
                                />
                             </div>
                        ))}
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Selecciona la respuesta correcta marcando el círculo.</p>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-sky-500 text-white font-bold rounded-lg shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition"
                    >
                        Guardar Pregunta
                    </button>
                </form>

                {/* Existing Questions List */}
                <div className="space-y-3 animate-stagger" style={{ '--stagger-delay': '300ms' } as React.CSSProperties}>
                     <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Preguntas Existentes</h2>
                    {isLoading ? (
                        <p className="text-slate-500 dark:text-slate-400 text-center">Cargando preguntas...</p>
                    ) : (
                        questions.map(q => (
                            <div key={q.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <p className="font-bold text-slate-800 dark:text-slate-100">{q.text}</p>
                                <ul className="mt-2 space-y-1 text-sm">
                                    {q.answers.map((ans, index) => (
                                        <li key={index} className={`pl-4 py-1 rounded ${index === q.correctAnswerIndex ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {ans}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
            </div>
       </div>
    );
};

export default QuestionBankScreen;