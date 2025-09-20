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
            padding: 10px; /* Reducido para menos espacio */
            text-align: center;
            position: relative;
            z-index: 10;
            background: var(--accent-bg);
            border-bottom: none; /* Eliminamos borde para evitar líneas */
        }
        header p {
            font-size: 1.2em;
            text-shadow: none;
            font-family: Arial, sans-serif;
            font-weight: normal;
            margin: 5px 0; /* Reducido para menos espacio */
            color: #fff;
        }
        nav {
            padding: 5px; /* Reducido */
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
            gap: 15px; /* Reducido para menos espacio */
            padding: 10px; /* Reducido */
            max-width: 1200px;
            margin: 0 auto;
        }
        .gallery-item {
            text-align: center;
        }
        .gallery-item img {
            width: 100%;
            height: auto;
            object-fit: cover;
            border: 1px solid #000;
            border-radius: 6px;
        }
        .gallery-item p {
            font-size: 1em;
            margin: 5px 0;
            color: #333;
        }
        .gallery-item button {
            padding: 6px 12px;
            font-size: 14px;
            margin: 5px 2px;
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
            padding: 10px;
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

# Busca imágenes en el directorio y genera contenedores con botones
for img in "$IMG_DIR"/*.{jpg,jpeg,png,gif}; do
    if [ -f "$img" ]; then
        # Extrae el nombre del archivo (sin ruta ni extensión)
        filename=$(basename "$img")
        name=$(echo "$filename" | sed 's/driver_license_\(.*\)\.\(jpg\|jpeg\|png\|gif\)/\1/')
        # URL base para las imágenes
        img_url="https://convoyrama.github.io/userid/$filename"
        # Código TruckersMP
        tmp_code="[![https://convoyrama.github.io/pages/id.html]($img_url)]"
        # BBCode
        bbcode="[img]$img_url[/img]"
        # Enlace directo
        direct_link="$img_url"
        # Genera el contenedor para la imagen
        cat << EOF >> "$OUTPUT_HTML"
        <div class="gallery-item">
            <img src="$img" alt="ID $name">
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
