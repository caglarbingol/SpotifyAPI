import axios from "axios";
axios.defaults.port = 80;
const spotifyAuth = axios.create({
    baseURL: "https://accounts.spotify.com/api/token"
})
const spotifyApi = axios.create({
    baseURL: `https://api.spotify.com/v1`
})
export default {
    spotifyAuth: (url, postMethod, data, headers, responseFunc, errorFunc) => {
        if (postMethod == 'GET') {
            spotifyAuth.get(url, data, { headers: headers })
                .then((response) => {
                    responseFunc(response)
                })
                .catch((error) => {
                    errorFunc(error)
                })
        }
        if (postMethod == 'POST') {
            spotifyAuth.post(url, data, { headers: headers })
                .then((response) => {
                    responseFunc(response)
                })
                .catch((error) => {
                    errorFunc(error)
                })
        }},
    spotifyApi: (refreshToken, url, postMethod, data, headers, responseFunc, errorFunc) => {
        if (postMethod == 'GET') {
            spotifyApi.get(url, { headers: headers })
                .then((response) => {
                    responseFunc(response)
                })
                .catch((error) => {
                    errorFunc(error)
                })
        }
        if (postMethod == 'POST') {
            spotifyApi.post(url, data, { headers: headers })
                .then((response) => {
                    responseFunc(response)
                })
                .catch((error) => {
                    errorFunc(error)
                })
        }
    }
}