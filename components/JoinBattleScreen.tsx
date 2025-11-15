import React, { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import * as battleApi from '../lib/battleApi';
import StudentBattleScreen from './StudentBattleScreen';

interface JoinBattleScreenProps {
    onBack: () => void;
    studentId: string;
    studentName: string;
}

const JoinBattleScreen: React.FC<JoinBattleScreenProps> = ({ onBack, studentId, studentName }) => {
    const [code, setCode] = useState<string[]>(Array(6).fill(''));
    const [isJoining, setIsJoining] = useState(false);
    const [joinedGroup, setJoinedGroup] = useState<{ groupId: string; battleId: string } | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value.toUpperCase();
        if (/^[A-Z0-9]$/.test(value) || value === '') {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);

            if (value !== '' && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && code[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').toUpperCase().slice(0, 6);
        const newCode = [...code];
        for (let i = 0; i < 6; i++) {
            newCode[i] = pastedData[i] || '';
        }
        setCode(newCode);
        const lastFullIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastFullIndex]?.focus();
    };

    const handleJoinWithCode = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            alert('Por favor, ingresa un código de 6 caracteres.');
            return;
        }

        setIsJoining(true);
        console.log('🎮 Intentando unirse con código:', fullCode);

        try {
            const result = await battleApi.joinBattleWithCode(fullCode, studentId, studentName);
            console.log('📦 Resultado de joinBattleWithCode:', result);

            if (result.success && result.group) {
                console.log('✅ Unido exitosamente al grupo:', result.group.group_name);
                console.log('🎯 Configurando joined group - GroupID:', result.group.id, 'BattleID:', result.group.battle_id);
                setJoinedGroup({
                    groupId: result.group.id,
                    battleId: result.group.battle_id,
                });
            } else {
                console.log('❌ Join falló:', result.message);
                alert(result.message || 'Error al unirse a la batalla');
            }
        } catch (error: any) {
            console.error('❌ Error joining battle:', error);
            alert(error.message || 'No se pudo unir a la batalla');
        }

        setIsJoining(false);
    };

    if (joinedGroup) {
        return (
            <StudentBattleScreen
                groupId={joinedGroup.groupId}
                battleId={joinedGroup.battleId}
                studentId={studentId}
                studentName={studentName}
                onBack={() => {
                    setJoinedGroup(null);
                    setCode(Array(6).fill(''));
                }}
            />
        );
    }

    return (
        <div className="relative flex flex-col h-full items-center justify-center p-6 bg-join-battle">
            <button
                onClick={onBack}
                className="absolute top-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-colors shadow-md"
                aria-label="Regresar"
            >
                <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
            </button>

            <div className="animate-stagger" style={{ '--stagger-delay': '100ms' } as React.CSSProperties}>
                <div className="battle-portal">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 text-center">Unirse a Grupo</h1>
                    <p className="text-slate-600 dark:text-slate-300 mt-2 text-center">Introduce el código de tu grupo</p>
                    <div className="mt-6 w-20 h-20 rounded-full glass-effect flex items-center justify-center text-sky-800 dark:text-sky-300 mx-auto">
                        <ion-icon name="people-outline" class="text-5xl"></ion-icon>
                    </div>
                </div>
            </div>

            <form onSubmit={handleJoinWithCode} className="w-full max-w-sm mt-10">
                <div
                    className="code-inputs-container animate-stagger"
                    style={{ '--stagger-delay': '200ms' } as React.CSSProperties}
                    onPaste={handlePaste}
                >
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleInputChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="code-input-glass"
                            disabled={isJoining}
                        />
                    ))}
                </div>
                <div className="animate-stagger" style={{ '--stagger-delay': '300ms' } as React.CSSProperties}>
                    <button
                        type="submit"
                        className="w-full mt-6 py-4 text-white font-bold rounded-lg shadow-lg bg-sky-500/80 hover:bg-sky-500/100 dark:bg-sky-500/70 dark:hover:bg-sky-500/90 glass-effect disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isJoining}
                    >
                        {isJoining ? 'Uniéndose...' : 'Unirse al Grupo'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JoinBattleScreen;
