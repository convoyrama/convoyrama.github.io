require('dotenv').config(); // Carga variables de entorno desde .env (útil para desarrollo local)

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { DateTime } = require('luxon'); // Usaremos Luxon para manejo avanzado de fechas y zonas horarias
const axios = require('axios'); // Necesitarás instalar axios: npm install axios

// Crea una nueva instancia del cliente de Discord con los intents necesarios
// GuildScheduledEvents es necesario para leer los eventos programados del servidor
// MessageContent es crucial para que el bot pueda leer el contenido de los mensajes
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents, // Nuevo intent para eventos programados
    ],
});

// --- CONFIGURACIÓN PERSONALIZABLE ---
const PREFIX = '!';

// Parámetros para el cálculo de la hora in-game, extraídos de event/js/time.js
const GAME_TIME_ANCHOR_UTC_MINUTES = 20 * 60 + 40; // 20:40 UTC
const TIME_SCALE = 6; // Factor de aceleración (6 días in-game en 24 horas reales)

// Zonas horarias de Latinoamérica para el comando !hora
const LATAM_TIMEZONES = [
    { name: 'Argentina (Buenos Aires)', zone: 'America/Argentina/Buenos_Aires' },
    { name: 'México (Ciudad de México)', zone: 'America/Mexico_City' },
    { name: 'Chile (Santiago)', zone: 'America/Santiago' },
    { name: 'Colombia (Bogotá)', zone: 'America/Bogota' },
    { name: 'Perú (Lima)', zone: 'America/Lima' },
    { name: 'Venezuela (Caracas)', zone: 'America/Caracas' },
    { name: 'Panamá (Ciudad de Panamá)', zone: 'America/Panama' }, // Añadido
    { name: 'Costa Rica (San José)', zone: 'America/Costa_Rica' }, // Añadido
    { name: 'Paraguay (Asunción)', zone: 'America/Asuncion' },   // Añadido
    { name: 'Ecuador (Guayaquil)', zone: 'America/Guayaquil' },   // Añadido
    { name: 'Uruguay (Montevideo)', zone: 'America/Montevideo' },
    { name: 'Brasil (Brasilia)', zone: 'America/Sao_Paulo' },
    { name: 'España (Madrid)', zone: 'Europe/Madrid' }, // Incluido por relevancia
];

// Lista de textos para el comando !spam. ¡AJUSTA ESTA LISTA!
const SPAM_TEXTS = [
    'LAG\'S SPEED en la zona. Si vamos despacio no es por la carga, es que el ping no nos deja correr.',
    'LAG\'S SPEED recomienda 500 metros de distancia de seguridad. No por el freno, por el ping. ¿O por los dos? ¡Buena ruta!',
    'Ojo con el lag que andamos cerca... ¡Es broma! O no... ¡Un saludo de LAG\'S SPEED y buena ruta!',
    '¿Tu ping subió de repente? No, no fuimos nosotros... ¿O sí? ¡Saludos de LAG\'S SPEED!',
    'Prometemos no usar el lag como arma táctica... a menos que sea estrictamente necesario. ¡Saludos de LAG\'S SPEED!',
    'Nuestra especialidad no es carga pesada, es el ping pesado. Buena Ruta!',
];

// Mensajes de despedida
const FAREWELL_MESSAGE_OWN = "LAG'S SPEED les agradece sinceramente su participación. Ha sido una ruta excelente y un placer compartir este gran momento con todos ustedes. ¡Esperamos seguir contando con su compañía en futuras aventuras! Saludos y muy buena ruta a todos.";
const FAREWELL_MESSAGE_EXTERNAL = "LAG'S SPEED agradece la invitación a este convoy. Ha sido un placer compartir la ruta con todos. ¡Esperamos coincidir de nuevo en el camino! Saludos y muy buena ruta.";

// URL base de la API de TruckersMP
const TRUCKERSMP_API_BASE_URL = 'https://api.truckersmp.com/v2';
// Clave de API de TruckersMP (si es necesaria para la funcionalidad deseada)
// const TRUCKERSMP_API_KEY = process.env.TRUCKERSMP_API_KEY; // Configurar en Secrets si se usa

