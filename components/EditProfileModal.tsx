import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updatedData: { name: string; imageUrl: string }) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [name, setName] = useState(user.name);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(user.imageUrl);

  useEffect(() => {
    // Reset state when user prop changes
    setName(user.name);
    setImagePreview(user.imageUrl);
    setImageFile(null);
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name,
      imageUrl: imagePreview, // In a real app, you'd upload the file and get a new URL
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm m-4 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Editar Perfil</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
            <ion-icon name="close-outline" class="text-2xl"></ion-icon>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <img src={imagePreview} alt="Vista previa del perfil" className="w-32 h-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-600" />
            <label htmlFor="profile-picture" className="cursor-pointer bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition">
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

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Nombre</label>
            <input 
              id="name"
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 transition text-slate-900 dark:text-slate-100"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold transition"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-6 py-2 rounded-lg bg-sky-500 text-white font-bold shadow-md hover:bg-sky-600 transition"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;