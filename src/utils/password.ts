import * as bcrypt from 'bcrypt';

export async function password(password: string) {
    const salt = await bcrypt.genSalt(10)

    const hash = await bcrypt.hash(password, salt);
    
    return hash
}