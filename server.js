const bodyParser = require('body-parser');
const exjwt = require('express-jwt');
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRETKEY = 'Craigs Secret Key';
const users = [
    {
        id: 1,
        username: 'craig',
        password: '1234'
    },
    {
        id: 2,
        username: 'egg',
        password: '1234'
    },
];
const jwtMW = exjwt({
    secret: SECRETKEY,
    algorithms: ['HS256']
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});


app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/login', (request, response) => {
    try {
        const requiredFields = ['username', 'password'];
        requiredFields.forEach(field => {
            if (!request.body[field]) {
                throw Error(`Request body is missing required field: ${field}`)
            }
        });
    } catch (error) {
        response.status(400).json({
            success: false,
            error: error,
            token: null
        });
    }

    if (!users.find(user => {
        if (user.username === request.body['username'] && user.password === request.body['password']) {
            let token = jwt.sign({id: user.id, username: user.username}, SECRETKEY, {expiresIn: '7d'});
            response.status(200).json({
                success: true,
                error: null,
                token: token
            });
            return user;
        }
    })) {
        response.status(200).json({
            success: false,
            error: 'Username or password invalid',
            token: null
        });
    }
});

app.get('/api/dashboard', jwtMW, (request, response) => {
    response.status(200).json({
        success: true,
        error: null,
        content: 'You\'ve made it past the guards.'
    });
});

app.get('/api/prices', jwtMW, (request, response) => {
    response.status(200).json({
        success: true,
        error: null,
        content: '$12.12 | $13.13 | $14.14'
    });
});

app.use((error, request, response, next) => {
    if (error.name === 'UnauthorizedError') {
        response.status(401).json({
            success: false,
            error: error
        });
    } else {
        next(error);
    }
});

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});
