import React from 'react';

interface BattleLobbyScreenProps {
    onBack: () => void;
}

const BattleLobbyScreen: React.FC<BattleLobbyScreenProps> = ({ onBack }) => {
  const teamMembers = [
    { name: 'Tú', avatar: 'https://picsum.photos/seed/user123/100/100' },
    { name: 'Ana', avatar: 'https://picsum.photos/seed/user2/100/100' },
    { name: 'Luis', avatar: 'https://picsum.photos/seed/user3/100/100' },
    { name: 'Eva', avatar: 'https://picsum.photos/seed/user4/100/100' },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center h-full text-center p-4 bg-slate-50 dark:bg-slate-800">
        <button
            onClick={onBack}
            className="absolute top-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-600/80 transition-colors shadow-md"
            aria-label="Regresar"
        >
            {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
            <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
        </button>

      <div className="animate-stagger" style={{ '--stagger-delay': '100ms' } as React.CSSProperties}>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">Sala de Batalla</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Esperando al profesor y a los demás jugadores...</p>
      </div>
      
      <div className="w-full max-w-sm animate-stagger" style={{ '--stagger-delay': '200ms' } as React.CSSProperties}>
        <h2 className="text-lg font-semibold text-sky-700 dark:text-sky-400 mb-4">Tu Equipo</h2>
        <div className="grid grid-cols-2 gap-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="flex flex-col items-center p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600">
              <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-200">{member.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 animate-stagger" style={{ '--stagger-delay': '300ms' } as React.CSSProperties}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 dark:border-sky-400"></div>
        <p className="mt-4 text-sm text-slate-400 dark:text-slate-500">Conectando...</p>
      </div>
    </div>
  );
};

export default BattleLobbyScreen;