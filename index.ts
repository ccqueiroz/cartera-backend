import { BootStrap } from './src/server/bootstrap';
const app = new BootStrap();

const _PORT = 8888;

app.listen(_PORT, () => console.log(`server online, porta: ${_PORT}`));
