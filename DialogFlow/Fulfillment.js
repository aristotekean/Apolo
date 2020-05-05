// Inline Editor(Powered by Google Cloud Functions)
// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
// Example FireStore
// https://github.com/dialogflow/fulfillment-firestore-nodejs/blob/master/functions/index.js
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const lights = db.collection("luz").doc("NxLJxugfRGSRTVzhbqRq");
const temperture = db.collection('temperatura');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  
  const agent = new WebhookClient({ request, response });
  
  let date = currentDate();
  
  function turnOn(agent) {
    agent.add(`Bien, ya estoy encendiendo las luces`);

    return lights.update({
        state: true
    })
    .then(function() {
        console.log("Documento actualizado con éxito!");
    })
    .catch(function(error) {
        console.error("Error actualizando el documento: ", error);
    });
    
  }
  
  function turnOff(agent) {
    agent.add(`Entendido, luces apagadas`);

    return lights.update({
        state: false
    })
    .then(function() {
        console.log("Documento actualizado con éxito!");
    })
    .catch(function(error) {
        console.error("Error actualizando el documento: ", error);
    });
    
  }
  
  function currentTempenture(agent) {
    // Get the database collection 'dialogflow' and document 'temperatura'
    const dialogflowAgentDoc = temperture.where("date", "==", date).limit(1);
	
    // Get the value of 'entry' in the document and send it to the user
    return dialogflowAgentDoc.get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
           agent.add(`La temperatura actual es de ${doc.data().temp} grados centígrados`);
        });
    })
    .catch(function(error) {
      	agent.add("Error getting documents: ", error);
    });
  }
  
  function currentDate() {

    let date =  new Date();

    // Año
    let y = date.getUTCFullYear();
    // Mes
    let m = date.getUTCMonth() + 1;
    // Día
    let d = date.getUTCDate();
    // Hora
    let h = date.getUTCHours();
    // Minutos
    let ms = date.getUTCMinutes();

    // Fecha en formato 17:24-28/4/2020 
    let fullDate = `${h}:${ms}-${d}/${m}/${y}`;

    return fullDate;

  }


  let intentMap = new Map();
  intentMap.set('Turn On Lights Intent', turnOn);
  intentMap.set('Turn Off Lights Intent', turnOff);
  intentMap.set('Current Temperture Intent', currentTempenture);
  agent.handleRequest(intentMap);
});