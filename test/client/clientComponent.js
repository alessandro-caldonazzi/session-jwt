function Session() {
    var jwt = "";
    let config = {
        "refreshUrl": "/refresh"
    }

    this.fetch = async(url, option = {}) => {
        option.headers = {
            ...option.headers,
            "jwt": jwt
        };
        return await fetch(url, option);
    }

    this.refresh = () => {
        this.fetch(config.refreshUrl)
            .then(response => response.json())
            .then(data => {
                jwt = data.jwt;
            });
    }
}
/*
let sessione = new Session();
sessione.refresh()
sessione.fetch("/")
    .then(response => response.text())
    .then(data => console.log(data));

    */