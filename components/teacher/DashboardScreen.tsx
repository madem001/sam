import React from 'react';
import { TeacherScreen } from '../../types';

interface DashboardScreenProps {
  navigateTo: (screen: TeacherScreen) => void;
}

const ActionCard: React.FC<{ title: string; description: string; icon: React.ReactElement; onClick: () => void, delay: string }> = ({ title, description, icon, onClick, delay }) => (
  <button onClick={onClick} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-sky-300 dark:hover:border-sky-500 transition-all text-left w-full flex items-center space-x-4 animate-stagger" style={{ '--stagger-delay': delay } as React.CSSProperties}>
    <div className="text-3xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 p-3 rounded-full flex items-center justify-center w-16 h-16">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm">{description}</p>
    </div>
  </button>
);

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigateTo }) => {
  return (
    <div className="p-2 space-y-6">
      <div className="animate-stagger" style={{ '--stagger-delay': '100ms' } as React.CSSProperties}>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Panel de Docente</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Gestiona tus clases y actividades.</p>
      </div>

      <div className="space-y-4">
        <ActionCard 
          title="Crear Batalla"
          description="Inicia una nueva competencia para tus estudiantes."
          icon={<ion-icon name="flash-outline"></ion-icon>}
          onClick={() => navigateTo(TeacherScreen.BattleManager)}
          delay="200ms"
        />
        <ActionCard 
          title="Banco de Preguntas"
          description="Crea y edita las preguntas para las batallas."
          icon={<ion-icon name="book-outline"></ion-icon>}
          onClick={() => navigateTo(TeacherScreen.QuestionBank)}
          delay="300ms"
        />
        <ActionCard 
          title="Ver Estudiantes"
          description="Revisa el progreso y los logros de tu clase."
          icon={<ion-icon name="people-outline"></ion-icon>}
          onClick={() => navigateTo(TeacherScreen.StudentList)}
          delay="400ms"
        />
      </div>
    </div>
  );
};

export default DashboardScreen;