import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface StudentListScreenProps {
  onBack: () => void;
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatar_base64?: string;
  created_at: string;
  isOnline?: boolean;
  lastSeen?: string;
}

const StudentListScreen: React.FC<StudentListScreenProps> = ({ onBack }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadStudents();
    subscribeToPresence();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_base64, created_at')
      .eq('role', 'STUDENT')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando estudiantes:', error);
    } else {
      setStudents(data || []);
    }

    setIsLoading(false);
  };

  const subscribeToPresence = () => {
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: 'user_id',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online = new Set<string>();

        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id) {
              online.add(presence.user_id);
            }
          });
        });

        setOnlineUsers(online);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-900 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-hide">
      <div className="p-6 space-y-6 pb-24">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-all"
            aria-label="Regresar"
          >
            <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
          </button>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-800">Mis Estudiantes</h1>
            <p className="text-slate-500 mt-1">
              {students.length} estudiante{students.length !== 1 ? 's' : ''} registrado{students.length !== 1 ? 's' : ''}
              {' • '}
              {onlineUsers.size} en línea
            </p>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
              <ion-icon name="people-outline" class="text-6xl text-slate-400"></ion-icon>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              No hay estudiantes aún
            </h2>
            <p className="text-slate-600 max-w-md mx-auto">
              Los estudiantes que se registren en la plataforma aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {students.map((student) => {
              const isOnline = onlineUsers.has(student.id);

              return (
                <div
                  key={student.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {student.avatar_base64 ? (
                        <img
                          src={student.avatar_base64}
                          alt={student.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                          {getInitials(student.name)}
                        </div>
                      )}

                      <div
                        className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white ${
                          isOnline ? 'bg-green-500' : 'bg-slate-400'
                        }`}
                        title={isOnline ? 'En línea' : 'Desconectado'}
                      ></div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800 text-lg">
                          {student.name}
                        </p>
                        {isOnline && (
                          <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                            En línea
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{student.email}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        Registrado
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {new Date(student.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentListScreen;
