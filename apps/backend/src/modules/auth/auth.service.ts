import { RegisterDto } from "../../shared/interfaces/auth.interface";


export class Authservice {
    public async register(registerData: RegisterDto) {
        const { name, email, password } = registerData;
        
    }
}