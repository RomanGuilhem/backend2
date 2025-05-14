import { UserModel } from './models/User.js';
import bcrypt from 'bcrypt';

export class UserDAO {
  async createUser({ first_name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({ first_name, email, password: hashedPassword });
    return await user.save();
  }

  async findByEmail(email) {
    return await UserModel.findOne({ email });
  }

  async findById(id) {
    return await UserModel.findById(id);
  }

  async comparePassword(user, candidatePassword) {
    return await bcrypt.compare(candidatePassword, user.password);
  }
}