const VTCS_DATA = [
    {
        "country": "## :flag_ar: Argentina ##",
        "vtcs": [
            {
                "name": "Logística Norte",
                "discord": "https://discord.gg/9NCXZEez8F"
            },
            {
                "name": "Nova Era Transportes",
                "discord": "https://discord.gg/tQRBR6FFQe"
            },
            {
                "name": "Los Andes Unidos",
                "discord": "https://discord.gg/YWmkYYpdtF"
            },
            {
                "name": "Rutiando",
                "discord": "https://discord.gg/mYgeuBxgrR"
            },
            {
                "name": "EXPRESO AMERICANO",
                "discord": "https://discord.gg/ZHbK5gSkRd"
            },
            {
                "name": "Aires del Sur",
                "discord": "https://discord.gg/2zshSNgzrT"
            },
            {
                "name": "Convoy Nocturno - La Noche",
                "discord": "https://discord.gg/yS4PQuCkwy"
            }
        ]
    },
    {
        "country": "## :flag_cl: Chile ##",
        "vtcs": [
            {
                "name": "Logística Coordillera VTC",
                "discord": "https://discord.gg/yNn7vTcjc4"
            },
            {
                "name": "Lunar",
                "discord": "https://discord.gg/bN8ys3ywQw"
            },
            {
                "name": "Forestal El Conquistador",
                "discord": "https://discord.gg/bN8ys3ywQw"
            },
            {
                "name": "Titanes",
                "discord": "https://discord.gg/XBg4V4kmnF"
            }
        ]
    },
    {
        "country": "## :flag_co: Colombia ##",
        "vtcs": [
            {
                "name": "Sin Fronteras Cargo",
                "discord": "https://discord.gg/FdgK9eBMEA"
            }
        ]
    },
    {
        "country": "## :flag_cr: Costa Rica ##",
        "vtcs": [
            {
                "name": "Transportes Costa Sudamericana",
                "discord": "https://discord.gg/PrHd3pA6Ev"
            },
            {
                "name": "ChatoCR / Correcaminos",
                "discord": "https://discord.com/invite/nWHrdUEqFr"
            }
        ]
    },
    {
        "country": "## :flag_ec: Ecuador ##",
        "vtcs": [
            {
                "name": "Traileros Latinos",
                "discord": "https://discord.gg/WawQC8zc5x"
            }
        ]
    },
    {
        "country": "## :flag_mx: México ##",
        "vtcs": [
            {
                "name": "POLAR EXPRESS",
                "discord": "https://discord.gg/7C59DQ65pT"
            },
            {
                "name": "Castores Trucking",
                "discord": "https://discord.gg/cTtV44CE9J"
            },
            {
                "name": "Chapulines VTC ·REAL·",
                "discord": "https://discord.gg/UY42pmqvnw"
            }
        ]
    }
];

const vtcAliases = {
    'ls': 78865,
    'tcs': 76978,
    'ln': 79357,
    'nova': 34966,
    'andes': 55250,
    'rutiando': 62448,
    'cn': 81233,
    'lc': 63758,
    'titanes': 76975
};

// --- FIN CONFIGURACIÓN PERSONALIZABLE ---


// Evento que se dispara cuando el bot está listo y conectado a Discord
// Usamos client.once('clientReady') para evitar la DeprecationWarning y prepararnos para v15
client.once('clientReady', () => {
    console.log(`¡Bot Robotito conectado como ${client.user.tag}!`); // Nombre actualizado
    client.user.setActivity('Convoyrama', { type: 3 }); // Establece el estado del bot (jugando a Convoyrama)
});

// Función para parsear el tiempo de entrada del usuario
function parseInputTime(timeString, referenceDate) {
    let parsedTime = null;

    // Intentar formato HH:MM
    const timeMatch24 = timeString.match(/^(\d{1,2}):(\d{2})$/);
    if (timeMatch24) {
        parsedTime = referenceDate.set({
            hour: parseInt(timeMatch24[1]),
            minute: parseInt(timeMatch24[2]),
            second: 0,
            millisecond: 0
        });
    }

    // Intentar formato HHam/pm
    const timeMatchAMPM = timeString.match(/^(\d{1,2})(am|pm)$/i);
    if (timeMatchAMPM) {
        let hour = parseInt(timeMatchAMPM[1]);
        const ampm = timeMatchAMPM[2].toLowerCase();
        if (ampm === 'pm' && hour < 12) hour += 12; // 1pm -> 13, 11pm -> 23
        if (ampm === 'am' && hour === 12) hour = 0; // 12am es medianoche
        parsedTime = referenceDate.set({
            hour: hour,
            minute: 0,
            second: 0,
            millisecond: 0
        });
    }
    return parsedTime && parsedTime.isValid ? parsedTime : null;
}

