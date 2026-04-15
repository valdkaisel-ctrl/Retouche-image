import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyDpe5qvrGUTXXzCD0gz1X2nsZEZBtK4XzA" 
});

export interface EditImageParams {
  images: string[]; // base64 strings
  prompt: string;
  mimeType?: string;
}

export async function editImage({ images, prompt, mimeType = "image/jpeg" }: EditImageParams) {
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyDpe5qvrGUTXXzCD0gz1X2nsZEZBtK4XzA";
  
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("Clé API manquante. Veuillez ajouter votre clé GEMINI_API_KEY dans le panneau 'Secrets' d'AI Studio.");
  }

  const imageParts = images.map(img => ({
    inlineData: {
      data: img.split(',')[1] || img,
      mimeType
    }
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          ...imageParts,
          { text: prompt }
        ]
      }
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("Gemini n'a pas pu générer de réponse. Essayez de reformuler votre demande.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("L'IA a renvoyé du texte au lieu d'une image : " + (response.text || "Réponse vide."));
  } catch (error: any) {
    if (error.message?.includes("403") || error.status === 403) {
      throw new Error("Erreur 403 : Accès refusé. Vérifiez que votre clé API est correcte et que vous avez accès au modèle 'gemini-2.5-flash-image'.");
    }
    throw error;
  }
}
