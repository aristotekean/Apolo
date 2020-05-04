const five = require('johnny-five');
const admin = require('firebase-admin');
const serviceAccount = require('./ServiceAccountKey.json');
const moment = require('moment');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

let board, thermometer, led;

board = new five.Board();

board.on('ready', function () {
	led = new five.Led(13);

	thermometer = new five.Thermometer({
		controller: 'TMP35',
		pin: 'A0',
		freq: 500
	});

	thermometer.on('change', () => {
		const {
			celsius,
			C
		} = thermometer;
		const temp = celsius - (C / 2 + 1.5);

		db.collection('temperatura').add({
			date: currentDate(),
			temp: temp
		});
		db.collection('luz').get().then((snapshot) => {
			snapshot.forEach((doc) => {
				if (doc.data().state) {
					led.on();
				} else {
					led.off();
				}
			});
		});
	});
});

function currentDate() {
	let date = new Date();

	// Hora
	let h = date.getUTCHours();
	// Mes
	let ms = date.getUTCMinutes();
	// Dia
	let d = date.getUTCDate();
	// Mes
	let m = date.getUTCMonth() + 1;
	// Año
	let y = date.getUTCFullYear();

	// Fecha en formato 17:24-28/4/2020
	let fullDate = `${h}:${ms}-${d}/${m}/${y}`;

	return fullDate;
}