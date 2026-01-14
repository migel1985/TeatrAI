export interface LoginResponse {
  ok: boolean;
  message?: string;
  user_id?: number;  // ← Añade user_id opcional
  user_name?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  
    //console.log("Traza: auth.ts lin: 8: Login llamado con:", { email, password }); // <- traza 1
    //console.log(`Llamando a api: ${import.meta.env.VITE_API_URL}/teatrapi/default_login`)
  
    const response = await fetch('http://13.53.89.36:8282/teatrapi/default_login', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) {
        return { ok: false, message: "Usuario y/o contraseña inválidos" };
    }

    // ← PROCESA LA RESPUESTA JSON COMPLETA
    //const data = await response.json();
    return {
        ok: data.success,
        message: data.message,
        user_id: data.user_id,  // ← Extrae el user_id
        user_name: data.nombre
    };
}
