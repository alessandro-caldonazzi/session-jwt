let session = {
	"utenti": {
		"111": {
			"email": "alecodbo3@gmail.com",
			"status": "off"
		}
	}
};
let config = {
	"auto-create": false,
	"signed-cookie": false
}

exports.configJson = (JsonObj) => {
	for (let key in JsonObj) {
		if (config.hasOwnProperty(key)) {
			config[key] = JsonObj[key];
		} else {
			console.log("ERROR: Invalid property in config");
		}
	}
}
exports.new = (res) => {
	let id = '';
	do {
		let length = 20;
		
		let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			id += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
	} while (esiste_id(id))


	session.utenti[id] = {
		"status": "added"
	};
	res.cookie('session', id, {
		signed: config["signed-cookie"]
	})
	return id;

}
exports.exist = (id) => {
	if (!str(id)) {
		id = id.cookies.session;
	}
	if (esiste_id(id)) {
		return true;
	} else {
		return false;
	}

}
exports.get = (id) => {
	if (!str(id)) {
		id = id.cookies.session;
	}
	if (esiste_id(id)) {
		return session.utenti[id];
	} else {
		return false;
	}

}
exports.getOne = (id, key) => {
	if (!str(id)) {
		id = id.cookies.session;
	}
	if (esiste_id(id)) {
		return session.utenti[id][key];
	} else {
		return false;
	}
}
exports.removeKey = (id, key) => {
	//Complete removal a single record from session
	if (!str(id)) {
		id = id.cookies.session;
	}
	if (esiste_id(id)) {

		delete session.utenti[id][key];
		return true;
	} else {
		return false;
	}
}
exports.enable = (id) => {
	if (!str(id)) {
		id = id.cookies.session;
	}
	if (esiste_id(id)) {
		session.utenti[id].status = "enable";
		return true;
	} else {
		return false;
	}
}
exports.disable = (id) => {
	if (!str(id)) {
		id = id.cookies.session;
	}
	if (esiste_id(id)) {
		session.utenti[id].status = "disable";
		return true;
	} else {
		return false;
	}
}
exports.cleanValue = (id, key) => {
	//set a value to undefined
	if (!str(id)) {
		id = id.cookies.session;
	}
	if (esiste_id(id)) {

		session.utenti[id][key] = undefined;
		return true;
	} else {
		return false;
	}
}

exports.addOne = (id, key, value) => {
	/*

	Add a single record to session

	*/
	if (!str(id)) {
		id = id.cookies.session;
	}
	if (esiste_id(id)) {


		session.utenti[id][key] = value;
		return true;

	} else {
		return false;
	}


}
exports.addJson = (id, args) => {
	/* args= {
	        "test":3,
	        "c":5
	   }
	*/
	//let arg_pre;
	/*
	for(let i=0;i<arguments.lenght;i++){
	    if(i!=0){
	        if(dispari(i)){
	            if(typeof arg =="string"){
	                arg_pre=arguments[i];
	            }else{
	                console.log("ERROR: the odd parameters must be strings");
	                break;
	            }
	        }else{
	            if(arg_pre!=null&&arg_pre!=undefined){
	                session.utenti[id][arg_pre]=arguments[i];
	            }else{
	                console.log("ERROR: fatal error");
	                break;
	            }
	        }
	        
	    }
	    
	}
	*/
	if (!str(id)) {
		id = id.cookies.session;
	}
	if (esiste_id(id)) {
		for (let key in args) {
			session.utenti[id][key] = args[key];
		}
		return true;
	} else {
		return false;
	}


}

function esiste_id(id) {
	return session.utenti.hasOwnProperty(id);
}

function dispari(n) {
	return n % 2;
}

function str(obj) {
	if (typeof obj == "string") {
		return true;
	} else {
		return false;
	}
}