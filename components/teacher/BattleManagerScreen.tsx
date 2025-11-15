import React, { useState, useEffect } from 'react';
import { Question, User } from '../../types';
import CreateBattleModal from './CreateBattleModal';
import BattleControlScreen from './BattleControlScreen';
import { getQuestionBank } from '../../api';
import * as battleApi from '../../lib/battleApi';

interface BattleRoom {
    id: string;
    name: string;
    questionCount: number;
    groupCodes: { groupName: string; code: string }[];
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
    const [questionBank, setQuestionBank] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getQuestionBank().then(setQuestionBank);
        loadTeacherBattles();
    }, []);

    const loadTeacherBattles = async () => {
        const battles = await battleApi.getTeacherBattles(teacherId);
        const roomsData: BattleRoom[] = [];

        for (const battle of battles) {
            const groups = await battleApi.getBattleGroups(battle.id);
            roomsData.push({
                id: battle.id,
                name: battle.name,
                questionCount: battle.question_count,
                groupCodes: groups.map(g => ({ groupName: g.group_name, code: g.group_code })),
                status: battle.status,
            });
        }

        setRooms(roomsData);
    };

    const handleCreateBattle = async (
        battleName: string,
        questionCount: number,
        groupCount: number,
        questions: { text: string; answers: string[]; correctIndex: number }[]
    ) => {
        setIsLoading(true);

        const result = await battleApi.createFullBattle(teacherId, battleName, questionCount, groupCount, questions);

        if (!result) {
            alert('Error al crear la batalla');
            setIsLoading(false);
            return;
        }

        setIsCreateModalOpen(false);
        await loadTeacherBattles();
        setIsLoading(false);
    };

    const handleOpenBattle = (battleId: string) => {
        setSelectedBattleId(battleId);
    };

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

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full py-3 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition transform hover:scale-105 flex items-center justify-center animate-stagger"
                    style={{ '--stagger-delay': '200ms' } as React.CSSProperties}
                >
                    <ion-icon name="add-circle-outline" class="mr-2 text-xl"></ion-icon>
                    Crear Nueva Batalla
                </button>

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
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{room.questionCount} preguntas - {room.groupCodes.length} grupos</p>
                                        </div>
                                        <button
                                            onClick={() => handleOpenBattle(room.id)}
                                            className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 rounded-md hover:bg-sky-600 transition-colors flex items-center space-x-1"
                                        >
                                            <ion-icon name="play-outline"></ion-icon>
                                            <span>Abrir</span>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {room.groupCodes.map((group, idx) => (
                                            <div key={idx} className="bg-slate-50 dark:bg-slate-700 p-2 rounded-lg">
                                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{group.groupName}</p>
                                                <p className="font-mono text-sm font-bold text-sky-600 dark:text-sky-400 tracking-widest">{group.code}</p>
                                            </div>
                                        ))}
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
                existingQuestions={questionBank}
                isLoading={isLoading}
            />
        </div>
    );
};

export default BattleManagerScreen;
