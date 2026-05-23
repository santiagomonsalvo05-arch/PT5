const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Variables temporales para guardar los últimos datos
let datosSensor = {
    temperatura: 0,
    humedad: 0,
    fecha: "Sin datos recibidos"
};

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
