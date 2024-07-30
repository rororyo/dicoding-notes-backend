import routes from "./routes.js";
import AuthenticationsHandler from "./handler.js";
import { server } from "@hapi/hapi";

const authenticationsPlugin = {
  name: "authentications",
  version: "1.0.0",
  register: async (server,{
    authenticationsService,
    usersService,
    tokenManager,
    validator
  })=>{
    const authenticationsHandler = new AuthenticationsHandler(
      authenticationsService,
      usersService,
      tokenManager,
      validator
    );
    server.route(routes(authenticationsHandler));
  }
}

export default authenticationsPlugin