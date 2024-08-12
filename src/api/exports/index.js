import routes from "./routes.js";
import ExportsHandler from "./handler.js";

const exportsPlugin = {
  name: "exports",
  version: "1.0.0",
  register: async(server,{service,validator})=>{
    const exportsHandler = new ExportsHandler(service,validator);
    server.route(routes(exportsHandler))
  }
}

export default exportsPlugin