import  express  from "express";
import { authMiddleware } from "../Middlewares/authMiddleware";
import { getUser } from "../Controllers/UserController";

const router = express.Router()

router.get('/',authMiddleware,getUser)

export default router 