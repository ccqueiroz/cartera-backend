import express, {
  json,
  // Request,
  // Response,
  // NextFunction,
  // Router,
} from 'express';
import cors from 'cors';

export class BootStrap {
  private app = express();

  constructor() {
    console.log('constructor');
  }

  private setupMiddlewares() {
    console.log('setupMiddlewares');
  }

  private setupRoutes() {
    console.log('setupRoutes');
  }

  private setupBootStrap() {
    try {
      this.app.set('x-powered-by', false);
      this.app.use(cors({ origin: true }));
      this.app.use(json());
      this.setupMiddlewares();
      this.setupRoutes();
    } catch (error) {
      console.log(error);
    }
  }

  public getInstance() {
    this.setupBootStrap();
    return this.app;
  }

  public listen(port = 3000, cb?: () => void) {
    const app = this.getInstance();
    console.log('app');
    app.listen(port, cb);
  }
}
