import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TheaterCurtain from '@/components/TheaterCurtain';
import { Sparkles, Theater, Star } from 'lucide-react';
import { login } from "@/services/auth";
import { useNavigate } from "react-router-dom";


const Index = () => {
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
      console.log("User ID:", result.user_id);
      localStorage.setItem('user_id', result.user_id.toString());
      // ✅ PASA EL DATO ASÍ:
      navigate("/obra", { state: { user_id: result.user_id } });
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
          <Theater className="w-10 h-10 text-primary" />
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-gold to-primary bg-clip-text text-transparent">
            TeatrAI
          </h1>
          <Sparkles className="w-8 h-8 text-gold animate-pulse" />
        </div>
        <p className="text-xl md:text-2xl text-gold font-semibold mt-4 flex items-center justify-center gap-2">
          <Star className="w-5 h-5" />
          Consigue mierda en tu próxima función
          <Star className="w-5 h-5" />
        </p>
      </div>

      {/* Theater stage with curtains */}
      <TheaterCurtain>
        <Card className="bg-card/95 backdrop-blur-sm border-gold/30 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              ¡Mucha Mierda! 💩
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-2 leading-relaxed">
              ¿Sabías que decir "Mucha mierda" viene del siglo XVIII? Cuantos más carruajes 
              de caballos aparcaban frente al teatro, más caca en la calle... y más público 
              dentro. ¡Así que desearte mierda es desearte un lleno absoluto!
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">o continúa con</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full border-gold/50 hover:bg-gold/10 hover:border-gold transition-all py-5"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Regístrate con Google
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              ¿Aún no tienes cuenta?{' '}
              <a href="#" className="text-gold hover:text-gold-light underline transition-colors">
                Únete a la compañía
              </a>
            </p>
          </CardContent>
        </Card>
      </TheaterCurtain>

    </div>
  );
};

export default Index;
