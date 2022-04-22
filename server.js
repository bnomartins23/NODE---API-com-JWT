const express = require('express')
const jwt = require('jsonwebtoken') //gera e confirma
require('dotenv').config()

const app = express()
const blacklist = []

app.use(express.json())

app.get('/', (req, res)=>{
    res.json({message: 'Tudo ok por aqui'})
})

function verifyJWT(req, res, next){
    const token = req.headers['x-access-token']
    const index = blacklist.findIndex(item => item === token)

    if(index !== -1) return res.status(401).json({erro: true, message: 'Token não é válido!'})

    jwt.verify(token, process.env.SECRET, (err,decoded) => {
        if(err) return res.status(401).json({erro: true, message: 'Token inválido!'});
        req.userId = decoded.userId;
        next();
    })
}

app.get('/clientes', verifyJWT, (req, res) => {
    console.log(req.userId+' fez chamada');
    res.json([{id:1, nome:'Luiz'}])
})

app.post('/login', (req, res)=>{
    if(req.body.user === 'luiz' && req.body.password === '123456'){
        // Assinatura servidor para cliente
        // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjUwNjQ2MzkwLCJleHAiOjE2NTA2NDY2OTB9.f_rTjZ5BAiJhTVqoVcQVFC6eyS8jlJEVVqSfvsE2aSs
        const token = jwt.sign({id: 1}, process.env.SECRET, {
            expiresIn: 300
        })
        


        return res.json({auth: true, token})
    }
    res.status(401).json({erro: true, message: 'Usuário e/ou senha inválidos!'})
})

app.post('/logout', (req, res)=>{
    blacklist.push(req.headers['x-access-token'])
    res.status(200).json({erro: false, message: 'Usuário deslogado com sucesso!'})
})

app.listen(3030, (err)=>{
    console.log('Servidor rodando em http://localhost:3030')
})