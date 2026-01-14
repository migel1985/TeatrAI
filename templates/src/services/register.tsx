export interface RegisterResponse {
  ok: boolean;
  message?: string;
  user_id?: number;
  error?: string;
}

export async function registerUser(email: string, password: string, nombre: string): Promise<RegisterResponse> {
  console.log("Llamando a registerUser con:", { email, nombre });

  const response = await fetch("http://13.53.89.36:8282/teatrapi/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, nombre }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { 
      ok: false, 
      message: data.error || data.message || "Fallo al registrar el usuario" 
    };
  }

  return {
    ok: data.success,
    message: data.message,
    user_id: data.user_id,
  };
}
