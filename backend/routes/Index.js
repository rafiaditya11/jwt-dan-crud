import express from "express";
import { getUsers, Register, Login, Logout, updateUser, deleteUser, addUser, getUserById } from "../controllers/Users.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";
 
const router = express.Router();
 
router.get('/users', verifyToken, getUsers);
router.get('/users/:id', verifyToken, getUserById);
router.post('/users', Register);
router.post('/login', Login);
router.get('/token', refreshToken);
router.delete('/logout', Logout);
router.put('/users/:id', verifyToken, updateUser);
router.delete('/users/:id', verifyToken, deleteUser);
router.post('/add-user', addUser);

export default router;