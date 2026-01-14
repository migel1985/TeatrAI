import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TheaterCurtain from '@/components/TheaterCurtain';
import { Theater, Sparkles, Plus, Menu, ChevronLeft, ChevronRight, MessageSquare, Send } from 'lucide-react';
import { Capitulo, getCapitulos, create_capitulo_db } from '@/services/capitulos';
import { hablarConIa } from '@/services/ia';
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Escena, getEscenasByCapitulo, toggleEscenaFavorite } from '@/services/escenas';


// ✅ TIPOS ACTUALIZADOS (añade arriba con tus imports)
interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  escenaId?: string;  // Solo para mensajes de IA
  isFavorite: string;  // Tu campo favs
}


const Obra = () => {
  const location = useLocation();
  const userId = location.state?.user_id;
  const user_name = location.state?.user_name;

  // ✅ ESTADOS CAPÍTULOS
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ ESTADOS CHAT IA
  const [selectedCapitulo, setSelectedCapitulo] = useState<Capitulo | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string, isFavorite:string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // ✅ ESTADOS MODAL
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [nuevoCapituloNombre, setNuevoCapituloNombre] = useState('Nuevo Capítulo');
  const [nuevaCapituloDescripcion, setNuevaCapituloDescripcion] = useState('');

  // ✅ ESTADOS ESCENAS
  const [escenas, setEscenas] = useState<Escena[]>([]);
  const [escenasLoading, setEscenasLoading] = useState(false);

  // Layout states
  const [leftWidth, setLeftWidth] = useState(20);
  const chatRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // ✅ AÑADE ESTOS ESTADOS al inicio (después de estados existentes)
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);


  // 🔧 1. CARGAR CAPÍTULOS al montar componente
  useEffect(() => {
    const cargarCapitulos = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const data = await getCapitulos(userId);
        if (data.success) {
          setCapitulos(data.capitulos || []);
        }
      } catch (err) {
        setError('Error cargando capítulos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarCapitulos();
  }, [userId]);

  // 🔧 2. CARGAR ESCENAS cuando cambia capítulo
  useEffect(() => {
    if (!selectedCapitulo?.id) {
      setEscenas([]);
      setChatMessages([]);
      return;
    }

    const cargarEscenas = async () => {
      try {
        setEscenasLoading(true);
        const data = await getEscenasByCapitulo(selectedCapitulo.id);
        
        if (data.success && data.escenas?.length > 0) {
          // 🔥 AQUÍ CAMBIA: incluye favs y escenaId
          const chatFormat = data.escenas.flatMap((escena: Escena) => [
            { role: 'user' as const, content: escena.query, isFavorite: escena.fav },
            { 
              role: 'ai' as const, 
              content: escena.response,
              escenaId: escena.id,  // ← ID para el favorito
              isFavorite: escena.fav  // ← Tu campo favs
            }
          ]);
          setEscenas(data.escenas);
          setChatMessages(chatFormat as ChatMessage[]);
          
          // 🔥 ESTA PARTE RECUERDA LOS FAVORITOS:
  const favIds = data.escenas
    .filter(escena => escena.favs === "S")  // ← Filtra las que tienen "S"
    .map(escena => escena.id);
  setFavorites(new Set(favIds));  // ← Carga los IDs en el Set
        } else {
          setEscenas([]);
          setChatMessages([]);
        }
      } catch (err) {
        console.error('❌ Error:', err);
      } finally {
        setEscenasLoading(false);
      }
    };

    cargarEscenas();
  }, [selectedCapitulo?.id]);

  // 🔧 3. SCROLL AUTOMÁTICO del chat
  // ✅ SCROLL SIMPLE - Solo cuando AI responde
    useEffect(() => {
      if (chatRef.current && chatLoading) {
        // Esperar un frame para que aparezca el loader
        requestAnimationFrame(() => {
          chatRef.current?.scrollTo({
            top: chatRef.current.scrollHeight - 200, // 200px desde el fondo
            behavior: 'smooth'
          });
        });
      }
    }, [chatLoading]);


    // 🔧 NUEVA FUNCIÓN PARA MANEJAR FAVORITOS
    const toggleFavorite = useCallback(async (escenaId: string) => {
  setFavorites(prev => {
    const newFavorites = new Set(prev);
    if (newFavorites.has(escenaId)) {
      newFavorites.delete(escenaId);
    } else {
      newFavorites.add(escenaId);
    }
    return newFavorites;
  });

  if (userId) {
    try {
      const result = await toggleEscenaFavorite(escenaId, userId);
      
      if (result.success) {
        // ✅ CLAVE: Actualizar chatMessages con el nuevo estado
        setChatMessages(prev => prev.map(msg => 
          msg.escenaId === escenaId 
            ? { ...msg, isFavorite: result.favs }  // ← Actualiza isFavorite
            : msg
        ));
        
        // Actualizar escenas locales también
        setEscenas(prev => prev.map(e => 
          e.id === escenaId ? {...e, favs: result.favs} : e
        ));
      } else {
        // Revertir solo favorites
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          if (newFavorites.has(escenaId)) newFavorites.delete(escenaId);
          else newFavorites.add(escenaId);
          return newFavorites;
        });
      }
    } catch (error) {
      // Revertir
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(escenaId)) newFavorites.delete(escenaId);
        else newFavorites.add(escenaId);
        return newFavorites;
      });
    }
  }
}, [userId]);





    // ✅ AÑADE ESTE useEffect para cargar favoritos al montar
    useEffect(() => {
      // TODO: Llamar API para cargar favoritos del usuario
      // const cargarFavoritos = async () => { ... }
    }, [userId]);

  const handleCrearCapitulo = async () => {
    try {
      setChatLoading(true);
      setError(null);

      const nuevoCapitulo = await create_capitulo_db(
        userId!,
        nuevoCapituloNombre,
        nuevaCapituloDescripcion || undefined
      );

      const capituloData: Capitulo = {
        id: nuevoCapitulo.id,
        titulo: nuevoCapitulo.titulo,
        descripcion: nuevoCapitulo.descripcion,
        escenas: nuevoCapitulo.escenas,
        updated_at: nuevoCapitulo.updated_at
      };

      setCapitulos([capituloData, ...capitulos]);
      setSelectedCapitulo(capituloData);

      const contextoIA = nuevaCapituloDescripcion
        ? `\n\n📝 **Contexto**: ${nuevaCapituloDescripcion}`
        : '';

      setChatMessages([{
        role: 'ai',
        content: `🎭 ¡Capítulo "${nuevoCapituloNombre}" creado!${contextoIA}`
      }]);

      setShowCreateModal(false);
      setNuevoCapituloNombre('Nuevo Capítulo');
      setNuevaCapituloDescripcion('');
    } catch (err) {
      setError('Error creando capítulo');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSelectCapitulo = (capitulo: Capitulo) => {
    console.log("📋 Capítulo completo:", capitulo); // ← Mira TODOS los campos
    setSelectedCapitulo(capitulo);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading || !selectedCapitulo) return;

    const userMessage = { role: 'user' as const, content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    const mensajeEnviado = chatInput;
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await hablarConIa(
        mensajeEnviado,
        selectedCapitulo.descripcion,
        selectedCapitulo.id,
        userId
      );

      if (response.success) {
        setChatMessages(prev => [...prev, {
          role: 'ai' as const,
          content: response.respuesta
        }]);
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setChatMessages(prev => [...prev, {
        role: 'ai' as const,
        content: '❌ Error de conexión con la IA'
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!userId) {
    return <div className="flex items-center justify-center min-h-screen">No autorizado.</div>;
  }

  const scenePairs: { user: ChatMessage; ai: ChatMessage }[] = [];

for (let i = 0; i < chatMessages.length; i += 2) {
  const userMsg = chatMessages[i] as ChatMessage | undefined;
  const aiMsg = chatMessages[i + 1] as ChatMessage | undefined;

  if (!userMsg || !aiMsg) continue;
  if (userMsg.role !== 'user' || aiMsg.role !== 'ai') continue;

  scenePairs.push({ user: userMsg, ai: aiMsg });
}

const filteredPairs = showOnlyFavorites
  ? scenePairs.filter(({ ai }) => ai.escenaId && favorites.has(ai.escenaId))
  : scenePairs;


  return (
    <>
      {/* ✅ MODAL NUEVO CAPÍTULO */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-card/95 border-gold/30 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-gold to-primary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Plus className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold text-gold mb-2">Nuevo Capítulo</CardTitle>
              <p className="text-muted-foreground text-sm">Define título y contexto para tu IA de teatro</p>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div>
                <label className="block text-sm font-semibold text-gold mb-2">Título del capítulo</label>
                <Input
                  value={nuevoCapituloNombre}
                  onChange={(e) => setNuevoCapituloNombre(e.target.value)}
                  placeholder="Ej: 'Acto I - La tragedia del rey loco'"
                  className="h-14 text-lg border-2 border-gold/30 focus:border-gold focus-visible:ring-2 ring-gold/50 font-semibold"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gold mb-2">
                  Descripción / Contexto <span className="text-xs text-gold/70">(opcional)</span>
                </label>
                <textarea
                  value={nuevaCapituloDescripcion}
                  onChange={(e) => setNuevaCapituloDescripcion(e.target.value)}
                  rows={4}
                  className="w-full p-4 border-2 border-gold/30 focus:border-gold focus-visible:ring-2 ring-gold/50 rounded-xl resize-vertical text-base font-light leading-relaxed bg-muted/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNuevoCapituloNombre('Nuevo Capítulo');
                    setNuevaCapituloDescripcion('');
                  }}
                  className="flex-1 border-gold/50 hover:bg-gold/10 h-12 text-sm font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCrearCapitulo}
                  disabled={!nuevoCapituloNombre.trim() || chatLoading}
                  className="flex-1 bg-gradient-to-r from-gold to-primary hover:from-gold/90 font-bold h-12 text-lg shadow-lg"
                >
                  {chatLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Creando...
                    </>
                  ) : (
                    '¡Crear Capítulo!'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* LAYOUT PRINCIPAL */}
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-gold/50 to-primary/80 backdrop-blur-sm border-b border-gold/30 p-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <Theater className="w-8 h-8 text-primary-foreground" />
           
          </div>
          <div className="flex items-center gap-3">
          <Button
              onClick={() => setShowCreateModal(true)}
              disabled={chatLoading}
              className="bg-gradient-to-r from-gold to-primary hover:from-gold/90"
            >
              <Plus className="w-5 h-5" />
          </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gold/80">
            <span>Hola <b>{user_name}</b>!</span>
            <Button
              onClick={() => navigate("/")}
              disabled={chatLoading}
              size="icon"
              className="w-12 h-12 rounded-full hover:bg-gold/20 hover:scale-110 transition-all border-gold/30"
            >
              <LogOut className="w-6 h-6 text-gold" />
            </Button>
          </div>
          
        </div>

        {/* Cuerpo dividido */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar con scroll independiente */}
          <div
            className="bg-card/95 backdrop-blur-sm border-r border-gold/20 flex flex-col h-full"
            style={{ width: `${leftWidth}%`, minWidth: '200px' }}
          >
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-gold">Capítulos ({capitulos.length})</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex items-center justify-center h-64">Cargando...</div>
              ) : error ? (
                <div className="text-red-400 text-center p-8">{error}</div>
              ) : capitulos.length === 0 ? (
                <div className="text-center text-muted-foreground p-8">Sin capítulos</div>
              ) : (
                capitulos.map(capitulo => (
                  <div
                    key={capitulo.id}
                    onClick={() => handleSelectCapitulo(capitulo)}
                    className={`p-4 border rounded-lg mb-2 cursor-pointer transition-all ${
                      selectedCapitulo?.id === capitulo.id
                        ? 'border-gold/50 bg-gold/10 shadow-gold/20'
                        : 'border-gold/30 hover:border-gold/50 hover:bg-gold/5'
                    }`}
                  >
                    <div className="font-semibold text-lg line-clamp-1">{capitulo.titulo}</div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{capitulo.updated_at}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Área chat con scroll separado */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-muted/30 to-background/50">
            {selectedCapitulo ? (
              <>
                {/* Header del capítulo */}
                <div className="p-6 border-b border-gold/20 bg-gradient-to-r from-transparent via-card/80 to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gold/20 rounded-xl">
                      <MessageSquare className="w-5 h-5 text-gold" />
                      <span className="font-semibold text-gold">{selectedCapitulo.titulo}</span>
                    </div>
                    <div className="flex items-center gap-4">
                    
                    {/* 🔥 BOTÓN FILTRAR SOLO CAQUITAS */}
                    <div className="flex items-center gap-4">
                    
                    <button
                      onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                        showOnlyFavorites
                          ? 'bg-gold/30 text-gold border-2 border-gold/50 shadow-lg'
                          : 'bg-muted/50 text-muted-foreground hover:bg-gold/20 hover:text-gold'
                      }`}
                    >
                      <span className="text-lg">💩</span>
                      <span>({favorites.size})</span>
                    </button>
                    
                    <span className="text-sm text-muted-foreground">{selectedCapitulo.updated_at}</span>
                  </div>
                    
                  </div>
                  </div>
                </div>

                {/* Área de mensajes - ÚNICA Y CORRECTA */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={chatRef}>
                  {escenasLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-gold/70">Cargando escenas del capítulo...</div>
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="flex items-center justify-center p-12 text-muted-foreground">
                      <div className="text-center">
                        <MessageSquare className="w-16 h-16 mx-auto mb-6 opacity-30" />
                        <h3 className="text-xl font-bold mb-2">Sin conversaciones aún</h3>
                        <p>Escribe tu primer mensaje para empezar</p>
                      </div>
                    </div>
                  ) : (
                    // desde aquí
                    // ✅ MODIFICA el render de mensajes 
                  filteredPairs.map(({ user, ai }, pairIdx) => (
    <React.Fragment key={ai.escenaId ?? `pair-${pairIdx}`}>
      {/* USER */}
      <div className="flex justify-end">
        <div className="max-w-2xl p-4 rounded-2xl bg-gradient-to-r from-primary to-gold text-primary-foreground shadow-lg">
          <p className="whitespace-pre-wrap leading-relaxed">{user.content}</p>
        </div>
      </div>

      {/* AI */}
      <div className="flex">
        <div className="max-w-2xl p-4 rounded-2xl bg-card/95 border border-gold/20 shadow-lg">
          <p className="whitespace-pre-wrap leading-relaxed">{ai.content}</p>
          {ai.escenaId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(ai.escenaId!);
              }}
              className={`mt-4 p-3 rounded-xl flex items-center gap-2 transition-all duration-300 text-sm font-bold ml-auto block group/fav ${
                ai.isFavorite==="S"
                  ? 'bg-gradient-to-r from-yellow-400 via-gold to-yellow-500 text-primary-foreground shadow-2xl shadow-yellow-500/50 border-4 border-yellow-400/50 hover:from-yellow-300 hover:to-gold hover:shadow-2xl hover:shadow-yellow-400/70 hover:scale-110 hover:rotate-3 ring-4 ring-yellow-400/30'
                  : 'bg-gradient-to-r from-muted/70 to-card/80 text-muted-foreground/80 border border-muted/50 hover:from-gold/20 hover:to-yellow-50 hover:text-gold hover:border-gold/50 hover:shadow-md hover:shadow-gold/20 hover:scale-105'
              }`}
              title={
                favorites.has(ai.escenaId!)
                  ? 'Quitar de favoritos 💔'
                  : '¡Mucha mierda! ⭐'
              }
            >
              <span className="text-lg">💩</span>
            </button>
          )}
        </div>
      </div>
    </React.Fragment>
  ))

                  )}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-card/95 p-4 rounded-2xl border border-gold/20">
                        <div className="flex items-center gap-2 text-gold/70">
                          <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                          IA escribiendo...
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <Card className="border-t border-gold/20 m-6">
                  <CardContent className="p-0">
                    <div className="flex gap-2 p-4">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Habla con la IA de teatro..."
                        className="flex-1 border-2 border-gold/30 focus:border-gold"
                        disabled={chatLoading}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || chatLoading}
                        className="bg-gradient-to-r from-gold to-primary hover:from-gold/90 px-6"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12 text-muted-foreground">
                <div className="text-center max-w-md">
                  <MessageSquare className="w-16 h-16 mx-auto mb-6 opacity-30" />
                  <h3 className="text-2xl font-bold mb-2">
                    {capitulos.length > 0
                      ? "¿Qué tienes hoy entre guiones?"
                      : "¡Crea tu primer capítulo!"}
                  </h3>
                  <p style={{ whiteSpace: 'pre-line' }}>
                  {capitulos.length > 0
                    ? "No te quedes en las patas y sal a escena...\n\nPulsa el botón + de más arriba para crear\nun nuevo capítulo en tu drama"
                    : "Pulsa el botón + arriba para empezar con IA"
                  }
                </p>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Obra;
