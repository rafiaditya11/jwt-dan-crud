import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
 
export const getUsers = async(req, res) => {
    try {
        const users = await Users.findAll({
            attributes:['id','name','email']
        });
        res.json(users);
    } catch (error) {
        console.log(error);
    }
}

export const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await Users.findOne({
            where: { id },
            attributes: ['id', 'name', 'email']
        });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Failed to retrieve user" });
    }
};


export const Register = async(req, res) => {
    const { name, email, password, confPassword } = req.body;
    if(password !== confPassword) return res.status(400).json({msg: "Password and Confirm Password do not match"});
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    try {
        await Users.create({
            name: name,
            email: email,
            password: hashPassword
        });
        res.json({msg: "Registration Successful"});
    } catch (error) {
        console.log(error);
    }
}
 
export const Login = async(req, res) => {
    try {
        const user = await Users.findAll({
            where:{
                email: req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if(!match) return res.status(400).json({msg: "Wrong Password"});
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
        const accessToken = jwt.sign({userId, name, email}, process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: '15s'
        });
        const refreshToken = jwt.sign({userId, name, email}, process.env.REFRESH_TOKEN_SECRET,{
            expiresIn: '1d'
        });
        await Users.update({refresh_token: refreshToken},{
            where:{
                id: userId
            }
        });
        res.cookie('refreshToken', refreshToken,{
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({ accessToken });
    } catch (error) {
        res.status(404).json({msg:"Email not found"});
    }
}
 
export const Logout = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return res.sendStatus(204);
    const user = await Users.findAll({
        where:{
            refresh_token: refreshToken
        }
    });
    if(!user[0]) return res.sendStatus(204);
    const userId = user[0].id;
    await Users.update({refresh_token: null},{
        where:{
            id: userId
        }
    });
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
}

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    try {
        const user = await Users.findByPk(id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        const updates = { name, email };

        if (password) {
            const salt = await bcrypt.genSalt();
            updates.password = await bcrypt.hash(password, salt);
        }

        await user.update(updates);
        res.json({ msg: "User updated successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Failed to update user" });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await Users.findByPk(id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        await user.destroy();
        res.json({ msg: "User deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Failed to delete user" });
    }
};

export const addUser = async (req, res) => {
    const { name, email, password, confPassword } = req.body;

    if (password !== confPassword) return res.status(400).json({ msg: "Password and Confirm Password do not match" });

    try {
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = await Users.create({
            name,
            email,
            password: hashPassword
        });

        res.status(201).json({ msg: "User added successfully", user: newUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Failed to add user" });
    }
};