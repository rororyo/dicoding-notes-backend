import env from 'dotenv';
import Hapi from '@hapi/hapi';
//notes
import notesPlugin from './api/notes/index.js';
import NotesValidator from './validator/notes/index.js';
import NotesService from './services/postgres/NotesService.js'
//users
import usersPlugin from './api/users/index.js';
import UsersService from './services/postgres/UsersService.js';
import UsersValidator from './validator/users/index.js';

import ClientError from './exceptions/ClientError.js';
env.config();
const init = async () => {
  const notesService = new NotesService
  const usersService = new UsersService
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
  await server.register({
    plugin : notesPlugin,
    options: {
      service: notesService,
      validator: NotesValidator
    },
  })
  await server.register({
    plugin : usersPlugin,
    options: {
      service: usersService,
      validator: UsersValidator
    },
  })
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
