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


function refreshAuth(mySelf, refreshToken) {
  let headers = { 'Authorization': 'Basic ' + (new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')) }
  let data = qs.stringify({
    "refresh_token": refreshToken,
    'grant_type': 'refresh_token'
  })
  RequestService.spotifyAuth("", "POST", data, headers, (success) => {
    console.log(success)
    mySelf(success.data.access_token);
  }, (error) => {
    console.log(error)
  })
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

app.get('/login', (req, res) => {
  let redirect_uri = 'https://applications.truedigitaldesign.com/getToken'
  let scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope: scope,
      redirect_uri: redirect_uri,
    }));
})


app.get('/getToken', (req, res) => {
  let code = req.query.code || null;
  let auth_token = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`, 'utf-8').toString('base64');
  let data = qs.stringify({
    'code': code,
    'redirect_uri': 'https://applications.truedigitaldesign.com/getToken',
    'grant_type': 'authorization_code'
  });
  let headers = {
    'Authorization': `Basic ${auth_token}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  RequestService.spotifyAuth("", "POST", data, headers, (success) => {
    let refreshToken = success.data.refresh_token
    let token = success.data.access_token
    function mySelf(newToken) {
      if (newToken != null)
        token = newToken
      let headers = { 'Authorization' : 'Bearer ' + token }
      RequestService.spotifyApi(refreshToken, "/tracks/2TpxZ7JUBn3uw46aR7qd6V", "GET",null, headers, (success) => {
        console.log(success)
        res.redirect('/home')
      }, (error) => {
        console.log(error)
        refreshAuth(mySelf, refreshToken)
      })
    }
    mySelf(null)
  }, (error) => {
    console.log(error)
  })
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