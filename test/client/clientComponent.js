function Session() {
    var jwt = "";
    var config = {
        "refreshUrl": "/refresh",
        "blacklist": {
            "enabled": true,
            "endpoit": "/blacklist"
        },
        "JwtKeyName": "jwt",
        "advancedSecurity": true
    }

    this.fetch = async(url, option = {}) => {
        if (option.headers == undefined) {
            option.headers = {};
        }
        option.headers[config.JwtKeyName] = jwt;
        return await fetch(url, option);
    }

    this.refresh = async() => {
        jwt = await getJwt();
    }

    var getJwt = () => {
        return new Promise((resolve, reject) => {
            this.fetch(config.refreshUrl)
                .then(response => response.json())
                .then(data => {
                    console.log(data[config.JwtKeyName])
                    resolve(data[config.JwtKeyName]);
                })
                .catch(err => reject(err));
        });
    }

    this.blacklist = () => {
        if (config.blacklist.enabled) {
            this.fetch(config.blacklist.endpoit);
        }
    }


}