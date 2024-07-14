import NotesHandler from "./handler.js";
import routes from "./routes.js";

const notesPlugin = {
    name: 'notes',
    version: '1.0.0',
    register: async (server, {service, validator}) => {
        const notesHandler = new NotesHandler(service,validator);
        server.route(routes(notesHandler))
    }
};

export default notesPlugin;
