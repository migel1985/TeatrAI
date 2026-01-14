import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import zxcvbn from "zxcvbn";
import { registerUser, RegisterResponse } from "@/services/register"; // ✅ Import service

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
}

export const RegisterModal = ({ open, onClose }: RegisterModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nombre, setNombre] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form
  useEffect(() => {
    if (open) {
      setEmail(""); 
      setPassword(""); 
      setConfirm("");
      setNombre("");
      setPasswordScore(0); 
      setError(null);
    }
  }, [open]);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const score = zxcvbn(value).score;
    setPasswordScore(score);
  };

  const isFormValid = () => {
    return password === confirm && 
           passwordScore >= 1 &&
           email.trim().length > 0 &&
           nombre.trim().length > 0;
  };

  // ✅ USAR SERVICE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    if (passwordScore < 1) {
      setError("Contraseña demasiado débil");
      return;
    }

    if (!email.trim() || !nombre.trim()) {
      setError("Completa todos los campos");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result: RegisterResponse = await registerUser(email, password, nombre);
      
      if (result.ok) {
        alert("✅ ¡Usuario creado! Ahora inicia sesión.");
        onClose();
      } else {
        setError(result.message || 'Error al crear usuario');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = ["Muy débil", "Débil", "Media", "Fuerte", "Muy fuerte"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-600"];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">🎭 Crear cuenta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Tu nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Contraseña segura"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
            />
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${colors[passwordScore]} transition-all`}
                style={{ width: `${(passwordScore + 1) * 20}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {passwordStrength[passwordScore]}
            </p>
          </div>

          <Input
            type="password"
            placeholder="Repite contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading || !isFormValid()}
            className="w-full"
          >
            {loading ? "⏳ Creando..." : "🎉 Crear cuenta"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
