import { UserDAO } from '../dao/user.dao.js';

export class UserRepository {
  constructor() {
    this.dao = new UserDAO();
  }

  async register(userData) {
    return await this.dao.createUser(userData);
  }

  async login(email, password) {
    const user = await this.dao.findByEmail(email);
    if (!user) return null;

    const isValid = await this.dao.comparePassword(user, password);
    return isValid ? user : null;
  }

  async getById(id) {
    return await this.dao.findById(id);
  }

  async getByEmail(email) {
    return await this.dao.findByEmail(email);
  }
}
