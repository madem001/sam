import React, { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from 'react';

interface JoinBattleScreenProps {
    onJoinSuccess: () => void;
    onBack: () => void;
    initialCode?: string | null;
    onCodeUsed: () => void;
}

const JoinBattleScreen: React.FC<JoinBattleScreenProps> = ({ onJoinSuccess, onBack, initialCode, onCodeUsed }) => {
    const [code, setCode] = useState<string[]>(Array(6).fill(''));
    const [isScanning, setIsScanning] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (initialCode) {
            const newCode = initialCode.split('');
            setCode(newCode.concat(Array(6 - newCode.length).fill('')));
            // Focus the last input for better UX
            const focusIndex = Math.min(newCode.length, 5);
            inputRefs.current[focusIndex]?.focus();
            onCodeUsed(); // Signal that the code has been used
        }
    }, [initialCode, onCodeUsed]);


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


    const handleJoinWithCode = (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length === 6) {
            console.log(`Joining with code: ${fullCode}`);
            onJoinSuccess();
        } else {
            alert('Por favor, ingresa un código de 6 caracteres.');
        }
    };

    const handleScanQR = () => {
        setIsScanning(true);
        setTimeout(() => {
            console.log('QR code scanned successfully (simulated).');
            setIsScanning(false);
            onJoinSuccess();
        }, 3000);
    };

    const renderScanner = () => (
        <div className="qr-scanner-overlay-glass">
            <h2 className="text-2xl font-bold text-white mb-6">Escanea el Código QR</h2>
            <div className="scanner-viewfinder">
                <div className="w-full h-full bg-slate-900/50 flex items-center justify-center">
                    <p className="text-slate-400">Cámara activa</p>
                </div>
                <div className="scan-corners top-left"></div>
                <div className="scan-corners top-right"></div>
                <div className="scan-corners bottom-left"></div>
                <div className="scan-corners bottom-right"></div>
            </div>
            <p className="mt-6 text-slate-200 text-center max-w-xs">Apunta la cámara al código QR para unirte a la batalla.</p>
            <button 
                onClick={() => setIsScanning(false)}
                className="mt-8 px-8 py-3 bg-red-500/80 text-white font-semibold rounded-full shadow-lg glass-effect hover:bg-red-500/100"
            >
                Cancelar
            </button>
        </div>
    );

    return (
        <div className="relative flex flex-col h-full items-center justify-center p-6 bg-join-battle">
            <button
                onClick={onBack}
                className="absolute top-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-colors shadow-md"
                aria-label="Regresar"
            >
                {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
            </button>
            {isScanning && renderScanner()}
            
            <div className="animate-stagger" style={{ '--stagger-delay': '100ms' } as React.CSSProperties}>
                <div className="battle-portal">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 text-center">Portal de Batalla</h1>
                    <p className="text-slate-600 dark:text-slate-300 mt-2 text-center">Introduce el código o escanea el QR</p>
                    <button
                        onClick={handleScanQR}
                        className="mt-6 w-20 h-20 rounded-full glass-effect flex items-center justify-center text-sky-800 dark:text-sky-300 hover:text-sky-600 dark:hover:text-sky-200"
                        aria-label="Escanear Código QR"
                    >
                        {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                        <ion-icon name="qr-code-outline" class="text-5xl"></ion-icon>
                    </button>
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
                        />
                    ))}
                </div>
                <div className="animate-stagger" style={{ '--stagger-delay': '300ms' } as React.CSSProperties}>
                    <button
                        type="submit"
                        className="w-full mt-6 py-4 text-white font-bold rounded-lg shadow-lg bg-sky-500/80 hover:bg-sky-500/100 dark:bg-sky-500/70 dark:hover:bg-sky-500/90 glass-effect"
                    >
                        Unirse a la Batalla
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JoinBattleScreen;