import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Sparkles, 
  Shirt, 
  Mountain, 
  Layers, 
  Loader2, 
  Download, 
  Trash2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { cn } from './lib/utils';
import { editImage } from './lib/gemini';

interface ImageState {
  file: File | null;
  preview: string | null;
}

export default function App() {
  const [images, setImages] = useState<ImageState[]>([{ file: null, preview: null }]);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images];
        newImages[index] = { file, preview: reader.result as string };
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const addImageSlot = () => {
    if (images.length < 2) {
      setImages([...images, { file: null, preview: null }]);
    }
  };

  const removeImageSlot = (index: number) => {
    if (images.length > 1) {
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
    } else {
      setImages([{ file: null, preview: null }]);
    }
  };

  const handleEdit = async () => {
    if (images.some(img => !img.preview)) {
      setError("Veuillez télécharger au moins une image.");
      return;
    }
    if (!prompt.trim()) {
      setError("Veuillez entrer une instruction pour l'IA.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const base64Images = images.map(img => img.preview!);
      const editedImage = await editImage({
        images: base64Images,
        prompt: prompt
      });
      setResult(editedImage);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de l'édition.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImages([{ file: null, preview: null }]);
    setResult(null);
    setPrompt('');
    setError(null);
  };

  const useAsInput = () => {
    if (result) {
      setImages([{ file: null, preview: result }]);
      setResult(null);
      setPrompt('');
    }
  };

  const presets = [
    { id: 'clothes', icon: Shirt, label: 'Changer de vêtements', prompt: 'Change les vêtements de la personne dans cette photo pour un costume élégant et réaliste.' },
    { id: 'background', icon: Mountain, label: 'Changer le fond', prompt: 'Change le fond de cette photo pour un paysage de montagne enneigée réaliste.' },
    { id: 'merge', icon: Layers, label: 'Fusionner les photos', prompt: 'Fusionne ces deux photos de manière réaliste et harmonieuse.' },
  ];

  const applyPreset = (p: string) => {
    setPrompt(p);
    if (p.includes("deux photos") && images.length < 2) {
      addImageSlot();
    }
  };

  return (
    <div className="min-h-screen bg-bg text-white font-sans selection:bg-accent/30">
      {/* Navbar */}
      <nav className="px-6 md:px-12 py-6 md:py-8 flex justify-between items-center">
        <div className="font-extrabold text-lg md:text-xl tracking-tighter uppercase">IMAGINE.AI</div>
        <div className="hidden md:flex gap-8 text-[13px] font-semibold uppercase tracking-widest text-text-dim">
          <span className="cursor-pointer hover:text-white transition-colors">Galerie</span>
          <span className="cursor-pointer hover:text-white transition-colors">Modèles</span>
          <span className="cursor-pointer hover:text-white transition-colors">Tarifs</span>
          <span className="cursor-pointer hover:text-white transition-colors">Compte</span>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 md:px-12 pb-12 grid lg:grid-cols-[1fr_1.2fr] gap-8 md:gap-12 items-center min-h-[calc(100vh-100px)]">
        
        {/* Hero Side */}
        <section className="space-y-4 md:space-y-6 py-8 lg:py-0">
          <div className="inline-block px-3 py-1.5 border border-accent text-accent rounded-sm text-[10px] md:text-[12px] font-bold uppercase tracking-wider">
            Propulsé par le réalisme
          </div>
          <h1 className="text-huge">
            REMAKE<br />REALITY.
          </h1>
          <p className="text-base md:text-lg text-text-dim max-w-md leading-relaxed">
            Changez de vêtements, changez de décor et fusionnez vos photos avec un réalisme parfait.
          </p>
          <div className="flex gap-6 md:gap-8 pt-2 md:pt-4">
            <div>
              <div className="text-[9px] md:text-[10px] uppercase text-text-dim tracking-widest mb-1">Moteur</div>
              <div className="text-xs md:text-sm font-bold">GEMINI 2.5 FLASH</div>
            </div>
            <div>
              <div className="text-[9px] md:text-[10px] uppercase text-text-dim tracking-widest mb-1">Qualité</div>
              <div className="text-xs md:text-sm font-bold">ULTRA RÉALISTE</div>
            </div>
          </div>
        </section>

        {/* Editor Side */}
        <section className="glass-panel rounded-[24px] flex flex-col overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] min-h-[500px] md:min-h-[600px]">
          {/* Editor Header */}
          <div className="p-4 md:p-6 border-b border-glass-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center gap-2">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.prompt)}
                  className={cn(
                    "px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-[12px] font-semibold transition-all border border-glass-border cursor-pointer",
                    prompt === p.prompt ? "bg-white text-bg border-white" : "hover:bg-white/10"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="text-[10px] md:text-[12px] text-text-dim font-mono">PROJET: 041-A_EDIT</div>
          </div>

          {/* Viewport / Workspace */}
          <div className="flex-1 p-4 md:p-6 flex flex-col gap-4 md:gap-6">
            <div className="flex-1 min-h-[300px] bg-[#111] rounded-2xl relative overflow-hidden flex items-center justify-center border border-glass-border">
              {result ? (
                <div className="w-full h-full flex flex-col">
                  <img src={result} alt="Result" className="flex-1 w-full object-contain" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={useAsInput}
                      className="px-4 py-2 bg-accent text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
                    >
                      Continuer l'édition
                    </button>
                    <button 
                      onClick={handleReset}
                      className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-white/20 transition-all"
                    >
                      Nouveau
                    </button>
                  </div>
                </div>
              ) : (
                <div className={cn(
                  "grid gap-3 w-full h-full p-3",
                  images.length > 1 ? "grid-cols-2" : "grid-cols-1"
                )}>
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group h-full">
                      <div className={cn(
                        "w-full h-full rounded-xl border border-dashed border-glass-border transition-all flex flex-col items-center justify-center overflow-hidden bg-white/5",
                        img.preview ? "border-transparent" : "hover:bg-white/10"
                      )}>
                        {img.preview ? (
                          <>
                            <img src={img.preview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-black/40 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                              <label className="cursor-pointer p-3 bg-white text-bg rounded-full shadow-xl hover:scale-110 transition-transform">
                                <Upload className="w-5 h-5" />
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => handleFileChange(e, idx)}
                                />
                              </label>
                              <button 
                                onClick={() => removeImageSlot(idx)}
                                className="p-3 bg-red-500 text-white rounded-full shadow-xl hover:scale-110 transition-transform"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center gap-2 text-center p-4 w-full h-full justify-center">
                            <Upload className="w-6 h-6 text-accent" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Upload {idx + 1}</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, idx)}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Overlay UI for Prompt */}
              <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[92%] bg-black/80 backdrop-blur-xl border border-glass-border p-3 md:p-4 rounded-xl flex flex-col sm:flex-row gap-3 md:gap-4 items-center shadow-2xl">
                <input 
                  type="text" 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Décrivez les modifications..."
                  className="w-full sm:flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-text-dim"
                />
                <button 
                  onClick={handleEdit}
                  disabled={loading}
                  className="w-full sm:w-auto btn-gradient px-6 py-2.5 rounded-lg text-[11px] md:text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loading ? "Génération..." : "Générer"}
                </button>
              </div>
            </div>

            {/* Stats Footer */}
            <div className="flex flex-wrap gap-4 md:gap-8 px-2">
              <div className="flex-1 min-w-[80px]">
                <div className="text-[9px] uppercase text-text-dim tracking-widest mb-1">Résolution</div>
                <div className="text-xs md:text-sm font-semibold">4K ULTRA</div>
              </div>
              <div className="flex-1 min-w-[80px]">
                <div className="text-[9px] uppercase text-text-dim tracking-widest mb-1">Complexité</div>
                <div className="text-xs md:text-sm font-semibold">MAX</div>
              </div>
              {result && (
                <a 
                  href={result} 
                  download="imagine-ai-edit.png"
                  className="flex items-center gap-2 text-accent hover:text-white transition-colors text-xs md:text-sm font-bold uppercase tracking-widest ml-auto"
                >
                  <Download className="w-4 h-4" />
                  Save
                </a>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mx-6 mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 text-[12px] font-medium items-center">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="px-12 py-8 border-t border-glass-border flex justify-between items-center opacity-30 text-[11px] font-medium uppercase tracking-widest">
        <div>Imagine Studio AI © 2026</div>
        <div>Powered by Gemini 2.5 Flash</div>
      </footer>
    </div>
  );
}
