import { AuthController } from "./auth.controller";
import { Authservice } from "./auth.service";

const authService = new Authservice();
const authController = new AuthController(authService);

export { authController, authService };