import RequestService from "./services/RequestService.js"
import express from "express"
import cors from "cors"
import env from 'dotenv'
import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import qs from "qs"
const app = express()
app.use(cors())
const port = 80
env.config();

function generateRandomString(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function serialize(obj) {
  var str = [];
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  }
  return str.join("&");
}

app.get('/', (req, res) => {
  let options = {
    root: path.join("./source")
  };

  let fileName = 'main.html';
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Sent:', fileName);
    }
  });
})
app.get('/delete', (req, res) => {
  res.send(req.query)
})
app.get('/home', (req, res) => {
  res.send('Welcome Home!')
})
app.get('/getToken', (req, res) => {
  let code = req.query.code || null;
  let state = req.query.state || null;
  const auth_token = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`, 'utf-8').toString('base64');
  const data = qs.stringify({
    'code': code,
    'redirect_uri': 'https://applications.truedigitaldesign.com/home',
    'grant_type': 'client_credentials'
  });
  let headers = {
    'Authorization': `Basic ${auth_token}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  RequestService("https://accounts.spotify.com/api/token", "POST", data, headers, (success) => {
    console.log(success)
    res.redirect("home")
  }, (error) => {
    appappconsole.log(error)
  })
})
app.get('/login', (req, res) => {
  let client_id = process.env.CLIENT_ID;
  let redirect_uri = 'https://applications.truedigitaldesign.com/getToken'
  let state = generateRandomString(16);
  let scope = 'user-read-private user-read-email';

  res.redirect('https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
})
https
  .createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/applications.truedigitaldesign.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/applications.truedigitaldesign.com/fullchain.pem'),
  }, app)
  .listen(443, () => {
    console.log('HTTPS Server running on port 443');
  })
http
  .createServer(app)
  .listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })



