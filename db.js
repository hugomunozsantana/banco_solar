const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'bancosolar',
    password: '1234',
    max: 12,
    min: 2,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 2000
  })

  async function add_transferencia (emisor, receptor,monto){
    try{
        const client = await pool.connect()
        const emisor_id = await client.query({
          text: `select * from usuarios where nombre=$1`,
          values: [emisor]
        })

        const receptor_id = await client.query({
          text: `select * from usuarios where nombre=$1`,
          values: [receptor]
        })
        const id_emisor= emisor_id.rows[0].id
        const id_receptor=receptor_id.rows[0].id
        console.log('emisor', id_emisor, 'receptor', id_receptor);

        let saldoEmisor=emisor_id.rows[0].balance
        let saldoReceptor=receptor_id.rows[0].balance 
        console.log('balanceEmisor',saldoEmisor,'balanceReceptor',saldoReceptor);

        if ((saldoEmisor-monto)<0){
          console.log('saldo insuficiente para realizar la transferencia');
          return
        }else if(id_emisor==id_receptor){
          console.log('debe elegir un receptor diferente al emisor');
          return
        }else{
          await actualizar(emisor,saldoEmisor-monto,id_emisor)
          await actualizar(receptor,parseInt(saldoReceptor)+parseInt(monto),id_receptor)
          await client.query({
            text: `insert into transferencias (emisor,receptor,monto) values ($1,$2,$3) returning *`,
            values:[id_emisor,id_receptor,monto]
          })
        }
        client.release()
       }catch(error){
         console.log(error);
       }
  }

  async function mostrar_trans(){
    try{
          const client = await pool.connect()
          const {rows} = await client.query({
            text:`select transferencias.fecha,usuarios.nombre, usuarios2.nombre, transferencias.monto 
                  from transferencias 
                  join usuarios on usuarios.id=transferencias.emisor 
                  join usuarios as usuarios2 on usuarios2.id=transferencias.receptor`,
            rowMode:'array'
            })
          client.release()
          return rows
        }catch(error){
          console.log(error);
        }
  }

  async function insertar (nombre,balance){
    try{
          const client = await pool.connect()
          const {rows} = await client.query({
            text: `insert into usuarios (nombre,balance) values ($1,$2) returning *`,
            values:[nombre,balance]
          })
          client.release()
          return rows[0]
       }catch(error){
         console.log(error);
       }
  }

  async function mostrar(){
    try{
        const client = await pool.connect()
        const {rows} = await client.query('select * from usuarios')
        client.release()
        return rows
       }catch(error){
          console.log(error);
       }
  }

  async function actualizar (nombre,balance,id){
    try{
        const client = await pool.connect()
        const {rows} = await client.query({
          text: `update usuarios set nombre=$1,balance=$2 where id=$3 returning *`,
          values:[nombre,balance,id]
        })
        client.release()
        return rows[0]
       }catch(error){
          console.log(error);
       }
  }

  async function eliminar(id){
    try{
        const client = await pool.connect()
        await client.query({
          text: `delete from transferencias where emisor=$1 or receptor=$1`,
          values:[id]
        })
        await client.query({
          text: `delete from usuarios where id=$1`,
          values:[id]
        })
        client.release()
        return
       }catch(error){
          console.log(error);
       }
  }

  module.exports = {insertar,mostrar,actualizar,eliminar,add_transferencia,mostrar_trans}