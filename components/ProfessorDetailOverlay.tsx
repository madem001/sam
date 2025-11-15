import React from 'react';
import { Professor } from '../types';

interface ProfessorDetailOverlayProps {
  professor: Professor;
  onClose: () => void;
}

const ProfessorDetailOverlay: React.FC<ProfessorDetailOverlayProps> = ({ professor, onClose }) => {
  return (
    <div className="professor-detail-overlay" onClick={onClose}>
      <div className="professor-detail-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="close-button">
          &times;
        </button>
        <img src={professor.imageUrl} alt={professor.name} className="professor-detail-image" />
        <div className="p-6">
          <h2 className="text-3xl font-bold text-slate-800">{professor.name}</h2>
          <p className="text-sky-600 font-semibold text-lg">{professor.title}</p>
          
          <div className="mt-6">
            <h3 className="text-xl font-bold text-slate-700 mb-3">Habilidades</h3>
            <div className="space-y-4">
              {professor.skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-600">{skill.name}</span>
                    <span className="text-sm font-bold text-sky-500">{skill.score}%</span>
                  </div>
                  <div className="skill-bar-container">
                    <div className="skill-bar" style={{ width: `${skill.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorDetailOverlay;
