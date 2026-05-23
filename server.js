const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Arreglo para almacenar el historial de datos (últimas 20 lecturas)
let historialDatos = [];

// Ruta principal para mostrar la página web (GET /)
app.get('/', (req, res) => {
    const htmlResponse = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estación de Clima con Historial</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: #121214;
                color: #e1e1e6;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px;
                margin: 0;
            }
            .container {
                background: #202024;
                padding: 25px;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                max-width: 450px;
                width: 100%;
                margin-bottom: 20px;
            }
            h1 { text-align: center; margin-bottom: 20px; font-size: 1.6rem; color: #04d361; }
            .grid-cards {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            .card {
                background: #29292e;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #323238;
                text-align: center;
            }
            .label { font-size: 0.8rem; color: #8d8d99; text-transform: uppercase; letter-spacing: 1px; }
            .value { font-size: 1.8rem; font-weight: bold; margin-top: 5px; }
            .avg-value { font-size: 1.2rem; font-weight: normal; color: #a8a8b3; margin-top: 5px; }
            #temp-val { color: #f75a68; }
            #hum-val { color: #00b37e; }
            
            /* Estilos del historial */
            .history-container {
                background: #202024;
                padding: 20px;
                border-radius: 12px;
                max-width: 450px;
                width: 100%;
                box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            }
            h2 { font-size: 1.2rem; color: #04d361; margin-top: 0; border-bottom: 1px solid #323238; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; }
            th, td { padding: 10px; border-bottom: 1px solid #29292e; }
            th { color: #8d8d99; font-weight: normal; text-transform: uppercase; font-size: 0.75rem; }
            .footer { text-align: center; font-size: 0.75rem; color: #7c7c8a; margin-top: 20px; width: 100%; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Monitoreo de Clima</h1>
            <div class="grid-cards">
                <div class="card">
                    <div class="label">Temperatura Actual</div>
                    <div class="value" id="temp-val">--.- °C</div>
                    <div class="label" style="margin-top:10px;">Media (Promedio)</div>
                    <div class="avg-value" id="temp-avg">--.- °C</div>
                </div>
                <div class="card">
                    <div class="label">Humedad Actual</div>
                    <div class="value" id="hum-val">-- %</div>
                    <div class="label" style="margin-top:10px;">Media (Promedio)</div>
                    <div class="avg-value" id="hum-avg">-- %</div>
                </div>
            </div>
        </div>

        <div class="history-container">
            <h2>Últimas mediciones</h2>
            <table>
                <thead>
                    <tr>
                        <th>Hora/Fecha</th>
                        <th>Temp</th>
                        <th>Hum</th>
                    </tr>
                </thead>
                <tbody id="history-body">
                    <tr>
                        <td colspan="3" style="text-align: center; color: #7c7c8a;">Esperando datos...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="footer">Actualizado en tiempo real automáticamente</div>

        <script>
            async function actualizarDatos() {
                try {
                    const response = await fetch('/api/datos');
                    const historial = await response.json();
                    
                    if (historial.length > 0) {
                        const masReciente = historial[historial.length - 1];
                        document.getElementById('temp-val').innerText = masReciente.temperatura.toFixed(1) + ' °C';
                        document.getElementById('hum-val').innerText = masReciente.humedad.toFixed(0) + ' %';

                        // Calcular promedios
                        let sumaTemp = 0;
                        let sumaHum = 0;
                        for (let i = 0; i < historial.length; i++) {
                            sumaTemp += historial[i].temperatura;
                            sumaHum += historial[i].humedad;
                        }
                        const promedioTemp = sumaTemp / historial.length;
                        const promedioHum = sumaHum / historial.length;

                        document.getElementById('temp-avg').innerText = promedioTemp.toFixed(1) + ' °C';
                        document.getElementById('hum-avg').innerText = promedioHum.toFixed(0) + ' %';

                        // Renderizar tabla (más reciente primero)
                        const historyBody = document.getElementById('history-body');
                        historyBody.innerHTML = '';
                        
                        // Invertimos la lista para mostrar primero lo nuevo
                        const listaInvertida = historial.slice().reverse();
                        const limite = listaInvertida.length > 10 ? 10 : listaInvertida.length;

                        for (let i = 0; i < limite; i++) {
                            const item = listaInvertida[i];
                            const fila = document.createElement('tr');
                            
                            // Usamos concatenación clásica de texto para evitar errores de compilación
                            fila.innerHTML = '<td>' + item.fecha + '</td>' +
                                             '<td style="color: #f75a68;">' + item.temperatura.toFixed(1) + ' °C</td>' +
                                             '<td style="color: #00b37e;">' + item.humedad.toFixed(0) + ' %</td>';
                                             
                            historyBody.appendChild(fila);
                        }
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

// Ruta para recibir datos del ESP32 (POST /api/datos)
app.post('/api/datos', (req, res) => {
    const { temperatura, humedad } = req.body;

    if (temperatura !== undefined && humedad !== undefined) {
        // Obtener hora local de Argentina
        const fechaActual = new Date();
        const horaString = fechaActual.toLocaleTimeString("es-AR", { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            timeZone: "America/Argentina/Buenos_Aires"
        });

        const nuevaLectura = {
            temperatura: parseFloat(temperatura),
            humedad: parseFloat(humedad),
            fecha: horaString
        };

        historialDatos.push(nuevaLectura);

        if (historialDatos.length > 20) {
            historialDatos.shift();
        }

        console.log("Dato guardado:", nuevaLectura);
        return res.status(200).send({ mensaje: "Dato guardado" });
    }
    return res.status(400).send({ error: "Datos incorrectos" });
});

// Ruta para devolver todo el historial (GET /api/datos)
app.get('/api/datos', (req, res) => {
    res.json(historialDatos);
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
