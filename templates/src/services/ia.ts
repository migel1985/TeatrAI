export interface IaResponse {
  success: boolean;
  respuesta: string;
  error?: string;
}

export async function hablarConIa(
  mensaje: string,
  descCapitulo: string, 
  capituloId?: number, 
  userId?: number
): Promise<IaResponse> {
  alert(descCapitulo)
  const response = await fetch('http://13.53.89.36:8282/teatrapi/hablar_con_ia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      mensaje,
      descCapitulo, 
      capitulo_id: capituloId, 
      user_id: userId 
    })
  });

  if (!response.ok) {
    throw new Error('Error conectando con la IA');
  }
  
  return await response.json();
}
