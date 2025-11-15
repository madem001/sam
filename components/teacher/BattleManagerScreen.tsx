import React, { useState, useEffect } from 'react';
import { Question, User } from '../../types';
import CreateBattleModal from './CreateBattleModal';
import BattleControlScreen from './BattleControlScreen';
import QuestionBankScreen from './QuestionBankScreen';
import { supabase } from '../../lib/supabase';
import * as battleApi from '../../lib/battleApi';

interface BattleRoom {
    id: string;
    name: string;
    questionCount: number;
    battleCode: string;
    groupCount: number;
    status: 'waiting' | 'active' | 'finished';
}

interface BattleManagerScreenProps {
    students: User[];
    teacherId: string;
    onBack: () => void;
}

const BattleManagerScreen: React.FC<BattleManagerScreenProps> = ({ students, teacherId, onBack }) => {
    const [rooms, setRooms] = useState<BattleRoom[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedBattleId, setSelectedBattleId] = useState<string | null>(null);
    const [showQuestionBank, setShowQuestionBank] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadTeacherBattles();
    }, [teacherId]);

    const loadTeacherBattles = async () => {
        const { data: battles, error } = await supabase
            .from('battles')
            .select('*')
            .eq('teacher_id', teacherId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading battles:', error);
            return;
        }

        const roomsData: BattleRoom[] = [];
        for (const battle of battles || []) {
            const { data: groups } = await supabase
                .from('battle_groups')
                .select('*')
                .eq('battle_id', battle.id);

            roomsData.push({
                id: battle.id,
                name: battle.name,
                questionCount: battle.question_count,
                battleCode: battle.battle_code || 'N/A',
                groupCount: (groups || []).length,
                status: battle.status,
            });
        }

        setRooms(roomsData);
    };

    const handleCreateBattle = async (
        battleName: string,
        questionCount: number,
        groupCount: number,
        questions: { text: string; answers: string[]; correctIndex: number }[],
        studentsPerGroup: number
    ) => {
        setIsLoading(true);

        try {
            const result = await battleApi.createFullBattle(teacherId, battleName, questionCount, groupCount, questions, studentsPerGroup);

            if (!result) {
                alert('Error: No se pudo crear la batalla (resultado vacío)');
                setIsLoading(false);
                return;
            }

            setIsCreateModalOpen(false);
            await loadTeacherBattles();
            setIsLoading(false);
        } catch (error: any) {
            console.error('Error detallado:', error);
            alert('ERROR AL CREAR BATALLA:\n\n' + (error?.message || error?.toString() || 'Error desconocido'));
            setIsLoading(false);
        }
    };

    const handleOpenBattle = (battleId: string) => {
        setSelectedBattleId(battleId);
    };

    if (showQuestionBank) {
        return (
            <QuestionBankScreen
                teacherId={teacherId}
                onBack={() => setShowQuestionBank(false)}
            />
        );
    }

    if (selectedBattleId) {
        return (
            <BattleControlScreen
                battleId={selectedBattleId}
                onBack={() => {
                    setSelectedBattleId(null);
                    loadTeacherBattles();
                }}
            />
        );
    }

    return (
        <div className="relative">
             <button
                onClick={onBack}
                className="absolute top-0 left-0 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                aria-label="Regresar"
            >
                <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
            </button>
            <div className="p-2 space-y-6">
                <div className="animate-stagger text-center" style={{ '--stagger-delay': '100ms' } as React.CSSProperties}>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gestor de Batallas</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Crea y administra las batallas para tus clases.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setShowQuestionBank(true)}
                        className="py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition transform hover:scale-105 flex items-center justify-center"
                    >
                        <ion-icon name="book-outline" class="mr-2 text-xl"></ion-icon>
                        Banco de Preguntas
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="py-3 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 transition transform hover:scale-105 flex items-center justify-center"
                    >
                        <ion-icon name="add-circle-outline" class="mr-2 text-xl"></ion-icon>
                        Crear Batalla
                    </button>
                </div>

                <div className="animate-stagger" style={{ '--stagger-delay': '300ms' } as React.CSSProperties}>
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-3">Batallas Creadas</h2>
                    {rooms.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-8">No hay batallas. ¡Crea una para empezar!</p>
                    ) : (
                        <div className="space-y-4">
                            {rooms.map(room => (
                                <div key={room.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">{room.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{room.questionCount} preguntas - {room.groupCount} grupos</p>
                                        </div>
                                        <button
                                            onClick={() => handleOpenBattle(room.id)}
                                            className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 rounded-md hover:bg-sky-600 transition-colors flex items-center space-x-1"
                                        >
                                            <ion-icon name="play-outline"></ion-icon>
                                            <span>Abrir</span>
                                        </button>
                                    </div>
                                    <div className="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-lg border-2 border-amber-400 dark:border-amber-600">
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">🎮 Código de Batalla (compartir con TODOS los estudiantes):</p>
                                        <p className="font-mono text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-widest text-center">{room.battleCode}</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 text-center">Los estudiantes serán asignados automáticamente a equipos</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <CreateBattleModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateBattle}
                teacherId={teacherId}
                isLoading={isLoading}
            />
        </div>
    );
};

export default BattleManagerScreen;
