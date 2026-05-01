import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Button, Input } from './ui/Button';
import { Smile, Type, Trash2, Download, Check } from 'lucide-react';

interface CustomizerProps {
  onSave: (dataUrl: string) => void;
  backgroundImage: string;
}

export const Customizer: React.FC<CustomizerProps> = ({ onSave, backgroundImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [text, setText] = useState('');
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 400,
        height: 600,
        backgroundColor: '#f3f4f6',
      });

      // Load background image
      fabric.Image.fromURL(backgroundImage, (img) => {
        const scale = Math.min(
          fabricCanvas.width! / img.width!,
          fabricCanvas.height! / img.height!
        );
        img.set({
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false,
        });
        fabricCanvas.centerObject(img);
        fabricCanvas.add(img);
        fabricCanvas.sendToBack(img);
        fabricCanvas.renderAll();
      }, { crossOrigin: 'anonymous' });

      setCanvas(fabricCanvas);

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, [backgroundImage]);

  const addText = () => {
    if (!canvas || !text) return;
    const textObj = new fabric.IText(text, {
      left: 100,
      top: 100,
      fontFamily: 'Inter',
      fill: color,
      fontSize: 24,
    });
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    setText('');
  };

  const addEmoji = (emoji: string) => {
    if (!canvas) return;
    const emojiObj = new fabric.IText(emoji, {
      left: 150,
      top: 150,
      fontSize: 40,
    });
    canvas.add(emojiObj);
    canvas.setActiveObject(emojiObj);
  };

  const deleteSelected = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    canvas.remove(...activeObjects);
    canvas.discardActiveObject().renderAll();
  };

  const handleSave = () => {
    if (!canvas) return;
    // Export only the relevant area or full canvas
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
    });
    onSave(dataUrl);
  };

  return (
    <div className="flex flex-col md:flex-row gap-16 bg-white vlm-card p-16 relative overflow-visible border border-slate-900/5">
      <div className="absolute -top-8 -right-8 bg-[#E30613] text-white p-6 z-10 hidden lg:block shadow-xl">
        <span className="text-[11px] font-black uppercase tracking-[0.4em]">Estúdio de Criação</span>
      </div>

      <div className="flex-1 flex flex-col items-center">
        <div className="relative group p-8 border border-slate-900/5 bg-[#F9F8F6]">
          <canvas ref={canvasRef} className="shadow-2xl bg-white" id="customizer-canvas" />
          <div className="absolute inset-8 border border-red-500/0 pointer-events-none group-hover:border-red-500/20 transition-all duration-1000"></div>
        </div>
        <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] italic">Renderizador de Precisão . VLM</p>
      </div>

      <div className="w-full md:w-96 flex flex-col gap-16">
        <div>
          <div className="vlm-label">Composição.</div>
          <h3 className="text-6xl font-serif italic mb-6 font-black text-black leading-none">Artesania Digital.</h3>
          <p className="text-[13px] text-gray-700 font-medium uppercase tracking-[0.2em] leading-relaxed italic">Defina a geometria e os elementos da sua peça.</p>
        </div>

        <div className="space-y-12">
          <div>
            <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] block mb-4">Inscrição de Texto</label>
            <div className="flex gap-4">
              <input 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                placeholder="DIGITE AQUI..." 
                className="vlm-input flex-1 text-base h-16"
                id="text-input"
              />
              <Button onClick={addText} variant="primary" id="add-text-btn" className="h-16 w-16 !p-0">
                <Check className="w-6 h-6 stroke-[3px]" />
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Paleta de Tintas</span>
              <div className="border border-slate-900/10 p-2 bg-slate-50">
                <input 
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)} 
                  className="w-20 h-10 cursor-pointer border-none bg-transparent block"
                  title="Escolha a cor"
                  id="color-picker"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] block mb-8">Iconografia Disponível</label>
            <div className="grid grid-cols-5 gap-4">
              {['❤️', '⭐', '🔥', '✨', '🎈', '🎨', '🚀', '🌈', '⚡', '⚽'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="text-2xl h-16 border border-slate-900/5 bg-slate-50 hover:bg-[#E30613] hover:text-white transition-all transform active:scale-95 flex items-center justify-center"
                  id={`emoji-${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 mt-auto pt-12 border-t border-slate-900/5">
          <Button onClick={deleteSelected} variant="ghost" className="text-red-400 hover:bg-red-500/10" id="delete-btn">
            <Trash2 className="w-4 h-4 mr-4" />
            Remover Camada
          </Button>
          <Button onClick={handleSave} className="w-full h-24 text-xl" id="save-btn">
            CONFIRMAR DESIGN
          </Button>
        </div>
      </div>
    </div>
  );
};
