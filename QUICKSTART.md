# ⚡ QUICKSTART — De 0 a funcionando en 10 minutos

## Paso 1: Subir a GitHub (2 min)

Si no tienes GitHub:
1. Ir a https://github.com/signup
2. Crear cuenta (libre)

Si ya tienes GitHub:
1. Crear nuevo repo: https://github.com/new
2. Nombre: `asistente`
3. Descripción: "Mi asistente personal"
4. Public o Private (como quieras)
5. Crear repo

## Paso 2: Subir archivos (2 min)

**Opción A: Con Git (si tienes instalado)**

```bash
# En tu terminal/PowerShell
git clone https://github.com/TU_USUARIO/asistente.git
cd asistente

# Copiar los 5 archivos aquí:
# - index.html
# - app.js
# - service-worker.js
# - manifest.json
# - README.md
# - .gitignore

git add .
git commit -m "Initial commit"
git push
```

**Opción B: Sin Git (más fácil)**

1. En GitHub, abrir tu repo
2. Click "Add file" → "Create new file"
3. Crear `index.html`
4. Copiar y pegar contenido
5. Commit
6. Repetir para: `app.js`, `service-worker.js`, `manifest.json`

## Paso 3: Deploy en Vercel (3 min)

1. Ir a https://vercel.com
2. "Sign up" (gratis)
3. "Import Git Repository"
4. Conectar con GitHub
5. Seleccionar repo `asistente`
6. Click "Deploy"
7. Esperar 30 segundos

**¡Listo!** Tienes URL: `https://asistente-XXXXX.vercel.app`

## Paso 4: Instalar en iPhone (2 min)

1. iPhone: Abrir Safari
2. Ir a tu URL
3. Tocar ⬆️ (compartir)
4. "Añadir a Pantalla de Inicio"
5. Nombre: "Asistente"
6. Añadir

**¡Instalado!** Aparece como app en Home Screen.

## Paso 5: Crear Shortcut Siri (1 min)

1. iPhone: Abrir "Atajos"
2. "+" (crear atajo)
3. Buscar "Abrir app"
4. Seleccionar "Asistente"
5. Arriba: "Scripting" → Renombrar → "Asistente"
6. Listo

Ahora di: **"Oye Siri, Asistente"**

## ¿Listo?

- ✅ App instalada en Home Screen
- ✅ Funciona sin WiFi (offline)
- ✅ Voz funciona
- ✅ Datos guardados localmente
- ✅ Mismo acceso desde Mac (web)

## Próximo paso

Cuando quieras:
1. Interpretación IA ("lunes 24" → fecha automática)
2. Sincronización a cloud
3. Siri avanzado (sin abrir app)

Me lo dices y lo añadimos. Pero por ahora, **funcional 100%**.

---

**¿Preguntas?** Lee `README.md` o avísame.
