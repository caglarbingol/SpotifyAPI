import axios from "axios";
axios.defaults.port = 80;
const baseUrl = axios.create()
export default (url, postMethod, data, headers, responseFunc, errorFunc) => {
        if (postMethod == 'GET') {
            baseUrl.get(url, data, {headers: headers})
                .then((response) => {
                    responseFunc(response)
                })
                .catch((error) => {
                    errorFunc(error)
                })
        }
        if (postMethod == 'POST') {
            baseUrl.post(url, data, {headers: headers})
                .then((response) => {
                    responseFunc(response)
                })
                .catch((error) => {
                    errorFunc(error)
                })
        }
    }