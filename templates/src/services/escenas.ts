export interface Escena {
  id: number;
  chapter_id: number;
  query: string;
  response: string;
  sources?: string | null;
  obra_id?: number | null;
  created_at: string;
}

export const getEscenasByCapitulo = async (capituloId: number) => {
  const response = await fetch(`http://13.53.89.36:8282/teatrapi/escenas/${capituloId}`);
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
};
