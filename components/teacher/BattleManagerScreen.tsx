import React, { useState, useEffect } from 'react';
import { Question, User } from '../../types';
import CreateBattleModal from './CreateBattleModal';
import InviteStudentsModal from './InviteStudentsModal';
import { getQuestionBank } from '../../api';

interface BattleRoom {
    id: string;
    name: string;
    teamACode: string;
    teamBCode: string;
}

interface BattleManagerScreenProps {
    students: User[];
    onInvite: (studentIds: string[], roomCode: string, battleName: string) => void;
    onBack: () => void;
}

const BattleManagerScreen: React.FC<BattleManagerScreenProps> = ({ students, onInvite, onBack }) => {
    const [rooms, setRooms] = useState<BattleRoom[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<BattleRoom | null>(null);
    const [questionBank, setQuestionBank] = useState<Question[]>([]);

    useEffect(() => {
        getQuestionBank().then(setQuestionBank);
    }, []);

    const generateRandomCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const handleCreateRoom = (battleName: string, battleQuestions: Question[]) => {
        const newRoom: BattleRoom = {
            id: new Date().toISOString(),
            name: battleName,
            teamACode: generateRandomCode(),
            teamBCode: generateRandomCode(),
        };
        setRooms([newRoom, ...rooms]);
        setIsCreateModalOpen(false);
        console.log('Battle created with questions:', battleQuestions);
    }

    const handleOpenInviteModal = (room: BattleRoom) => {
        setSelectedRoom(room);
        setIsInviteModalOpen(true);
    };

    const handleSendInvites = (studentIds: string[]) => {
        if (selectedRoom) {
            // In a real scenario, you might let the teacher choose which code to send,
            // or send a generic invite link. For now, we'll send Team A's code.
            onInvite(studentIds, selectedRoom.teamACode, selectedRoom.name);
        }
        setIsInviteModalOpen(false);
        setSelectedRoom(null);
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
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gestor de Batallas</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Crea y administra las salas de batalla para tus clases.</p>
                </div>
                
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full py-3 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition transform hover:scale-105 flex items-center justify-center animate-stagger"
                    style={{ '--stagger-delay': '200ms' } as React.CSSProperties}
                >
                    {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                    <ion-icon name="add-circle-outline" class="mr-2 text-xl"></ion-icon>
                    Crear Nueva Sala de Batalla
                </button>

                <div className="animate-stagger" style={{ '--stagger-delay': '300ms' } as React.CSSProperties}>
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-3">Salas Activas</h2>
                    {rooms.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-8">No hay salas activas. ¡Crea una para empezar!</p>
                    ) : (
                        <div className="space-y-4">
                            {rooms.map(room => (
                                <div key={room.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">{room.name}</p>
                                        <button 
                                            onClick={() => handleOpenInviteModal(room)}
                                            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/50 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900/80 transition-colors flex items-center space-x-1"
                                        >
                                            {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                                            <ion-icon name="person-add-outline"></ion-icon>
                                            <span>Invitar</span>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Equipo Alfa: <span className="font-mono text-lg font-bold text-sky-600 dark:text-sky-400 tracking-widest">{room.teamACode}</span></p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Equipo Beta: <span className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">{room.teamBCode}</span></p>
                                        </div>
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
                onCreate={handleCreateRoom}
                existingQuestions={questionBank}
            />
            {selectedRoom && (
                 <InviteStudentsModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    students={students}
                    onInvite={handleSendInvites}
                    battleName={selectedRoom.name}
                />
            )}
        </div>
    );
};

export default BattleManagerScreen;