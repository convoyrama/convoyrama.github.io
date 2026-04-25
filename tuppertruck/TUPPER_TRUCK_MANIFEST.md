# TupperTruck Manifest (v1.0)
> **"Envasa tu camión, cómpralo cuando quieras"**

TupperTruck es una utilidad de ingeniería diseñada para capturar la configuración exacta de un camión desde un savegame de ATS/ETS2 y empaquetarlo en un Mod Standalone (.scs) para el concesionario.

## Componentes Heredados de PitStop (Backend Rust)
- **`decrypt.rs`**: Módulo de interfaz con `SII_Decrypt.dll` para lectura de archivos binarios.
- **`editor.rs`**: Localizador automático de perfiles y partidas guardadas en Documentos.
- **`SII_Decrypt.dll`**: Motor de decriptación (AlexKERNEL v1.5.x).

## Arquitectura Específica
A diferencia de PitStop, TupperTruck no necesita:
1.  Servidor de Telemetría (PLP).
2.  Plugin in-game.
3.  Conexión WebSocket.

## Requisitos de Implementación (Nuevos)
1.  **Mapeador de Accesorios**: Regex para extraer `data_path` del `game.sii`.
2.  **Generador de Definiciones**: Escritor de archivos `.sii` de tipo `vehicle_accessory_data`.
3.  **Empaquetador ZIP-Store**: Lógica para generar el archivo `.scs` sin compresión.

---
**TupperTruck Engineering - 2026**
