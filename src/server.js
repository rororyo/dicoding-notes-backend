import env from 'dotenv';
import Hapi from '@hapi/hapi';
import Jwt from '@hapi/jwt';
//notes
import notesPlugin from './api/notes/index.js';
import NotesValidator from './validator/notes/index.js';
import NotesService from './services/postgres/NotesService.js'
//users
import usersPlugin from './api/users/index.js';
import UsersService from './services/postgres/UsersService.js';
import UsersValidator from './validator/users/index.js';
//authentications
import authenticationsPlugin from './api/authentications/index.js';
import AuthenticationsService from './services/postgres/AuthenticationsService.js';
import TokenManager from './tokenize/TokenManager.js';
import AuthenticationsValidator from './validator/authentications/index.js';

import ClientError from './exceptions/ClientError.js';
import { verify } from 'argon2';
env.config();
const init = async () => {
  const notesService = new NotesService
  const usersService = new UsersService
  const authenticationsService = new AuthenticationsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
  //plugin external
  await server.register([
    {
      plugin: Jwt,
    },
  ])
  //strategi autentikasi jwt
  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys:process.env.ACCESS_TOKEN_KEY,
    verify:{
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE
    },
    validate:(artifacts)=>({
      isValid:true,
      credentials:{
        id:artifacts.decoded.payload.id
      },
    }),
  })
  //plugin internal
  await server.register([
    {
      plugin: notesPlugin,
      options: {
        service: notesService,
        validator: NotesValidator,
      },
    },
    {
      plugin: usersPlugin,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authenticationsPlugin,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
  ]);
  server.ext('onPreResponse',(request,h)=>{
    const {response} = request
    if(response instanceof ClientError){
      const newResponse = h.response({
        status: 'fail',
        message: response.message
      })
      newResponse.code(response.statusCode)
      return newResponse
    }
    return h.continue;
  })
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};
// registrasi banyak plugin sekaligus
//   await server.register([
//     {
//       plugin: notesPlugin,
//       options: { notes: [] },
//     },
//     {
//       plugin: otherPlugin,
//       options: { /* berikan nilai options jika dibutuhkan */ }
//     }
//   ]);
 

init();
