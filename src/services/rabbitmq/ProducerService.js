const amqp = require('amqplib');
/* pada service producer tidak perlu menggunakan class, karena tidak membutuhkan penggunaan keyword this 
yang merujuk pada instance dari class. berbeda dengan service yang lain. Kita menggunakan this untuk 
mengakses this._pool untuk ke database.*/
const ProducerService = {
    sendMessage: async (queue, message) => {
        const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
        const channel = await connection.createChannel();
        await channel.assertQueue(queue, {
            durable: true,
        });

        await channel.sendToQueue(queue, Buffer.from(message));
        
        setTimeout(()=>{
            connection.close();
        },1000)
    },
}

module.exports = ProducerService;