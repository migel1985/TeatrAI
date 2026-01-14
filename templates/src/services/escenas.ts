export interface Escena {
  id: number;
  chapter_id: number;
  query: string;
  response: string;
  favs: "S" | "N" | null;  // ← Importante
  sources?: string | null;
  obra_id?: number | null;
  created_at: string;
}

// ✅ Extiende el mensaje del chat
interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  escenaId?: string;  // Solo para AI responses
  isFavorite?: boolean;
}

export const getEscenasByCapitulo = async (capituloId: number) => {
  const response = await fetch(`http://13.53.89.36:8282/teatrapi/escenas/${capituloId}`);
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
};


export const toggleEscenaFavorite = async (escenaId: string, userId: string): Promise<{success: boolean, favs: string}> => {
  try {
    const response = await fetch(`http://13.53.89.36:8282/teatrapi/toggle_fav_escena/${escenaId}/${userId}`, {
      method: 'PATCH'
    });
    
    if (!response.ok) throw new Error('Error toggle favorite');
    
    const data = await response.json();
    return { success: data.success, favs: data.favs };  // Ahora "S"/"N"
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return { success: false, favs: "N" };
  }
};
