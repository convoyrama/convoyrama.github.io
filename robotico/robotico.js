require('dotenv').config(); // Carga variables de entorno desde .env (útil para desarrollo local)

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { DateTime } = require('luxon'); // Usaremos Luxon para manejo avanzado de fechas y zonas horarias

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

// Zonas horarias de Latinoamérica para el comando !hora latam
const LATAM_TIMEZONES = [
    { name: 'Argentina (Buenos Aires)', zone: 'America/Argentina/Buenos_Aires' },
    { name: 'México (Ciudad de México)', zone: 'America/Mexico_City' },
    { name: 'Chile (Santiago)', zone: 'America/Santiago' },
    { name: 'Colombia (Bogotá)', zone: 'America/Bogota' },
    { name: 'Perú (Lima)', zone: 'America/Lima' },
    { name: 'Venezuela (Caracas)', zone: 'America/Caracas' },
    { name: 'Uruguay (Montevideo)', zone: 'America/Montevideo' }, // Añadido
    { name: 'Brasil (Brasilia)', zone: 'America/Sao_Paulo' },     // Añadido
    { name: 'España (Madrid)', zone: 'Europe/Madrid' }, // Incluido por relevancia
];

// Lista de textos para el comando !spam. ¡AJUSTA ESTA LISTA!
const SPAM_TEXTS = [
    "¡Atención, atención! Mensaje importante para todos los convoyeros. ¡A rodar!",
    "¿Listo para la carretera? ¡El asfalto nos espera!",
    "No olvides revisar tus espejos y disfrutar del viaje. ¡Convoyrama al poder!",
    "¡Pisa a fondo y que no te pare nadie!",
    "Un buen café y un buen convoy, ¿hay algo mejor?",
];

// Mensaje de despedida para el comando !despedida
const FAREWELL_MESSAGE = "LAG'S SPEED les agradece sinceramente su participación. Ha sido una ruta excelente y un placer compartir este gran momento con todos ustedes. ¡Esperamos seguir contando con su compañía en futuras aventuras! Saludos y muy buena ruta a todos.";

// --- FIN CONFIGURACIÓN PERSONALIZABLE ---


// Evento que se dispara cuando el bot está listo y conectado a Discord
// Usamos client.once('clientReady') para evitar la DeprecationWarning y prepararnos para v15
client.once('clientReady', () => {
    console.log(`¡Bot Robotito conectado como ${client.user.tag}!`);
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
            .setTitle('🤖 Comandos de Robotico')
            .setDescription('Aquí tienes una lista de lo que puedo hacer:')
            .addFields(
                { name: `\`${PREFIX}ayuda\` o \`${PREFIX}help\``, value: 'Muestra esta lista de comandos.' },
                { name: `\`${PREFIX}link\``, value: 'Muestra enlaces útiles de Convoyrama y el Discord.' },
                { name: `\`${PREFIX}hora ingame [HH:MM o Ham/pm]\``, value: 'Muestra la hora actual in-game, o calcula la hora in-game para un tiempo específico en tu zona local, incluyendo un emoji de día/noche. Ej: `!hora ingame 22:00` o `!hora ingame 5pm`.' },
                { name: `\`${PREFIX}hora latam [HH:MM o Ham/pm]\``, value: 'Muestra la hora actual en varias zonas horarias de Latinoamérica y España, o calcula esas horas para un tiempo específico en tu zona local. Ej: `!hora latam 20:00`.' },
                { name: `\`${PREFIX}despedida\``, value: 'Envía un mensaje de despedida de convoy.' },
                { name: `\`${PREFIX}spam\``, value: 'Envía un mensaje aleatorio de la lista de textos predefinidos.' },
                { name: `\`${PREFIX}proximo evento\``, value: 'Muestra el próximo evento programado en este servidor de Discord.' }
            )
            .setFooter({ text: '¡Usa los comandos con el prefijo !' });

        await message.channel.send({ embeds: [embed] });
        return; // Importante: salir después de manejar el comando
    }

    // Comando: !link
    if (command === 'link') {
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

    // Comando: !hora ingame [tiempo]
    // Ejemplo: !hora ingame, !hora 5am ingame, !hora 14:30 ingame
    if (command === 'hora' && args[0] === 'ingame') {
        let inputTime = null;
        let responseDescription = '';
        const userLocalTime = DateTime.local(); // Hora local del servidor donde corre el bot

        if (args.length > 1) {
            // Si se proporciona un tiempo (ej: !hora 5am ingame)
            const timeString = args[1];
            inputTime = parseInputTime(timeString, userLocalTime);

            if (!inputTime) {
                await message.channel.send('Formato de tiempo inválido. Intenta ' + '`' + PREFIX + 'hora HH:MM ingame`' + ' o ' + '`' + PREFIX + 'hora Ham/pm ingame`' + '.');
                return;
            }
            responseDescription = `Si en tu zona son las **${inputTime.toFormat('HH:mm')}**`;
        } else {
            // Si no se proporciona tiempo, usa la hora actual del servidor
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
    // Comando: !hora latam [tiempo]
    else if (command === 'hora' && args[0] === 'latam') {
        let inputTime = null;
        const userLocalTime = DateTime.local(); // Hora local del servidor donde corre el bot

        if (args.length > 1) {
            const timeString = args[1];
            inputTime = parseInputTime(timeString, userLocalTime);

            if (!inputTime) {
                await message.channel.send('Formato de tiempo inválido. Intenta ' + '`' + PREFIX + 'hora latam HH:MM`' + ' o ' + '`' + PREFIX + 'hora latam Ham/pm`' + '.');
                return;
            }
        } else {
            inputTime = userLocalTime;
        }

        let description = `**Horas en Zonas Latinas:**\n`; // Texto modificado

        LATAM_TIMEZONES.forEach(tz => {
            const timeInZone = inputTime.setZone(tz.zone);
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
    // Comando: !despedida (NUEVO)
    else if (command === 'despedida') {
        const embed = new EmbedBuilder()
            .setColor(0x800080) // Púrpura
            .setTitle('👋 ¡Hasta la Próxima Ruta!')
            .setDescription(FAREWELL_MESSAGE)
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
    // Comando: !proximo evento
    else if (command === 'proximo' && args[0] === 'evento') {
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
            await message.channel.send('No hay eventos programados próximos en este servidor.');
            return;
        }

        const nextEvent = upcomingEvents.first(); // Obtener el evento más próximo

        const eventStartTime = DateTime.fromMillis(nextEvent.scheduledStartTimestamp, { zone: 'utc' }).toLocal();

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
    // Si el comando no fue reconocido por ninguno de los bloques anteriores
    else {
        await message.channel.send(
            `Comando desconocido o uso incorrecto. Intenta:\n` +
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
