import Hapi from '@hapi/hapi';
import notesPlugin from './api/notes/index.js';
import NotesValidator from './validator/notes/index.js';
import NotesService from './services/inMemory/NotesService.js'
import ClientError from './exceptions/ClientError.js';
const init = async () => {
  const notesService = new NotesService
  const server = Hapi.server({
    port: 5000,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
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
