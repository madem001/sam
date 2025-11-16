import React, { useState, useEffect } from 'react';
import { User } from '../../types/types';

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

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name,
      imageUrl: imagePreview,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Editar Perfil</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <ion-icon name="close-outline" class="text-2xl"></ion-icon>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center space-y-2">
            <img src={imagePreview} alt="Vista previa del perfil" className="w-28 h-28 rounded-full object-cover border-4 border-slate-200" />
            <label htmlFor="profile-picture" className="cursor-pointer bg-slate-100 text-slate-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-slate-200 transition">
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
            <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">Nombre</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 transition text-slate-900"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold transition text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-sky-500 text-white font-bold shadow-md hover:bg-sky-600 transition text-sm"
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