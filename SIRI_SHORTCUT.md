# 🎤 Crear Shortcut de Siri

## Opción 1: Simple (Recomendado para ahora)

Abre la app directamente.

### Pasos:

1. **iPhone**: Abrir app "Atajos"
2. Tocar **"+"** (crear nuevo atajo)
3. Buscar y seleccionar **"Abrir app"**
4. En la opción, seleccionar **"Asistente"** (la app que instalaste)
5. Arriba a la derecha: Tocar los **"..."** → Seleccionar **"Renombrar atajo"**
6. Escribir: **"Asistente"**
7. Tocar **"Listo"**

### Usar:
- Di: **"Oye Siri, Asistente"**
- Siri abre la app

---

## Opción 2: Avanzada (Cuando tengamos backend)

Dicta voz y guarda sin abrir app.

### (Por hacer en Fase 2)

Cuando añadamos API en backend, el Shortcut será:

```
Oye Siri, Asistente
  ↓
Inicia dictado
  ↓
Envía a /api/capture (backend)
  ↓
"Guardado" (audio confirmation)
  ↓
Listo, sin abrir app
```

---

## Opción 3: Con Widget

Futuro (iOS 18+): Shortcut como widget en Home.

---

## Tips

- **Activación rápida**: Puedes crear otro atajo con nombre diferente (ej: "Recordatorio" → abre solo la pestaña de Recordatorios)
- **Automatizaciones**: Atajos también permite ejecutar por hora, locación, etc.

---

**Por ahora: Opción 1 es suficiente. Hoy mismo funciona. 🚀**
