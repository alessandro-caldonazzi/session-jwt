# session-jwt | WIP
## This documentation is incomplete for the time being
[![Build Status](https://travis-ci.org/alessandro-caldonazzi/session-jwt.svg?branch=develop)](https://travis-ci.org/alessandro-caldonazzi/session-jwt)  [![Codacy Badge](https://app.codacy.com/project/badge/Grade/ff8c6396456b40eaaa5354a0804d1cea)](https://www.codacy.com/manual/alessandro-caldonazzi/session-ws?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=alessandro-caldonazzi/session-ws&amp;utm_campaign=Badge_Grade)

session-jwt is a nodeJs module that allows you to simplify the use of sessions via JWT and RefreshToken

## Installation

```shell
npm install session-jwt
```
## Usage

```js
const session = require('session-jwt');
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(session.middleware);
```

## Settings

```js
session.settings("segreto", ["/"],  "/login");
```

*   The first argument represents the secret used for jwt
*   The second argument represents a string vector, containing the endpoints protected by authentication
*   The third argument represents the login endpoint
*   The fourth argument (optional), serves to set additional options that will be explained later

### Optional Settings

This is the fourth optional argument of the settings method

```js
{  
	"refreshUrl":  "/refresh",
	"blacklisting":  true,
	"JwtHeaderKeyName":  "jwt"  
}
```

This is the automatic configuration, you can change what you want, but remember to create the relevant endpoints in express

## Methods

| Method Name   | Porpose                                                        |
| ------------- | -------------------------------------------------------------- |
| Setting       | Used to set the configuration                                  |
| newSession    | Used to create a new session for a user                        |
| refresh       | Used to recreate the jwt from the refresh cookie               |
| blacklist     | Used to ban a jwt, for example after a logout                  |
| deleteRefresh | Used to remove the refresh cookie, for example during a logout |

### newSession()

```js
let { jwtToken, refreshToken } = await session.newSession({ "user": "ale" });
```

newSession has only one parameter, a JSON object.
The latter represents the set of data that we want to save in the jwt (you can enter whatever you want)

It returns a promise with two values, the first represents the jwt, while the second represents the refreshToken.
DO NOT SAVE THE JWT IN A COOKIE.

Follow this:

```js
app.get("/login", async(req, res) => {
	let { jwtToken, refreshToken } = await  session.newSession({ "user": "ale" });

	res.cookie("refresh", refreshToken, { maxAge: 90000000, httpOnly: true, secure: true });
	res.send({ "jwt": jwtToken });
});
```

### refresh()

```js
let  jwt  =  await  session.refresh(req);
```

Even refresh() takes only one argument: req (express request object)

A promise returns, with the new jwt
jwt will be undefined if there is no valid refresh cookie in the request

Follow this:

```js
app.get("/refresh", async(req, res) => {
	let jwt = await session.refresh(req);
	if (jwt) {
		res.setHeader("Content-Type",  "application/json");
		res.send({ jwt });
	} else {
		res.redirect(301, "/login");
		res.end();
	}
});
```

### blacklist()

```js
let blacklist = await session.blacklist(req.headers.jwt).catch();
```

Even blacklist() takes only one parameter: a jwt

Return a promise

You can follow this example:

```js
app.get("/blacklist", async(req, res) => {
	let blacklist = await session.blacklist(req.headers.jwt).catch();
	session.deleteRefresh(res);

	res.send({ blacklist });
});
```

In this example the jwt is retrieved from the header (you can choose where to save it) and banned, then the refresh cookie is deleted.

This could simply be a logout endpoint

### deleteRefresh()

```js
session.deleteRefresh(res);
```

Takes only one vestment: res (express response object)
This method deletes the refresh cookie from the client

