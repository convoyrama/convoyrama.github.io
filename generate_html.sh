#!/bin/bash

# Directorio donde están las imágenes
IMG_DIR="userid"
# Archivo HTML de salida
OUTPUT_HTML="idlist.html"

# Verifica si el directorio de imágenes existe
if [ ! -d "$IMG_DIR" ]; then
    echo "Error: El directorio $IMG_DIR no existe."
    exit 1
fi

# Crea o sobrescribe el archivo HTML
cat << 'EOF' > "$OUTPUT_HTML"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title id="t1">Convoyrama | Lista de IDs</title>
    <meta name="description" content="Convoyrama - Lista de Imágenes de Perfil">
    <link rel="stylesheet" href="./assets/style.css">
    <link rel="icon" href="./assets/images/favicon.png">
    <link rel="apple-touch-icon" href="./assets/images/favicon.png">
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@700&family=Merriweather:wght@700&family=Roboto:wght@700&family=Lora:wght@700&display=swap" rel="stylesheet">
    <script src="https://twemoji.maxcdn.com/v/latest/twemoji.min.js" crossorigin="anonymous"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }
        header {
            padding: 15px;
            text-align: center;
            position: relative;
            z-index: 10;
            background: var(--accent-bg);
            border-bottom: 1px solid var(--border);
        }
        header p {
            font-size: 1.2em;
            text-shadow: none;
            font-family: Arial, sans-serif;
            font-weight: normal;
            margin: 10px 0;
            color: #fff;
        }
        nav {
            padding: 10px;
            text-align: center;
        }
        nav a, nav a:visited {
            text-decoration: none;
            margin: 0 15px;
            font-size: 1em;
            text-shadow: none;
            color: #fff;
        }
        nav a:hover {
            text-decoration: underline;
        }
        .gallery {
            display: grid;
            grid-template-columns: repeat(2, 1fr); /* 2 columnas */
            gap: 20px; /* Espacio entre imágenes */
            padding: 20px;
            max-width: 1200px; /* Limita el ancho máximo */
            margin: 0 auto; /* Centra la galería */
        }
        .gallery img {
            width: 100%; /* Imágenes ocupan todo el ancho de la columna */
            height: auto; /* Mantiene proporción */
            object-fit: cover; /* Ajusta la imagen */
            border: 1px solid #000; /* Estilo similar al canvas del HTML original */
            border-radius: 6px; /* Suaviza los bordes */
        }
        footer {
            color: white;
            text-align: center;
            padding: 10px;
            position: relative;
            z-index: 10;
            margin-top: auto;
        }
        footer small {
            text-shadow: none;
        }
    </style>
</head>
<body>
    <header>
        <nav>
            <a href="index.html">Home</a>
            <a href="pages/pc.html">Creador de Perfil</a>
            <a href="pages/id.html">Licencia</a>
        </nav>
        <p id="t2">Lista de Imágenes de Perfil</p>
    </header>
    <div class="gallery">
EOF

# Busca imágenes en el directorio y agrega las etiquetas <img>
for img in "$IMG_DIR"/*.{jpg,jpeg,png,gif}; do
    if [ -f "$img" ]; then
        echo "        <img src=\"$img\" alt=\"ID Image\">" >> "$OUTPUT_HTML"
    fi
done

# Cierra las etiquetas HTML
cat << 'EOF' >> "$OUTPUT_HTML"
    </div>
    <footer>
        <small>© LAG'S SPEED - CONVOYRAMA 2025</small>
    </footer>
</body>
</html>
EOF

echo "Archivo $OUTPUT_HTML generado exitosamente."
