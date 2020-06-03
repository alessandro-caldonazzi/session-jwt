# Session-Ws

## ATTENTION: session-ws is completely changing, its new name is session-jwt.
The package will now include the use of JWT and Refresh-Token.

### The old session-ws will remain available in the "deprecated" brach, but will not be officially supported

WIP

this module is used to maintain a session with the user

ATTENTION: The module is currently in beta

## Installation

Use npm to install


```bash
npm install session-ws
```

## Usage

Require the module

```JSX
const s=require('session-ws');
```

also request the cookie-parser module

```JSX
const cookieParser = require('cookie-parser')
app.use(cookieParser("secret"));
```

### Config

If you want you can edit the default config

#### Default config

```JSX
config = {
    "auto-create": false,
    "signed-cookie": true
}
```

Use the configJson() function

```JSX
s.configJson({"auto-create":true});
```

## Syntax

Each method returns the result of the operation or its outcome

| Result | Why |
|:-------|----:|
| True   | The operation was successful |
| False  | The operation was not successful |

## Session

### New Session

When you need to create a new session for a user, you need to call the new () method and pass it the express response

```JSX
app.get('/g', (req, res)=>{
    s.new(res);
    res.send("ok");
});
```

The method creates an id and saves it in a cookie, when you send a response to the client, the cookie will be attached to the response

### Insert Data

To insert data into a user's session you can use the addOne() and addJson() methods
The addOne() method adds only one data, while addJson() adds more data via a Json object

In the id slot you can pass both a string containing the session id and the request for express (the method will independently retrieve the session id from the cookie)

#### addOne()

```JSX
app.get('/insert', (req, res)=>{
    s.add(req, "email", "email@example.com");
});
```

#### addJson()

```JSX
app.get('/insert', (req, res)=>{
    let obj={
        "email":"email@example.com"
    }
    s.addJson(req, obj);
});
```

### Get data

To get a value saved in the session you can use the get () and getOne () methods, both return an object

In the id slot you can pass both a string containing the session id and the request for express (the method will independently retrieve the session id from the cookie)

#### get()

```JSX
app.get('/get', (req, res)=>{
    let result = s.get(req);
    console.log(result);
});
```

The result of the get() method will be an object containing all the data

#### getOne()

```JSX
app.get('/getOne', (req, res)=>{
    s.getOne(req, "email");
});
```

The result of the getOne() method will be the requested data / object
In this case the value belonging to the user will be returned, linked to the "email" key


### Remove data

To remove data from the session you can use the removeKey() and cleanValue() methods
The removeKey () method completely eliminates the value and its key.
The cleanValue () method only deletes the value and sets it to undefined

#### removeKey()

```JSX
app.get('/removeKey', (req, res)=>{
    s.removeKey(req, "email");
});
```

#### cleanValue()

```JSX
app.get('/cleanValue', (req, res)=>{
    s.cleanValue(req, "email");
});
```
