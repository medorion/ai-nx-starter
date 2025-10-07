export class Utils {
  public static createToken() {
    let j;
    let t = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = (j = 0); j < 55; i = ++j) {
      t += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return `${t}Z${new Date().getTime().toString(36)}`;
  }
}
