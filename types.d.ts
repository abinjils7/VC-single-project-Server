import { JwtPayload } from './Middlewares/authMiddleware';

declare module 'express-serve-static-core' {
    interface Request {
        user?: JwtPayload;
    }
}
