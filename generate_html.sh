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
            display: flex;
            flex-direction: column;
        }
        header {
            padding: 8px;
            text-align: center;
            position: relative;
            z-index: 10;
            background: var(--accent-bg);
        }
        header p {
            font-size: 1.2em;
            text-shadow: none;
            font-family: Arial, sans-serif;
            font-weight: normal;
            margin: 3px 0;
            color: #fff;
        }
        nav {
            padding: 5px;
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
            grid-template-columns: repeat(2, 1fr);
            gap: 8px; /* Reducido ligeramente para coherencia */
            padding: 8px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .gallery-item {
            text-align: center;
        }
        .gallery-item a {
            display: block;
            text-decoration: none;
        }
        .gallery-item img {
            max-width: 52%; /* Aumentado un 30% */
            height: auto;
            object-fit: cover;
            border: 1px solid #000;
            border-radius: 6px;
            margin: 0 auto; /* Centra la imagen */
        }
        .gallery-item p {
            font-size: 0.8em; /* Reducido para proporcionalidad */
            margin: 3px 0;
            color: rgb(240, 240, 240);
        }
        .gallery-item button {
            padding: 5px 10px; /* Reducido ligeramente */
            font-size: 12px; /* Reducido para proporcionalidad */
            margin: 3px 2px;
            background: rgb(90,165,25);
            color: #fff;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        }
        .gallery-item button:hover {
            opacity: 0.8;
        }
        footer {
            color: white;
            text-align: center;
            padding: 8px;
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
            <a href="id.html">Licencia</a>
        </nav>
        <p id="t2">Lista de Imágenes de Perfil</p>
    </header>
    <div class="gallery">
EOF

# Busca imágenes en el directorio y genera contenedores con enlaces y botones
for img in "$IMG_DIR"/*.{jpg,jpeg,png,gif}; do
    if [ -f "$img" ]; then
        # Extrae el nombre del archivo (sin ruta ni extensión)
        filename=$(basename "$img")
        name=$(echo "$filename" | sed 's/driver_license_\(.*\)\.\(jpg\|jpeg\|png\|gif\)/\1/')
        # URL base para las imágenes
        img_url="https://convoyrama.github.io/userid/$filename"
        # URL del enlace para la imagen
        link_url="https://convoyrama.github.io/pages/id.html"
        # Código TruckersMP (Markdown con enlace)
        tmp_code="[![ID $name]($img_url)]($link_url)"
        # BBCode
        bbcode="[img]$img_url[/img]"
        # Enlace directo
        direct_link="$img_url"
        # Genera el contenedor para la imagen
        cat << EOF >> "$OUTPUT_HTML"
        <div class="gallery-item">
            <a href="$link_url">
                <img src="$img" alt="ID $name">
            </a>
            <p>$name</p>
            <button onclick="copyToClipboard('$tmp_code')">Copiar TruckersMP</button>
            <button onclick="copyToClipboard('$bbcode')">Copiar BBCode</button>
            <button onclick="copyToClipboard('$direct_link')">Copiar Enlace Directo</button>
        </div>
EOF
    fi
done

# Cierra las etiquetas HTML y agrega JavaScript para copiar al portapapeles
cat << 'EOF' >> "$OUTPUT_HTML"
    </div>
    <footer>
        <small>© LAG'S SPEED - CONVOYRAMA 2025</small>
    </footer>
    <script>
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                alert('¡Código copiado al portapapeles!');
            }).catch(err => {
                console.error('Error al copiar: ', err);
            });
        }
    </script>
</body>
</html>
EOF

echo "Archivo $OUTPUT_HTML generado exitosamente."
