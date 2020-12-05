# Session-jwt [![Build Status](https://travis-ci.org/alessandro-caldonazzi/session-jwt.svg?branch=develop)](https://travis-ci.org/alessandro-caldonazzi/session-jwt)  [![Codacy Badge](https://app.codacy.com/project/badge/Grade/ff8c6396456b40eaaa5354a0804d1cea)](https://www.codacy.com/manual/alessandro-caldonazzi/session-ws?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=alessandro-caldonazzi/session-ws&amp;utm_campaign=Badge_Grade) 
 
This library helps you manage user sessions via jwt.

## How does it work?

The library generates two tokens (**jwt** and **refreshToken**).  
The **jwt** is a token with a close expiry date.  
The **refreshToken** does not expire, it is used to get a new jwt when it expires.

## Installation

```shell
npm install session-jwt
```

## Settings

```js
const session = require('session-jwt');

session.settings(process.env.YOUR_SECRET_ENV_VAR);
```

You must also add *cookie-parser* if you want the library to automatically obtain/add tokens to express requests/responses (more on this later).

```js
const session = require('session-jwt');
const cookieParser = require("cookie-parser");

session.settings(process.env.YOUR_SECRET_ENV_VAR);
```

### Optional Settings

As you saw from the code above you need to call the **settings()** method to set the jwt secret, but you can set other things like **jwtHeaderKeyName** (jwt position in header)

**jwtHeaderKeyName** is by default "jwt"

## Usage

### Create session

#### With cookie

When you want to create new session you can use the **newSessionInCookies** method 

```js
app.get("/login", async(req, res) => {
    let { jwt, refreshToken } = await session.newSessionInCookies({ "user": "ale" }, res, "user");

    res.send({ jwt });
});
```

The first parameter is an object of data you want to save in token.
The second parameter is the Express response object, this is used to set the **refreshToken cookie**

This method returns the **jwt** and **refreshToken** through promise

#### Without cookie

If you don't want to use cookie you can use the **newSession** method

```js
app.get("/login", async(req, res) => {
    let { jwt, refreshToken } = await session.newSession({ "user": "ale" }, "user");

    res.status(200).json({ jwt, refreshToken });
});
```

In this case nothing is saved in cookie

### ensureAuth

To be sure a user has a valid **jwt** to access an endpoint you must use **ensureAuth** in your Express router. 

```js
app.get("/user", session.ensureAuth, (req, res) => {ù
	//there is a valid jwt
    //You can access req.session to get data saved in jwt
    res.send("kk");
});
```

Doing so will automatically **block all requests** that do not have a valid **jwt**. Remember that the **jwt** must be in the position of the header described in the settings

*You can access **req.session*** to get data saved in jwt*

### Refresh token

When the jwt expires you have to create a new one through the refreshToken

#### With cookie

If your **refreshToken** is in cookies named **refresh**, or if you created the session using the **newSessionInCookies** method you can use this method

```js
app.get("/refresh", async(req, res) => {
    try {
        const jwt = await session.refreshFromCookie(req);
        res.status(200).json({ jwt });
    } catch (err) {
    	//if refreshToken is invalid, the user must log in
        res.redirect(301, "/login");
        res.end();
    }
});
```

This method returns a valid **jwt** or false (if **refreshCookie** is invalid)

#### Without cookie

If you are managing the **refreshCookie** on your own you must use this method

```js
app.get("/refresh", async(req, res) => {
    try {
        const refreshToken = req.body.refreshToken;
        const jwt = await session.refresh(refreshToken);
        res.status(200).json({ jwt });
    } catch (err) {
        //if refreshToken is invalid, the user must log in
        res.redirect(301, "/login");
        res.end();
    }
});
```