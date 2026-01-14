# 🎭 TeatrAI  
**Plataforma de Teatro Amateur con IA**

TeatrAI es una plataforma web diseñada para teatristas aficionados que necesitan preparar talleres, ensayos y guiones teatrales mediante **IA generativa estructurada**.  
El sistema organiza las interacciones como **capítulos** y **escenas**, simulando el flujo real de escritura teatral y permitiendo destacar las mejores respuestas de la IA mediante un sistema de favoritos.

---

## 🧩 Concepto

TeatrAI funciona como un **cuaderno de escritura teatral asistido por IA**:

- Cada **capítulo** define un contexto o personalidad de la IA  
- Cada **escena** es una interacción pregunta–respuesta  
- Las mejores respuestas se pueden marcar como **favoritas**  
- Se pueden filtrar solo los mejores resultados  

Esto permite construir guiones, escenas o ejercicios de forma **iterativa, estructurada y persistente**.

---

## 🏗️ Arquitectura

Arquitectura de **microservicios desplegados en AWS**:

```text
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   TeatrAI UI    │◄──►│     TeatrAPI     │◄──►│   PostgreSQL DB   │
│ (React / TSX)   │    │  (Flask / Python)│    │      (RDS)       │
└─────────────────┘    └──────────────────┘    └──────────────────┘
        AWS ECS                 AWS ECS                  AWS RDS


🧠 Backend – TeatrAPI
Stack

Flask 3.0.3

Flask-CORS 5.0.0

SQLAlchemy 2.0.35

PostgreSQL (psycopg2-binary 2.9.9)

LangChain + Groq

httpx 0.27.0

python-dotenv 1.0.1

Endpoints
Método	Endpoint	Función
POST	/auth/register	Crear usuario
POST	/auth/login	Login
POST	/capitulos	Crear capítulo
GET	/capitulos/:user_id	Listar capítulos
POST	/escenas	Crear escena
GET	/escenas/:capitulo_id	Listar escenas
PATCH	/escenas/:id/fav	Toggle favorito
🎨 Frontend – TeatrAI UI
Stack

React 18 + TypeScript

React Router DOM

shadcn/ui

Lucide React

Funcionalidades

Sidebar con capítulos

Chat de escenas

Modal para crear capítulos

Sistema de favoritos

UI optimista

Scroll automático

## 🗃️ Modelo de Datos
Usuarios
usuarios(id, user_id, google_id, email, nombre, password_hash, rol, teatro_grupo, fecha_registro)

Obras
obras(id, titulo, autor, genero, dificultad, duracion_minutos, num_personajes, sinopsis)

Capítulos
chapters(id, usuario_id, titulo, descripcion, created_at, updated_at)

Escenas
scenes(id, chapter_id, query, response, sources, obra_id, fav, created_at)

Feedback
feedback(id, scene_id, rating, feedback_comment, created_at)

Favoritos
favorites(id, scene_id, title, created_at)

🚀 Características

Conversaciones organizadas como capítulos y escenas

Favoritos para destacar respuestas

Contexto persistente por capítulo

Estética teatral

Interacción en tiempo real

☁️ Despliegue AWS

ECS + EC2 → Backend Flask

ECS + EC2 → Frontend React (Nginx)

RDS → PostgreSQL

Route53 → DNS + Load Balancer

CloudWatch → Logs

🔄 Flujo
1. Usuario se registra o hace login
2. Crea un capítulo con contexto IA
3. Hace una pregunta (escena)
4. IA responde vía Groq/LangChain
5. Se guarda en BD
6. El usuario marca favoritos
7. Filtra escenas favoritas

🔮 Roadmap
Implementado

Favoritos

Microservicios

Despliegue AWS

Pendiente

CAPTCHA

Google OAuth

