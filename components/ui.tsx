import React from 'react';
import { icons, LucideProps } from 'lucide-react';

// FIX: Changed from interface to type alias to potentially help TypeScript
// correctly resolve the inherited properties from LucideProps, like 'className'.
type IconProps = {
  name: keyof typeof icons;
} & LucideProps;


export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = icons[name];
  if (!LucideIcon) {
    // FIX: Wrapping `name` in String() to prevent a runtime error when the icon name is a symbol.
    console.warn(`Icon with name "${String(name)}" not found.`);
    return null;
  }
  return <LucideIcon {...props} />;
};

export const Logo = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Legal Chicks Empowerment Network Logo"
    >
        <circle cx="32" cy="32" r="32" fill="var(--color-primary)" />
        <text
            x="50%"
            y="50%"
            dominantBaseline="central"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="26"
            fontWeight="bold"
            fill="white"
        >
            LCE
        </text>
    </svg>
);


export const Loader: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
  </div>
);

export const FullScreenLoader: React.FC = () => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="flex flex-col items-center gap-4">
            <Logo className="h-16 w-16 animate-pulse" />
            <p className="text-stone-700 font-semibold">Loading Network...</p>
        </div>
    </div>
);


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
        >
          <Icon name="X" className="w-6 h-6" />
        </button>
        <div className="p-8 sm:p-10">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
};

// New Alert and Confirm Modals for better UX
interface AlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

export const AlertModal: React.FC<AlertDialogProps> = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                <h3 className="text-lg font-bold text-stone-900 mb-4">{title}</h3>
                <p className="text-stone-600 mb-6">{message}</p>
                <button onClick={onClose} className="btn btn-primary w-full py-2">OK</button>
            </div>
        </div>
    );
};

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export const ConfirmModal: React.FC<ConfirmDialogProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                <h3 className="text-lg font-bold text-stone-900 mb-4">{title}</h3>
                <p className="text-stone-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="btn bg-slate-200 text-slate-700 hover:bg-slate-300 py-2">Cancel</button>
                    <button onClick={onConfirm} className="btn btn-dark py-2">Confirm</button>
                </div>
            </div>
        </div>
    );
};