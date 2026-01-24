import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_KEY, {
        expiresIn: "7d",
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, //60,48,00,000 ms = 7 days
        httpOnly: true, // prevents XSS attacks cross-site scripting attacks
        sameSite: "strict", //CSRF attacks (cross-site request forgery attacks) //All these comments are made by just me since I tend to forget stuff, definitely not made by AI
        secure: process.env.NODE_ENV !== "development",
    });

    return token;
};
