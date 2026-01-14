import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TheaterCurtain from '@/components/TheaterCurtain';
import { Theater, Sparkles, Plus, Menu, ChevronLeft, ChevronRight, MessageSquare, Send } from 'lucide-react';
import { Capitulo, getCapitulos, create_capitulo_db } from '@/services/capitulos';
import { hablarConIa } from '@/services/ia';
import { Escena, getEscenasByCapitulo } from '@/services/escenas';

const Obra = () => {
  const location = useLocation();
  const userId = location.state?.user_id;

  // ✅ ESTADOS CAPÍTULOS
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ ESTADOS CHAT IA
  const [selectedCapitulo, setSelectedCapitulo] = useState<Capitulo | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
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
    console.log("🎭 Capítulo seleccionado:", selectedCapitulo?.id);

    if (!selectedCapitulo?.id) {
      setEscenas([]);
      setChatMessages([]);
      return;
    }

    const cargarEscenas = async () => {
      try {
        console.log("📡 Cargando escenas para:", selectedCapitulo.id);
        setEscenasLoading(true);
        const data = await getEscenasByCapitulo(selectedCapitulo.id);
        console.log("✅ Respuesta:", data);
        
        if (data.success && data.escenas?.length > 0) {
          const chatFormat = data.escenas.flatMap((escena: Escena) => [
            { role: 'user' as const, content: escena.query },
            { role: 'ai' as const, content: escena.response }
          ]);
          setEscenas(data.escenas);
          setChatMessages(chatFormat);
        } else {
          setEscenas([]);
          setChatMessages([]);
        }
      } catch (err) {
        console.error('❌ Error:', err);
        setEscenas([]);
        setChatMessages([]);
      } finally {
        setEscenasLoading(false);
      }
    };

    cargarEscenas();
  }, [selectedCapitulo?.id]);

  // 🔧 3. SCROLL AUTOMÁTICO del chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

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
      alert("Miguel: " +   selectedCapitulo.descripcion)
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gold/80 bg-clip-text text-transparent">
              Mis Obras ({capitulos.length})
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gold/80">
            <span>ID: {userId}</span>
            <Button
              onClick={() => setShowCreateModal(true)}
              disabled={chatLoading}
              className="bg-gradient-to-r from-gold to-primary hover:from-gold/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Capítulo
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
                    <span className="text-sm text-muted-foreground">
                      {selectedCapitulo.updated_at}
                    </span>
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
                    chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        <div className={`max-w-2xl p-4 rounded-2xl ${
                          msg.role === 'ai'
                            ? 'bg-card/95 border border-gold/20 shadow-lg'
                            : 'bg-gradient-to-r from-primary to-gold text-primary-foreground shadow-lg'
                        }`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
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
                  <p>
                    {capitulos.length > 0
                      ? "Pulsa el botón + arriba para crear un nuevo capítulo en tu drama"
                      : "Pulsa el botón + arriba para empezar con IA"}
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