// Función para calcular la hora In-Game basada en la lógica de event/js/time.js
function getGameTime(realDateTime) {
    // Asegurarse de que la fecha/hora de entrada esté en UTC para el cálculo del anclaje
    const utcDateTime = realDateTime.toUTC();

    const totalMinutesUTC = utcDateTime.hour * 60 + utcDateTime.minute;
    
    let realMinutesSinceAnchor = totalMinutesUTC - GAME_TIME_ANCHOR_UTC_MINUTES;
    if (realMinutesSinceAnchor < 0) { realMinutesSinceAnchor += 24 * 60; }

    let gameMinutes = realMinutesSinceAnchor * TIME_SCALE;
    gameMinutes = gameMinutes % 1440; // 1440 minutos en un día in-game (24 horas * 60 minutos)

    const gameHours = Math.floor(gameMinutes / 60);
    const remainingMinutes = Math.floor(gameMinutes % 60);
    const gameSeconds = Math.floor((utcDateTime.second * TIME_SCALE) % 60); // Acelerar segundos también

    // Devolver un objeto DateTime de Luxon para facilitar el formato
    return utcDateTime.set({
        hour: gameHours,
        minute: remainingMinutes,
        second: gameSeconds,
        millisecond: 0
    });
}

// Función para obtener el emoji de día/noche/amanecer/atardecer
function getDetailedDayNightIcon(hours) {
    if (hours >= 6 && hours < 8) return '🌅'; // Amanecer
    if (hours >= 8 && hours < 19) return '☀️'; // Día
    if (hours >= 19 && hours < 21) return '🌇'; // Atardecer
    return '🌙'; // Noche
}

