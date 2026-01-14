export interface Capitulo {
  id: number;
  nombre: string;
  escenas: number;
  ultima_edicion: string;
  descripcion: string;
}

export interface CapitulosResponse {
  success: boolean;
  capitulos: Capitulo[];
}

export async function  getCapitulos(userId: number): Promise<CapitulosResponse> {
  const response = await fetch(`http://13.53.89.36:8282/teatrapi/get_user_capitulos/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error('Error cargando capítulos');
  }
  return await response.json();
}

// ← AÑADE ESTA FUNCIÓN
export async function create_capitulo_db(
  userId: number, 
  titulo: string, 
  descripcion?: string  // ← AÑADIDO
): Promise<Capitulo> {
  const response = await fetch(`http://13.53.89.36:8282/teatrapi/create_capitulo_db/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, descripcion })  // ← ENVÍA DESCRIPCIÓN
  });

  if (!response.ok) {
    throw new Error('Error creando capítulo');
  }
  
  const data = await response.json();
  return data.capitulo;
}
