let config = {};

function Session() {
    var jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWxlIiwiaWF0IjoxNTkxNjI3ODc1LCJleHAiOjE1OTE2MjgyNzV9.OA6TFBMDNoOxkTdYUr_v311P825N0lf3KJ4ww7qxqlY";

    this.fetch = async(url, option = {}) => {
        option.headers = {
            ...option.headers,
            "jwt": jwt
        }
        console.log(option)
        return await fetch(url, option);
    }
}
let sessione = new Session();
sessione.fetch("/")
    .then(response => response.text())
    .then(data => console.log(data));