async function handlePlayerInfo(message, userId, profileUrl) {
    try {
        const response = await axios.get(`${TRUCKERSMP_API_BASE_URL}/player/${userId}`);
        const playerData = response.data.response;

        if (!playerData) {
            await message.channel.send('No se encontró información para ese usuario de TruckersMP.');
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(0x0077B6) // Azul TruckersMP
            .setTitle(`👤 Perfil de TruckersMP: ${playerData.name}`)
            .setURL(profileUrl)
            .setThumbnail(playerData.avatar || null)
            .addFields(
                { name: 'ID de TruckersMP', value: `${playerData.id}`, inline: true },
                { name: 'Registrado', value: playerData.joinDate ? DateTime.fromISO(playerData.joinDate.replace(' ', 'T')).toFormat('dd/MM/yyyy') : 'N/A', inline: true },
                { name: 'Última Conexión', value: playerData.lastGameTime ? DateTime.fromISO(playerData.lastGameTime.replace(' ', 'T')).toRelative() : 'N/A', inline: true },
                { name: 'Baneado', value: playerData.banned ? `Sí, hasta ${DateTime.fromISO(playerData.bannedUntil.replace(' ', 'T')).toFormat('dd/MM/yyyy HH:mm')}` : 'No', inline: true },
                { name: 'Número de Baneos', value: `${playerData.bansCount}`, inline: true },
                { name: 'En VTC', value: playerData.vtc && playerData.vtc.id ? `[${playerData.vtc.name} ${playerData.vtc.tag ? `[${playerData.vtc.tag}]` : ''}](https://truckersmp.com/vtc/${playerData.vtc.id})` : 'No', inline: true },
                { name: 'Grupo', value: playerData.groupName || 'N/A', inline: true },
                { name: 'Patreon', value: playerData.patreon.isPatron ? 'Sí' : 'No', inline: true },
                { name: 'Staff', value: playerData.permissions.isStaff ? 'Sí' : 'No', inline: true },
                { name: 'Game Admin', value: playerData.permissions.isGameAdmin ? 'Sí' : 'No', inline: true },
                { name: 'Management', value: playerData.permissions.isManagement ? 'Sí' : 'No', inline: true }
            )
            .setFooter({ text: 'Datos obtenidos de la API de TruckersMP.' });

        await message.channel.send({ embeds: [embed] });

    } catch (error) {
        console.error('Error al obtener datos de TruckersMP API:', error);
        if (error.response) {
            await message.channel.send(`Error al consultar la API de TruckersMP: ${error.response.status} ${error.response.statusText}`);
        } else {
            await message.channel.send('Lo siento, hubo un error al consultar la API de TruckersMP.');
        }
    }
}

// Evento que se dispara cuando se recibe un mensaje
client.on('messageCreate', async message => {
    // Ignora mensajes de otros bots para evitar bucles infinitos
    if (message.author.bot) return;

    // Ignora mensajes que no empiezan con el prefijo definido
    if (!message.content.startsWith(PREFIX)) return;

    // Extrae el comando y los argumentos
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase(); // El comando en minúsculas

    // --- Lógica para los comandos ---

    // Comando: !ayuda
    if (command === 'ayuda' || command === 'help') {
        const embed = new EmbedBuilder()
            .setColor(0x3498DB) // Azul claro
            .setTitle('🤖 Comandos de Robotito')
            .setDescription('Aquí tienes una lista de lo que puedo hacer:')
            .addFields(
                { name: `\`${PREFIX}ayuda\` o \`${PREFIX}help\``, value: 'Muestra esta lista de comandos.' },
                { name: `\`${PREFIX}tito\``, value: 'Tito te cuenta un dato inútil y absurdo.' },
                { name: `\`${PREFIX}link\` o \`${PREFIX}links\``, value: 'Muestra enlaces útiles de Convoyrama y el Discord.' },
                { name: `\`${PREFIX}ingame [HH:MM o Ham/pm]\``, value: 'Muestra la hora actual in-game, o calcula la hora in-game para un tiempo específico en tu zona local. Ej: `!ingame 22:00`.' },
                { name: `\`${PREFIX}hora [HH:MM o Ham/pm] [Ciudad]\``, value: 'Muestra la hora actual en varias zonas horarias o calcula esas horas si en la [Ciudad] indicada son las [HH:MM]. Ej: `!hora 20:00 Montevideo`.' },
                { name: `\`${PREFIX}despedida [propia/ajena]\``, value: 'Envía un mensaje de despedida de convoy (propio o ajeno).' },
                { name: `\`${PREFIX}spam\``, value: 'Envía un mensaje aleatorio de la lista de textos predefinidos.' },
                { name: `\`${PREFIX}evento\` o \`${PREFIX}convoy\``, value: 'Muestra el próximo evento programado en este servidor.' },
                { name: `\`${PREFIX}evento7\` o \`${PREFIX}convoy7\``, value: 'Muestra los eventos programados para los próximos 7 días.' },
                { name: `\`${PREFIX}vtc\` o \`${PREFIX}comunidad\``, value: 'Muestra la lista de VTCs de la comunidad.' },
                { name: `\`${PREFIX}servers\` o \`${PREFIX}estado\``, value: 'Muestra el estado de los servidores de TruckersMP.' },
                { name: `\`${PREFIX}info\` o \`${PREFIX}ver\` [URL o alias]`, value: 'Muestra información de un usuario o VTC de TruckersMP.' },
                { name: `\`${PREFIX}infou\` [ID de usuario]`, value: 'Muestra información de un usuario de TruckersMP por ID.' },
                { name: `\`${PREFIX}infov\` [ID de VTC]`, value: 'Muestra información de una VTC de TruckersMP por ID.' }
            )
            .setFooter({ text: '¡Usa los comandos con el prefijo !' });

        await message.channel.send({ embeds: [embed] });
        return; // Importante: salir después de manejar el comando
    }

    // Comando: !tito
    if (command === 'tito') {
        try {
            const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=es');
            const fact = response.data.text;

            const embed = new EmbedBuilder()
                .setColor(0x9B59B6) // Púrpura
                .setTitle('🤯 Dato Inútil del Día')
                .setDescription(fact)
                .setFooter({ text: 'Hechos inútiles para gente útil.' });

            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error al obtener dato inútil:', error);
            await message.channel.send('Lo siento, Tito no está inspirado ahora mismo. Inténtalo de nuevo más tarde.');
        }
        return;
    }

    // Comando: !link o !links
    if (command === 'link' || command === 'links') {
        const embed = new EmbedBuilder()
            .setColor(0x00FFFF) // Cyan
            .setTitle('🔗 Enlaces Útiles de Convoyrama')
            .setDescription('Aquí tienes algunos enlaces importantes:')
            .addFields(
                { name: 'Generador de Eventos', value: '[Convoyrama Eventos](https://convoyrama.github.io/event.html)' },
                { name: 'Creador de ID', value: '[Convoyrama ID](https://convoyrama.github.io/id.html)' },
                { name: 'Generador de Imagen de Perfil', value: '[Convoyrama Perfil](https://convoyrama.github.io/pc.html)' },
                { name: 'Invitación a nuestro Discord', value: '[Únete a la Comunidad](https://discord.gg/hjJcyREthH)' },
                { name: 'TruckersMP', value: '[Sitio Oficial](https://truckersmp.com/)' },
                { name: 'LAG\'S SPEED en TruckersMP', value: '[Perfil VTC](https://truckersmp.com/vtc/78865)' },
                { name: 'LAG\'S SPEED en TrucksBook', value: '[Perfil de Empresa](https://trucksbook.eu/company/212761)' },
                { name: 'LAG\'S SPEED en PickupVTM', value: '[Perfil de Empresa](https://pickupvtm.com/company/8203)' }
            )
            .setFooter({ text: '¡Explora y únete a la diversión!' });

        await message.channel.send({ embeds: [embed] });
        return; // Importante: salir después de manejar el comando
    }

    // Comando: !ingame [tiempo] (antes !hora ingame)
    // Ejemplo: !ingame, !ingame 5am, !ingame 14:30
    if (command === 'ingame') {
        let inputTime = null;
        let responseDescription = '';
        const userLocalTime = DateTime.local(); // Hora local del servidor donde corre el bot

        if (args.length > 0) { // Ahora el tiempo es el primer argumento
            const timeString = args[0];
            inputTime = parseInputTime(timeString, userLocalTime);

            if (!inputTime) {
                await message.channel.send('Formato de tiempo inválido. Intenta `' + PREFIX + 'ingame HH:MM` o `' + PREFIX + 'ingame Ham/pm`.');
                return;
            }
            responseDescription = `Si en tu zona son las **${inputTime.toFormat('HH:mm')}**`;
        } else {
            inputTime = userLocalTime;
            responseDescription = `Ahora mismo`;
        }

        // Aplicar la conversión a hora in-game usando la lógica exacta de event/js/time.js
        const ingameTime = getGameTime(inputTime);
        const ingameEmoji = getDetailedDayNightIcon(ingameTime.hour);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF) // Azul
            .setTitle('⏰ Hora In-Game')
            .setDescription(`${responseDescription}, la hora in-game sería: **${ingameTime.toFormat('HH:mm:ss')} ${ingameEmoji}**`);
            // Pie de página eliminado según tu solicitud

        await message.channel.send({ embeds: [embed] });
        return; // Importante: salir después de manejar el comando
    }
    // Comando: !hora [HH:MM o Ham/pm] [Ciudad] (antes !hora latam)
    else if (command === 'hora') { // Cambiado de args[0] === 'latam' a solo command === 'hora'
        let referenceTime = null;
        let referenceCity = null;
        let description = '';
        const userLocalTime = DateTime.local(); // Hora local del servidor donde corre el bot

        if (args.length >= 2) { // Si se proporciona tiempo y ciudad (ej: !hora 23:00 Montevideo)
            const timeString = args[0];
            const cityName = args.slice(1).join(' '); // Unir el resto de los argumentos para el nombre de la ciudad

            const foundCity = LATAM_TIMEZONES.find(tz => tz.name.toLowerCase().includes(cityName.toLowerCase()));

            if (!foundCity) {
                await message.channel.send('Ciudad no encontrada en la lista de capitales latinas. Intenta con `' + PREFIX + 'hora` para ver las horas actuales o `' + PREFIX + 'hora HH:MM [Ciudad]` con una ciudad válida.');
                return;
            }

            referenceTime = parseInputTime(timeString, userLocalTime.setZone(foundCity.zone)); // Parsear tiempo en la zona de la ciudad

            if (!referenceTime) {
                await message.channel.send('Formato de tiempo inválido. Intenta `' + PREFIX + 'hora HH:MM [Ciudad]` o `' + PREFIX + 'hora Ham/pm [Ciudad]`.');
                return;
            }
            referenceCity = foundCity.name;
            description = `**Si en ${referenceCity} son las ${referenceTime.toFormat('HH:mm')}, entonces:**\n`;

        } else if (args.length === 0) { // Si no se proporcionan argumentos (ej: !hora)
            referenceTime = userLocalTime;
            description = `**Horas actuales en Zonas Latinas:**\n`;
        } else { // Si solo se da un argumento que no es una ciudad válida o un formato incorrecto
            await message.channel.send('Uso incorrecto. Intenta `' + PREFIX + 'hora` para horas actuales, o `' + PREFIX + 'hora HH:MM [Ciudad]`.');
            return;
        }

        LATAM_TIMEZONES.forEach(tz => {
            const timeInZone = referenceTime.setZone(tz.zone);
            description += `• **${tz.name}:** ${timeInZone.toFormat('HH:mm:ss')}\n`;
        });

        const embed = new EmbedBuilder()
            .setColor(0x00FF00) // Verde
            .setTitle('🌎 Horas en Zonas Latinas')
            .setDescription(description)
            .setFooter({ text: 'Horas basadas en la zona horaria del bot.' });

        await message.channel.send({ embeds: [embed] });
        return; // Importante: salir después de manejar el comando
    }
    // Comando: !despedida [propia/ajena]
    else if (command === 'despedida') {
        let farewellMessage = FAREWELL_MESSAGE_EXTERNAL; // Por defecto, ajena
        let title = '👋 ¡Despedida de Convoy Externo!';

        if (args[0] && args[0].toLowerCase() === 'propia') { // Si se especifica 'propia'
            farewellMessage = FAREWELL_MESSAGE_OWN;
            title = '👋 ¡Hasta la Próxima Ruta!';
        }

        const embed = new EmbedBuilder()
            .setColor(0x800080) // Púrpura
            .setTitle(title)
            .setDescription(farewellMessage)
            .setFooter({ text: '¡Nos vemos en el camino!' });

        await message.channel.send({ embeds: [embed] });
        return; // Importante: salir después de manejar el comando
    }
    // Comando: !spam
    else if (command === 'spam') {
        if (SPAM_TEXTS.length === 0) {
            await message.channel.send('No hay textos de spam configurados.');
            return;
        }
        const randomIndex = Math.floor(Math.random() * SPAM_TEXTS.length);
        const randomSpamText = SPAM_TEXTS[randomIndex];

        const embed = new EmbedBuilder()
            .setColor(0xFF0000) // Rojo
            .setTitle('🚨 Mensaje Aleatorio (SPAM)')
            .setDescription(randomSpamText)
            .setFooter({ text: '¡Copia y pega con responsabilidad!' });

        await message.channel.send({ embeds: [embed] });
        return; // Importante: salir después de manejar el comando
    }
    // Comando: !evento o !convoy (antes !proximo evento)
    else if (command === 'evento' || command === 'convoy') {
        if (!message.guild) {
            await message.channel.send('Este comando solo funciona en un servidor.');
            return;
        }

        const scheduledEvents = await message.guild.scheduledEvents.fetch();
        const now = Date.now();

        // Filtrar eventos futuros y ordenar por fecha
        const upcomingEvents = scheduledEvents
            .filter(event => event.scheduledStartTimestamp > now)
            .sort((a, b) => a.scheduledStartTimestamp - b.scheduledStartTimestamp);

        if (upcomingEvents.size === 0) {
            await message.channel.send('Lo siento, no hay eventos programados próximos en este servidor.');
            return;
        }

        const nextEvent = upcomingEvents.first(); // Obtener el evento más próximo

        const embed = new EmbedBuilder()
            .setColor(0x8A2BE2) // Azul violeta
            .setTitle(`📅 Próximo Evento: ${nextEvent.name}`)
            .setURL(nextEvent.url)
            .setDescription(
                `**Descripción:** ${nextEvent.description || 'Sin descripción.'}\n` +
                `**Inicio:** <t:${Math.floor(nextEvent.scheduledStartTimestamp / 1000)}:F> (<t:${Math.floor(nextEvent.scheduledStartTimestamp / 1000)}:R>)\n` +
                `**Ubicación:** ${nextEvent.entityMetadata?.location || nextEvent.channel?.name || 'N/A'}\n` +
                `**Creador:** ${nextEvent.creator?.tag || 'Desconocido'}`
            )
            .setFooter({ text: '¡No te lo pierdas!' });

        const coverImage = nextEvent.coverImageURL();
        if (coverImage) {
            embed.setThumbnail(coverImage);
        }

        await message.channel.send({ embeds: [embed] });
        return; // Importante: salir después de manejar el comando
    }
    
    // Comando: !evento7 o !convoy7
    else if (command === 'evento7' || command === 'convoy7') {
        if (!message.guild) {
            await message.channel.send('Este comando solo funciona en un servidor.');
            return;
        }

        const scheduledEvents = await message.guild.scheduledEvents.fetch();
        const now = Date.now();
        const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

        // Filtrar eventos de los próximos 7 días y ordenar por fecha
        const upcomingWeekEvents = scheduledEvents
            .filter(event => event.scheduledStartTimestamp > now && event.scheduledStartTimestamp < sevenDaysFromNow)
            .sort((a, b) => a.scheduledStartTimestamp - b.scheduledStartTimestamp);

        if (upcomingWeekEvents.size === 0) {
            await message.channel.send('No hay eventos programados para esta semana.');
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(0x8A2BE2) // Azul violeta
            .setTitle('📅 Próximos Eventos de la Semana');

        let description = '';
        upcomingWeekEvents.forEach(event => {
            description += `**[${event.name}](${event.url})**\n` +
                           `Inicia: <t:${Math.floor(event.scheduledStartTimestamp / 1000)}:F> (<t:${Math.floor(event.scheduledStartTimestamp / 1000)}:R>)\n\n`;
        });

        embed.setDescription(description);
        await message.channel.send({ embeds: [embed] });
        return;
    }

    // Comando para mostrar la lista de VTCs
    else if (command === 'vtc' || command === 'vtcs' || command === 'vtcamigas' || command === 'comunidad') {
        const embed = new EmbedBuilder()
            .setColor(0x008000) // Verde oscuro
            .setTitle('🚚 Comunidad');

        VTCS_DATA.forEach(countryData => {
            const vtcList = countryData.vtcs.map(vtc => {
                if (vtc.discord) {
                    return `[${vtc.name}](${vtc.discord})`;
                } else {
                    return vtc.name;
                }
            }).join('\n');
            if (vtcList) {
                embed.addFields({ name: countryData.country, value: vtcList, inline: true });
            }
        });



        await message.channel.send({ embeds: [embed] });
        return;
    }

    else if (command === 'servers' || command === 'estado') {
        try {
            const response = await axios.get(`${TRUCKERSMP_API_BASE_URL}/servers`);
            const servers = response.data.response;

            const embed = new EmbedBuilder()
                .setColor(0x00FF00) // Verde
                .setTitle('Estado de los Servidores de TruckersMP');

            servers.forEach(server => {
                embed.addFields({
                    name: `${server.name} (${server.shortname})`,
                    value: `**Jugadores:** ${server.players} / ${server.maxplayers}\n**En cola:** ${server.queue}\n**Estado:** ${server.online ? 'Online' : 'Offline'}`,
                    inline: true
                });
            });

            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error al obtener datos de los servidores de TruckersMP:', error);
            await message.channel.send('Lo siento, hubo un error al consultar la API de TruckersMP.');
        }
        return;
    }

    else if (command === 'infou') {
        const userId = args[0];
        if (!userId) {
            await message.channel.send('Por favor, proporciona un ID de usuario de TruckersMP.');
            return;
        }
        const profileUrl = `https://truckersmp.com/user/${userId}`;
        await handlePlayerInfo(message, userId, profileUrl);
        return;
    }

    else if (command === 'infov') {
        const vtcId = args[0];
        if (!vtcId) {
            await message.channel.send('Por favor, proporciona un ID de VTC de TruckersMP.');
            return;
        }
        const vtcUrl = `https://truckersmp.com/vtc/${vtcId}`;
        try {
            const vtcResponse = await axios.get(`${TRUCKERSMP_API_BASE_URL}/vtc/${vtcId}`);
            const vtcData = vtcResponse.data.response;

            if (!vtcData) {
                await message.channel.send('No se encontró información para esa VTC de TruckersMP.');
                return;
            }

            const membersResponse = await axios.get(`${TRUCKERSMP_API_BASE_URL}/vtc/${vtcId}/members`);
            const membersData = membersResponse.data.response.members;
            const bannedMembers = membersData.filter(member => member.banned);

            const newsResponse = await axios.get(`${TRUCKERSMP_API_BASE_URL}/vtc/${vtcId}/news`);
            const newsData = newsResponse.data.response;

            const embed = new EmbedBuilder()
                .setColor(0x0077B6) // Azul TruckersMP
                .setTitle(`🚚 Perfil de VTC: ${vtcData.name}`)
                .setURL(vtcUrl)
                .setThumbnail(vtcData.avatar || null)
                .addFields(
                    { name: 'ID de VTC', value: vtcData.id ? `${vtcData.id}`: 'N/A', inline: true },
                    { name: 'Tag', value: vtcData.tag || 'N/A', inline: true },
                    { name: 'Miembros', value: vtcData.members_count ? `${vtcData.members_count}` : 'N/A', inline: true },
                    { name: 'Creada', value: vtcData.creation_date ? DateTime.fromISO(vtcData.creation_date.replace(' ', 'T')).toFormat('dd/MM/yyyy') : 'N/A', inline: true },
                    { name: 'Reclutamiento', value: vtcData.recruitment_status || 'N/A', inline: true },
                    { name: 'Verificada', value: vtcData.verified ? 'Sí' : 'No', inline: true }
                )
                .setFooter({ text: 'Datos obtenidos de la API de TruckersMP.' });
            
            if(vtcData.slogan){
                embed.setDescription(vtcData.slogan);
            }

            if (bannedMembers.length > 0) {
                const bannedMembersList = bannedMembers.map(member => member.username).join(', ');
                embed.addFields({ name: 'Miembros Baneados', value: bannedMembersList });
            }

            if (newsData.news && newsData.news.length > 0) {
                const latestNews = newsData.news[0];
                embed.addFields({ name: 'Última Noticia', value: `[${latestNews.title}](https://truckersmp.com/vtc/${vtcId}/news/${latestNews.id})` });
            }

            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error al obtener datos de TruckersMP API:', error);
            if (error.response) {
                await message.channel.send(`Error al consultar la API de TruckersMP: ${error.response.status} ${error.response.statusText}`);
            } else {
                await message.channel.send('Lo siento, hubo un error al consultar la API de TruckersMP.');
            }
        }
        return;
    }

    // Comando para ver información de usuario o VTC de TruckersMP
    else if (command === 'ver' || command === 'info') {
        const input = args.join(' ');
        if (!input) {
            await message.channel.send('Por favor, proporciona un enlace de perfil de TruckersMP (usuario o VTC) o un alias de VTC.');
            return;
        }

        const userUrlMatch = input.match(/truckersmp\.com\/user\/(\d+)/);
        const vtcUrlMatch = input.match(/truckersmp\.com\/vtc\/(\d+)/);
        const vtcAlias = vtcAliases[input.toLowerCase()];

        if (userUrlMatch) {
            const userId = userUrlMatch[1];
            await handlePlayerInfo(message, userId, input);
        } else if (vtcUrlMatch || vtcAlias) {
            const vtcId = vtcUrlMatch ? vtcUrlMatch[1] : vtcAlias;
            const vtcUrl = vtcUrlMatch ? input : `https://truckersmp.com/vtc/${vtcId}`;
            try {
                const vtcResponse = await axios.get(`${TRUCKERSMP_API_BASE_URL}/vtc/${vtcId}`);
                const vtcData = vtcResponse.data.response;

                if (!vtcData) {
                    await message.channel.send('No se encontró información para esa VTC de TruckersMP.');
                    return;
                }

                const membersResponse = await axios.get(`${TRUCKERSMP_API_BASE_URL}/vtc/${vtcId}/members`);
                const membersData = membersResponse.data.response.members;
                const bannedMembers = membersData.filter(member => member.banned);

                const newsResponse = await axios.get(`${TRUCKERSMP_API_BASE_URL}/vtc/${vtcId}/news`);
                const newsData = newsResponse.data.response;

                const embed = new EmbedBuilder()
                    .setColor(0x0077B6) // Azul TruckersMP
                    .setTitle(`🚚 Perfil de VTC: ${vtcData.name}`)
                    .setURL(vtcUrl)
                    .setThumbnail(vtcData.avatar || null)
                    .addFields(
                        { name: 'ID de VTC', value: vtcData.id ? `${vtcData.id}`: 'N/A', inline: true },
                        { name: 'Tag', value: vtcData.tag || 'N/A', inline: true },
                        { name: 'Miembros', value: vtcData.members_count ? `${vtcData.members_count}` : 'N/A', inline: true },
                        { name: 'Creada', value: vtcData.creation_date ? DateTime.fromISO(vtcData.creation_date.replace(' ', 'T')).toFormat('dd/MM/yyyy') : 'N/A', inline: true },
                        { name: 'Reclutamiento', value: vtcData.recruitment_status || 'N/A', inline: true },
                        { name: 'Verificada', value: vtcData.verified ? 'Sí' : 'No', inline: true }
                    )
                    .setFooter({ text: 'Datos obtenidos de la API de TruckersMP.' });
                
                if(vtcData.slogan){
                    embed.setDescription(vtcData.slogan);
                }

                if (bannedMembers.length > 0) {
                    const bannedMembersList = bannedMembers.map(member => member.username).join(', ');
                    embed.addFields({ name: 'Miembros Baneados', value: bannedMembersList });
                }

                if (newsData.news && newsData.news.length > 0) {
                    const latestNews = newsData.news[0];
                    embed.addFields({ name: 'Última Noticia', value: `[${latestNews.title}](https://truckersmp.com/vtc/${vtcId}/news/${latestNews.id})` });
                }

                await message.channel.send({ embeds: [embed] });

            } catch (error) {
                console.error('Error al obtener datos de TruckersMP API:', error);
                if (error.response) {
                    await message.channel.send(`Error al consultar la API de TruckersMP: ${error.response.status} ${error.response.statusText}`);
                } else {
                    await message.channel.send('Lo siento, hubo un error al consultar la API de TruckersMP.');
                }
            }
        } else {
            await message.channel.send('El formato del enlace o alias no es válido. Por favor, usa un enlace de perfil de usuario, de VTC o un alias de VTC válido.');
        }
        return; // Importante: salir después de manejar el comando
    }
    // Si el comando no fue reconocido por ninguno de los bloques anteriores
    else {
        await message.channel.send(
            `Comando desconocido o uso incorrecto. Intenta:
` +
            `\`${PREFIX}ayuda\` para ver todos los comandos.
`
        );
        return; // Importante: salir después de manejar el comando
    }
});

// Manejo de errores al iniciar sesión
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ Error: DISCORD_TOKEN no está configurado en las variables de entorno');
    console.error('Por favor, configura tu token de Discord en los Secrets de Replit o en tu entorno de hosting.');
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN)
    .catch(error => {
        console.error('❌ Error al conectar con Discord:', error.message);
        process.exit(1);
    });
