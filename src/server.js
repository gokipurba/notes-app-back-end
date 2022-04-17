require('dotenv').config() // kini nilai dari variable environment yang ada di berkas .env dapat diakses melalui properti process.env.
const Hapi = require('@hapi/hapi');
const notes = require('./api/notes');
const users = require('./api/users');
const NotesService = require('./services/postgres/NotesService');
const UsersService = require('./services/postgres/UsersService');
const NotesValidator = require('./validator/notes');
const UsersValidator = require('./validator/users');

const init = async () => {
  const userService = new UsersService;
  const notesService = new NotesService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  
  await server.register([
    {
      plugin: notes,
      options: {
        service: notesService,
        validator: NotesValidator,  
      },
    },
    {
      plugin: users,
      options: {
        service: userService,
        validator: UsersValidator,  
      },
    }

]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
