import React from 'react';

interface PlaceholderScreenProps {
  title: string;
  icon: string | React.ReactElement;
}

const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ title, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
      <div className="text-6xl mb-4">{icon}</div>
      <h1 className="text-2xl font-bold text-slate-500">{title}</h1>
      <p className="mt-2 text-slate-400">Página en construcción</p>
    </div>
  );
};

export default PlaceholderScreen;