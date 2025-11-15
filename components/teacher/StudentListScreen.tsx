import React from 'react';
import PlaceholderScreen from '../PlaceholderScreen';
import { Student } from '../../types';

interface StudentListScreenProps {
    onBack: () => void;
}

const MOCK_STUDENTS: Student[] = [
    { id: '1', name: 'Ana García', level: 14, imageUrl: 'https://picsum.photos/seed/student1/100/100' },
    { id: '2', name: 'Luis Pérez', level: 11, imageUrl: 'https://picsum.photos/seed/student2/100/100' },
    { id: '3', name: 'Eva Morales', level: 15, imageUrl: 'https://picsum.photos/seed/student3/100/100' },
    { id: '4', name: 'Carlos Ruiz', level: 9, imageUrl: 'https://picsum.photos/seed/student4/100/100' },
];

const StudentListScreen: React.FC<StudentListScreenProps> = ({ onBack }) => {
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
            <div className="p-2 space-y-4">
                <div className="animate-stagger text-center" style={{ '--stagger-delay': '100ms' } as React.CSSProperties}>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Mis Estudiantes</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Sigue el rendimiento de tu clase.</p>
                </div>
                <div className="space-y-3">
                    {MOCK_STUDENTS.map((student, index) => (
                        <div 
                            key={student.id} 
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center space-x-4 animate-stagger"
                            style={{ '--stagger-delay': `${200 + index * 100}ms` } as React.CSSProperties}
                        >
                            <img src={student.imageUrl} alt={student.name} className="w-12 h-12 rounded-full" />
                            <div className="flex-grow">
                                <p className="font-bold text-slate-700 dark:text-slate-200">{student.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Nivel {student.level}</p>
                            </div>
                            <div className="text-right">
                                 <span className="px-3 py-1 text-xs font-semibold text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-900/50 rounded-full">
                                    Nivel {student.level}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
       </div>
    );
};

export default StudentListScreen;