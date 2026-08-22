# 🎯 Asistente Personal

Tu asistente digital minimalista. Captura con voz, organiza sin fricción, vive sin estrés.

## ✨ Características

- **Captura por voz** — "Asistente, añadir carne a la compra"
- **Completamente offline** — Funciona sin internet (IndexedDB local)
- **Instalable en Home** — Abre como app nativa en iPhone
- **Siri Shortcut** — Activación por comandos de voz
- **Organización flexible** — HOY, PRÓXIMOS, POR ORDENAR, PROYECTOS
- **Interpretación automática** — Entiende "mañana", "lunes 24", "esta semana"
- **Sincronización futura** — Pronto: backup a cloud + interpretación IA

## 🚀 Deploy en 5 minutos

### 1. Crear repo en GitHub

```bash
# Clonar o crear repo
git init asistente
cd asistente

# Copiar los archivos aquí
# index.html, app.js, service-worker.js, manifest.json, README.md

# Push a GitHub
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/asistente.git
git push -u origin main
```

### 2. Deploy a Vercel

**Opción A: Automático (recomendado)**
1. Ir a https://vercel.com
2. "New Project"
3. "Import Git Repository"
4. Conectar GitHub
5. Seleccionar repo `asistente`
6. Deploy (1 click)

**Resultado:** Tu app en `https://asistente-XXXXX.vercel.app`

### 3. Instalar en iPhone

1. Abrir Safari en iPhone
2. Ir a tu URL de Vercel
3. Tocar ⬆️ → "Añadir a Pantalla de Inicio"
4. Nombre: "Asistente"
5. ✓ Instalado

(Se abre como app nativa, sin barra de Safari)

### 4. Crear Shortcut de Siri

**Opción A: Siri abre la app**

1. Abrir "Atajos" en iPhone
2. "+" → crear nuevo atajo
3. Buscar "Abrir app"
4. Seleccionar "Asistente" (la que instalaste)
5. Arriba: "Renombrar" → "Asistente"
6. Listo

Ahora di: **"Oye Siri, Asistente"** → Se abre

**Opción B: Siri ejecuta captura (avanzado)**

Cuando añadamos backend, podrás hacer que Siri dicte y guarde sin abrir la app. Por ahora, la opción A es suficiente.

## 📱 Uso diario

**En iPhone:**
- Abre la app desde Home
- Toca el 🎤 o escribe
- "Asistente, carne a la compra"
- O: "Asistente, llamar a María mañana"

**En Mac/Web:**
- Misma URL en navegador
- Funciona igual (responsive)
- Los datos se sincronizan automáticamente

## 🏗️ Estructura

```
asistente/
├── index.html          # UI completa (HTML + CSS embebido)
├── app.js              # Lógica (IndexedDB, voz, vistas)
├── service-worker.js   # Offline (caché automático)
├── manifest.json       # PWA (instalable)
└── README.md           # Este archivo
```

## 🔧 Funcionalidad local

- **IndexedDB** — Almacenamiento local (sin servidor)
- **Web Speech API** — Reconocimiento de voz (iOS Safari OK)
- **Service Worker** — Funciona offline
- **Cero JavaScript externo** — Todo embebido

## 🚧 Roadmap

### Próximo (Fase 1-2):
- [ ] Backend Flask simple
- [ ] Interpretación IA (OpenAI)
- [ ] Sincronización a cloud
- [ ] API para Siri avanzado

### Futuro (Fase 3-4):
- [ ] Integración Apple Reminders
- [ ] Integración Apple Calendar
- [ ] Notificaciones push
- [ ] Apple Watch
- [ ] Widgets

## 💾 Datos

- **Almacenamiento**: IndexedDB en tu iPhone (100% privado)
- **Backup**: Descargable como JSON (botón futuro)
- **Sincronización**: Opcional cuando tenga backend

## 📞 Soporte

- Error de micrófono: Verifica permisos en Configuración → Privacidad → Micrófono
- No se instala: Usa Safari (otros navegadores no permiten PWA en iOS)
- Datos perdidos: IndexedDB se borra si limpias cache del navegador

## ⚙️ Configuración avanzada

### Cambiar idioma
En `app.js`, línea ~160:
```js
this.recognition.lang = 'es-ES'; // Cambiar a tu idioma
```

### Personalizar proyectos
En `app.js`, función `extractProject()`:
```js
const projects = ['Tu Proyecto', 'Otro Proyecto', ...];
```

### Temas
El diseño soporta modo oscuro automático. Edita variables CSS en `index.html` para cambiar colores.

## 🎨 Diseño

- **Paleta**: Beige, marrón, verde oscuro
- **Tipografía**: System font (rápido, nativo)
- **Responsive**: Mobile-first (funciona en cualquier tamaño)
- **Accesibilidad**: WCAG compliant

## 📄 Licencia

Open source. Úsalo, modifica, comparte.

---

**Hecho para Ana. Con ❤️ y sin complicaciones.**
