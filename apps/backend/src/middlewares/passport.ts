import passport from "passport";
import { setupJwtStrategy } from "../shared/strats/jwt.strategy";

const intializePassport = () => {
    setupJwtStrategy(passport);
}

intializePassport();

export default passport;