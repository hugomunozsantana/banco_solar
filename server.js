const express = require ('express')
const {insertar,mostrar,actualizar,eliminar,add_transferencia,mostrar_trans} = require ('./db.js')

const app = express()
app.use(express.static('static'))

app.get('/usuarios', async (req,res) => {
    let usuarios=[]
    usuarios = await mostrar()
    res.json(usuarios)
})

app.get('/transferencias', async (req,res) => {
    let transferencias = []
    transferencias = await mostrar_trans()
    res.json(transferencias)
})

app.post('/transferencia', async (req,res)=>{
    let body = ''
    req.on('data', (data) => body += data)
    req.on('end', async () => {
        console.log(body);
        body = JSON.parse(body)
        await add_transferencia(body.emisor,body.receptor,body.monto)
        res.status(201).json({todo:'ok'})

    })
})

app.post('/usuario', async (req,res)=>{
    let body = ''
    req.on('data', (data) => body += data)
    req.on('end', async () => {
        console.log(body);
        body = JSON.parse(body)
        try{
            await insertar(body.nombre,body.balance)
        }catch(error){
            if (error.code=='23505'){
                console.log(error);
                return res.status(400).send({mensaje:"Nombre de usuario existente, ingrese otro usuario"})
            }
        }
        res.status(201).json({todo:'ok'})

    })
})

app.put('/usuario', async (req,res)=>{
    let body = ''
    req.on('data', (data) => body += data)
    req.on('end', async () => {
        console.log(body);
        body = JSON.parse(body)
        try{
            await actualizar(body.name,body.balance,req.query.id)
        }catch(error){
            if(error.code=='22P02'){
                console.log(error);
                return res.status(400).send({mensaje:"Debe llenar todos los campos vacíos"})
            }
        }
        res.status(201).json({todo:'ok'})

    })
})

app.delete('/usuario', async (req,res)=>{
    const id = req.query.id
    await eliminar(id)
    res.send({todo:'ok'})
})

app.listen(3000, () => console.log('servidor ejecutando en puerto 3000'))