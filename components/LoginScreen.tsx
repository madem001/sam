import React, { useState } from 'react';
import { UserRole, AuthData } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (authData: AuthData) => void;
}

const RobotMascot: React.FC<{ focus: 'idle' | 'email' | 'password' }> = ({ focus }) => {
  const isEmailFocused = focus === 'email';
  const isPasswordFocused = focus === 'password';

  return (
    <div className={`relative w-48 h-48 mx-auto robot-idle-animation ${isPasswordFocused ? 'robot-peek-animation' : ''}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Shadow */}
        <ellipse cx="100" cy="180" rx="60" ry="10" className="fill-black/10 dark:fill-black/20" />
        
        {/* Body */}
        <rect x="50" y="80" width="100" height="90" rx="20" className="fill-slate-200 dark:fill-slate-700" />
        <rect x="60" y="100" width="80" height="50" rx="10" className="fill-slate-50 dark:fill-slate-500" />
        
        {/* Head */}
        <rect x="65" y="30" width="70" height="60" rx="15" className="fill-slate-200 dark:fill-slate-700" />
        
        {/* Antenna */}
        <line x1="100" y1="30" x2="100" y2="15" strokeWidth="4" strokeLinecap="round" className="stroke-slate-400 dark:stroke-slate-500" />
        <circle cx="100" cy="12" r="5" className="fill-sky-400 dark:fill-sky-500" />
        
        {/* Eyes */}
        <g>
          <circle cx="85" cy="60" r="12" className="fill-slate-600 dark:fill-slate-900" />
          <circle cx="115" cy="60" r="12" className="fill-slate-600 dark:fill-slate-900" />
          <g className="pupil">
            <circle cx="85" cy="60" r="5" fill="#fff" className="robot-pupil" />
            <circle cx="115" cy="60" r="5" fill="#fff" className="robot-pupil" />
          </g>
        </g>
        
        {/* Arms */}
        <g>
            {/* Left Arm */}
            <g className="robot-arm" style={{ transform: isEmailFocused ? 'translateY(25px) translateX(-20px) rotate(-60deg)' : 'translateY(0) rotate(0)', transformOrigin: '70px 110px' }}>
                 <rect x="25" y="100" width="30" height="15" rx="7.5" className="fill-slate-400 dark:fill-slate-600" />
                 <circle cx="20" cy="107.5" r="12" className="fill-slate-300 dark:fill-slate-500" />
            </g>
             {/* Right Arm */}
            <g className="robot-arm" style={{ transform: isEmailFocused ? 'translateY(25px) translateX(20px) rotate(60deg)' : 'translateY(0) rotate(0)', transformOrigin: '130px 110px' }}>
                <rect x="145" y="100" width="30" height="15" rx="7.5" className="fill-slate-400 dark:fill-slate-600" />
                <circle cx="180" cy="107.5" r="12" className="fill-slate-300 dark:fill-slate-500" />
            </g>
        </g>
      </svg>
    </div>
  );
};

const FloatingInput: React.FC<{id: string, label: string, type?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onFocus: () => void, onBlur: () => void, required?: boolean}> = 
({ id, label, type = "text", value, onChange, onFocus, onBlur, required = false }) => (
    <div className="floating-label-container">
        <input
            id={id}
            type={type}
            placeholder=" "
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            className="floating-input w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-lg border-2 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 transition text-slate-900 dark:text-slate-100"
            required={required}
        />
        <label htmlFor={id} className="floating-label">
            {label}
        </label>
    </div>
);


const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>(UserRole.Student);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [skills, setSkills] = useState('');
  const [cycles, setCycles] = useState('');
  const [focus, setFocus] = useState<'idle' | 'email' | 'password'>('idle');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdminLoginToggle = () => {
    setIsAdminLogin(!isAdminLogin);
    setView('login');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdminLogin) {
        if (email === 'eddmi@gmail.com' && password === 'app2025*') {
            onLoginSuccess({ role: UserRole.Admin });
        } else {
            alert('Credenciales de administrador incorrectas.');
        }
        return;
    }
    
    const authData: AuthData = { role };
    if (view === 'register') {
        authData.name = name;
        if (imagePreview) {
          authData.imageUrl = imagePreview;
        }
        if (role === UserRole.Teacher) {
            authData.subjects = [subject];
            authData.skills = skills.split(',').map(s => s.trim());
            authData.cycles = cycles.split(',').map(c => c.trim());
        }
    }

    onLoginSuccess(authData);
  };
  
  const getTitle = () => {
    if (isAdminLogin) return 'Acceso Admin';
    return view === 'login' ? '¡Bienvenido!' : 'Crea tu Cuenta';
  };

  return (
    <div className="flex flex-col h-full p-6 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      <div className="flex-grow flex flex-col justify-center">
        <div className="animate-stagger" style={{ '--stagger-delay': '100ms' } as React.CSSProperties}>
          <RobotMascot focus={focus} />
        </div>
        
        <div key={view}>
            <div className="text-center my-6 animate-stagger" style={{ '--stagger-delay': '200ms' } as React.CSSProperties}>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{getTitle()}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Ingresa para continuar tu aventura.</p>
            </div>

            {!isAdminLogin && (
                <div className="mb-6 w-full max-w-sm mx-auto animate-stagger" style={{ '--stagger-delay': '300ms' } as React.CSSProperties}>
                    <div className="relative flex p-1 bg-slate-200 dark:bg-slate-800 rounded-full">
                        <span 
                            className="absolute top-1 bottom-1 w-1/2 bg-white dark:bg-slate-700 rounded-full shadow transition-gooey z-0"
                            style={{
                                transform: role === UserRole.Student ? 'translateX(0%)' : 'translateX(100%)'
                            }}
                        ></span>
                        <button type="button" onClick={() => setRole(UserRole.Student)} className={`relative z-10 w-1/2 rounded-full py-2 text-sm font-bold transition-colors ${role === UserRole.Student ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`}>Estudiante</button>
                        <button type="button" onClick={() => setRole(UserRole.Teacher)} className={`relative z-10 w-1/2 rounded-full py-2 text-sm font-bold transition-colors ${role === UserRole.Teacher ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`}>Docente</button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto animate-stagger" style={{ '--stagger-delay': '400ms' } as React.CSSProperties}>
                <div className="space-y-6">
                    {view === 'register' && (
                        <>
                            <div className="flex flex-col items-center space-y-3">
                                <img 
                                    src={imagePreview || 'https://ui-avatars.com/api/?name=?&background=e2e8f0&color=64748b&bold=true&size=128'} 
                                    alt="Vista previa del perfil" 
                                    className="w-24 h-24 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700"
                                />
                                <label htmlFor="profile-picture" className="cursor-pointer bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition">
                                    Cambiar Foto
                                </label>
                                <input 
                                    id="profile-picture" 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleImageChange}
                                />
                            </div>
                            <FloatingInput id="name" label="Nombre Completo" value={name} onChange={(e) => setName(e.target.value)} onFocus={() => {}} onBlur={() => {}} required />
                        </>
                    )}
                    <FloatingInput id="email" label="Correo Electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocus('email')} onBlur={() => setFocus('idle')} required />
                    <FloatingInput id="password" label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocus('password')} onBlur={() => setFocus('idle')} required />

                    {view === 'register' && role === UserRole.Teacher && (
                       <>
                            <FloatingInput id="subject" label="Materia Principal" value={subject} onChange={(e) => setSubject(e.target.value)} onFocus={() => {}} onBlur={() => {}} required />
                            <FloatingInput id="skills" label="Habilidades (separadas por comas)" value={skills} onChange={(e) => setSkills(e.target.value)} onFocus={() => {}} onBlur={() => {}} required />
                            <FloatingInput id="cycles" label="Ciclos que Enseña" value={cycles} onChange={(e) => setCycles(e.target.value)} onFocus={() => {}} onBlur={() => {}} required />
                       </>
                    )}
                </div>
                <button
                type="submit"
                className={`w-full mt-6 py-3 text-white font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition transform hover:scale-105 ${isAdminLogin ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-400' : 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-400'}`}
                >
                {view === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                </button>
            </form>
        </div>
      </div>
      
      <div className="flex-shrink-0 pt-4">
        {!isAdminLogin && (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {view === 'login' ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
            <button
                onClick={() => setView(view === 'login' ? 'register' : 'login')}
                className="ml-2 font-semibold text-sky-600 dark:text-sky-400 hover:underline focus:outline-none"
            >
                {view === 'login' ? 'Regístrate' : 'Inicia Sesión'}
            </button>
            </p>
        )}
         <button 
            onClick={handleAdminLoginToggle} 
            className="absolute top-4 right-4 p-3 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 hover:text-indigo-700 dark:hover:text-indigo-400 transition"
            aria-label="Acceso de Administrador"
        >
            {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
            <ion-icon name={isAdminLogin ? "person-circle-outline" : "shield-outline"} class="text-2xl"></ion-icon>
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;