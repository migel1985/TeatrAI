import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TheaterCurtain from '@/components/TheaterCurtain';
import { Sparkles, Theater, Star } from 'lucide-react';
import { login } from "@/services/auth";
import { useNavigate } from "react-router-dom";
import { RegisterModal } from "@/components/RegisterModal";

const Index = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {  // ← Añade el parámetro event
  e.preventDefault();  // ← ESTO EVITA LA RECARGA
  
  setLoading(true);
  setError(null);
  
  try {
    const result = await login(email, password);
    if (result.ok && result.user_id) {
      localStorage.setItem('user_id', result.user_id.toString());
      localStorage.setItem('user_name', result.user_name.toString());
      navigate("/obra", { state: { user_id: result.user_id, user_name: result.user_name,  } });
    } else {
      setError(result.message || "Error en el login");
    }
  } catch (error) {
    setError("Error de conexión. Inténtalo de nuevo.");
  } finally {
    setLoading(false);
  }
};



  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Spotlight effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-spotlight/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-spotlight/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Main title */}
      <div className="text-center mb-8 z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Theater className="w-20 h-20 text-primary" />
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-gold to-primary bg-clip-text text-transparent">
            TeatrAI
          </h1>
          <Theater className="w-20 h-20 text-primary" />
        </div>
        <p className="text-xl md:text-2xl text-gold font-semibold mt-4 flex items-center justify-center gap-2">
          <Star className="w-5 h-5" />
            Consigue tu mierda (o sold out 😆) en tu próxima función
          <Star className="w-5 h-5" />
        </p>
      </div>

      {/* Theater stage with curtains */}
      <TheaterCurtain>
        <Card className="bg-card/95 backdrop-blur-sm border-gold/30 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              🎭 ¡Mucha mierda! 💩
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-2 leading-relaxed">
              ¿Sabías que esta expresión tan teatral viene del siglo XVIII? En aquella época, cuanto más público acudía a una función, más carruajes de caballos se acumulaban frente al teatro… y, claro, más mierda quedaba en la calle. Así que desear “mucha mierda” era —y sigue siendo— desearte un éxito total, con el teatro a rebosar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/50 border-border focus:border-gold transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Tu contraseña secreta"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted/50 border-border focus:border-gold transition-colors"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5"
              >
                {loading ? "Validando..." : "Entrar al Escenario"}
              </Button>
              {error && (
                <p className="text-center text-sm text-red-500 mt-2">
                  {error}
                </p>
              )}
            </form>

               <p className="text-center text-sm text-muted-foreground mt-4">
              ¿Aún no tienes un personaje?{" "}
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="text-gold hover:text-gold-light underline transition-colors"
              >
                ¡Sube al escenario y hazte con uno!
              </button>
            </p>

      <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} />

          </CardContent>
        </Card>
      </TheaterCurtain>

    </div>
  );
};

export default Index;
