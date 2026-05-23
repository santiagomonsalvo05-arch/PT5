const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Variables para guardar los últimos datos
let datosSensor = {
    temperatura: 0,
    humedad: 0,
    fecha: "Sin datos recibidos"
};

// Ruta para que la página web se muestre (GET /)
app.get('/', (req, res) => {
    const htmlResponse = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estación de Clima</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: #121214;
                color: #e1e1e6;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                text-align: center;
                background: #202024;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                max-width: 350px;
                width: 100%;
            }
            h1 { margin-bottom: 20px; font-size: 1.6rem; color: #04d361; }
            .card {
                background: #29292e;
                padding: 15px;
                margin: 15px 0;
                border-radius: 8px;
                border: 1px solid #323238;
            }
            .label { font-size: 0.85rem; color: #8d8d99; text-transform: uppercase; letter-spacing: 1px; }
            .value { font-size: 2rem; font-weight: bold; margin-top: 5px; }
            #temp-val { color: #f75a68; }
            #hum-val { color: #00b37e; }
            .footer { font-size: 0.75rem; color: #7c7c8a; margin-top: 25px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Monitoreo de Clima</h1>
            <div class="card">
                <div class="label">Temperatura</div>
                <div class="value" id="temp-val">--.- °C</div>
            </div>
            <div class="card">
                <div class="label">Humedad</div>
                <div class="value" id="hum-val">-- %</div>
            </div>
            <div class="footer">Última actualización: <span id="time-val">Esperando datos...</span></div>
        </div>

        <script>
            async function actualizarDatos() {
                try {
                    const response = await fetch('/api/datos');
                    const data = await response.json();
                    if(data.fecha !== "Sin datos recibidos") {
                        document.getElementById('temp-val').innerText = data.temperatura.toFixed(1) + ' °C';
                        document.getElementById('hum-val').innerText = data.humedad.toFixed(0) + ' %';
                        document.getElementById('time-val').innerText = data.fecha;
                    }
                } catch (error) {
                    console.error("Error al obtener datos:", error);
                }
            }
            setInterval(actualizarDatos, 3000);
            actualizarDatos();
        </script>
    </body>
    </html>
    `;
    res.send(htmlResponse);
});

// Ruta para que el ESP32 envíe datos (POST)
app.post('/api/datos', (req, res) => {
    const { temperatura, humedad } = req.body;
    if (temperatura !== undefined && humedad !== undefined) {
        datosSensor = {
            temperatura: parseFloat(temperatura),
            humedad: parseFloat(humedad),
            fecha: new Date().toLocaleString("es-AR", {timeZone: "America/Argentina/Buenos_Aires"})
        };
        console.log("Datos recibidos:", datosSensor);
        return res.status(200).send({ mensaje: "Datos guardados" });
    }
    return res.status(400).send({ error: "Datos incorrectos" });
});

// Ruta para que la página web consulte los datos actuales
app.get('/api/datos', (req, res) => {
    res.json(datosSensor);
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
