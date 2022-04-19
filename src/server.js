require('dotenv').config() // kini nilai dari variable environment yang ada di berkas .env dapat diakses melalui properti process.env.
const Jwt = require('@hapi/jwt');
const Hapi = require('@hapi/hapi');
const notes = require('./api/notes');
const users = require('./api/users');
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManger');
const NotesService = require('./services/postgres/NotesService');
const UsersService = require('./services/postgres/UsersService');
const NotesValidator = require('./validator/notes');
const UsersValidator = require('./validator/users');
const AuthenticationsValidator = require('./validator/authentications');

const init = async () => {
  const authenticationsService = new AuthenticationsService();
  const usersService = new UsersService();
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
      plugin: Jwt,
    }
  ]);

  server.auth.strategy('notesapp_jwt', 'jwt',{
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValide : true,
      credential: {
        id: artifacts.decode.payload.id,
      },
    }),
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
        service: usersService,
        validator: UsersValidator,  
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,  
      },
    }

]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
