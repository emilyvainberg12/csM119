// code is taken from M3 project of getting arduino data onto webpage
// based on the example on https://www.npmjs.com/package/@abandonware/noble


const noble = require('@abandonware/noble');

const uuid_service1 = "1108"
const uuid_value1 = "7108"

// const uuid_service2 = "1109"
// const uuid_value2 = "7109"

let sensorValue1 = NaN

const config = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
    }
  };
  

noble.on('stateChange', async (state) => {
    if (state === 'poweredOn') {
        console.log("start scanning")
        await noble.startScanningAsync([uuid_service1], false, config);
    }
});

noble.on('discover', async (peripheral) => {
    await noble.stopScanningAsync();
    await peripheral.connectAsync();

    const char1 = (await peripheral.discoverSomeServicesAndCharacteristicsAsync([uuid_service1], [uuid_value1], config)).characteristics;
    readData(char1[0], peripheral)
});

//
// read data periodically
//
let readData = async (char1, peripheral) => {
    const value1 = (await char1.readAsync());
    sensorValue1 = value1.readFloatLE(0);
    // read data again in t milliseconds
    setTimeout( async () => {
        readData(char1, peripheral)
    }, 200);
}

//
// hosting a web-based front-end and respond requests with sensor data
// based on example code on https://expressjs.com/
//

var cors = require('cors')
const express = require('express')
const app = express()
const port = 3000

app.set('view engine', 'ejs');

app.use(cors())

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/game.html', (req, res) => {
    res.render('index')
})


app.get('/winner.html', (req, res) => {
    res.render('winner')
})


app.post('/', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
        sensorValue1: sensorValue1
    }))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})