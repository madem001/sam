import React from 'react';
import { Notification } from '../types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onJoinBattle: (code: string) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose, notifications, onJoinBattle }) => {

    const handleCopyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            alert(`Código "${code}" copiado.`);
        } catch (err) {
            alert('No se pudo copiar el código.');
        }
    };

    const handleJoinClick = (code: string) => {
        onJoinBattle(code);
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 dark:bg-black/40 z-50"
                    onClick={onClose}
                    aria-hidden="true"
                ></div>
            )}
            
            {/* Panel */}
            <div className={`notifications-panel ${isOpen ? 'open' : ''} flex flex-col`}>
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Notificaciones</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                        {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                        <ion-icon name="close-outline" class="text-2xl"></ion-icon>
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="text-center p-8 text-slate-500 dark:text-slate-400 h-full flex flex-col items-center justify-center">
                            {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                            <ion-icon name="notifications-off-outline" class="text-5xl mb-4"></ion-icon>
                            <p className="font-semibold">No hay notificaciones</p>
                            <p className="text-sm">Las invitaciones a batallas aparecerán aquí.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                            {notifications.map(notif => (
                                <li key={notif.id} className={`p-4 ${notif.read ? 'opacity-60' : ''}`}>
                                    <div className="flex items-start space-x-3">
                                        <div className="text-xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 p-2 rounded-full mt-1">
                                            {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                                            <ion-icon name={notif.type === 'battle_invite' ? 'flash-outline' : 'chatbubble-outline'}></ion-icon>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{notif.message}</p>
                                            {notif.type === 'battle_invite' && notif.payload && (
                                                <div className="mt-3 flex items-center space-x-2">
                                                    <button onClick={() => handleCopyCode(notif.payload!.roomCode)} className="flex-1 text-xs font-semibold bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition flex items-center justify-center space-x-1">
                                                        {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                                                        <ion-icon name="copy-outline"></ion-icon>
                                                        <span>Copiar Código</span>
                                                    </button>
                                                    <button onClick={() => handleJoinClick(notif.payload!.roomCode)} className="flex-1 text-xs font-semibold bg-sky-500 text-white px-3 py-1.5 rounded-md hover:bg-sky-600 transition flex items-center justify-center space-x-1">
                                                        {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                                                        <ion-icon name="enter-outline"></ion-icon>
                                                        <span>Unirse</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationsPanel;