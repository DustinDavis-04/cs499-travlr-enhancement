export class StorageService {

  private static readonly TOKEN_KEY = 'travlr-token';

  public static saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  public static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  public static isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }
}