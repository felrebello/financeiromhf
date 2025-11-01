import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { ScannedReceiptData } from '../types';

interface ScanReceiptProps {
  onScanComplete: (data: ScannedReceiptData) => void;
  onCancel: () => void;
}

const ScanReceipt: React.FC<ScanReceiptProps> = ({ onScanComplete, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
      }
    };
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
        setError("Falha ao capturar imagem.");
        setIsLoading(false);
        return;
    }
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    
    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };

        const textPart = {
            text: "Analise este recibo e extraia o valor total, a descrição (nome da loja ou itens principais) e a data da transação. Responda em formato JSON.",
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        amount: { type: Type.NUMBER, description: "Valor total da transação" },
                        description: { type: Type.STRING, description: "Nome da loja ou breve descrição dos itens" },
                        date: { type: Type.STRING, description: "Data da transação no formato AAAA-MM-DD" },
                    },
                    required: ["amount", "description", "date"],
                },
            },
        });

        const result = JSON.parse(response.text);
        
        if (result && result.amount && result.description && result.date) {
             onScanComplete(result);
        } else {
             setError("Não foi possível extrair as informações do recibo. Tente novamente com uma imagem mais nítida.");
        }

    } catch (err) {
      console.error("Gemini API error:", err);
      setError("Ocorreu um erro ao analisar a imagem. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center z-50">
      <div className="relative w-full max-w-lg bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4 text-center">Escanear Nota Fiscal</h2>
        {error && <p className="text-red-400 bg-red-900 p-3 rounded-md text-center mb-4">{error}</p>}
        <div className="relative w-full aspect-video bg-gray-900 rounded-md overflow-hidden">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
              <p className="text-white mt-4">Analisando imagem...</p>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden"></canvas>
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={handleCapture}
            disabled={isLoading || !stream}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed transition duration-300"
          >
            {isLoading ? 'Processando...' : 'Capturar e Analisar'}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full disabled:opacity-50 transition duration-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanReceipt;
