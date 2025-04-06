// Este archivo simula una base de datos para gestionar usuarios
// En una aplicación real, se conectaría con una base de datos real

type User = {
  id: string;
  name: string | null;
  email: string;
  hashedPassword: string | null;
};

// Simulación de base de datos local
class Database {
  users: User[] = [];

  async findUnique({ where }: { where: { email: string } }): Promise<User | null> {
    return this.users.find(user => user.email === where.email) || null;
  }

  async create({ data }: { data: Omit<User, 'id'> & { id?: string } }): Promise<User> {
    const id = data.id || `user-${Date.now()}`;
    const newUser = { id, ...data } as User;
    this.users.push(newUser);
    return newUser;
  }
}

// Singleton para simular "conexión" a la base de datos
export const db = {
  user: new Database(),
}; 