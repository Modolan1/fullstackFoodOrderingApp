import jwt from "jsonwebtoken"

const jwtSecret = process.env.JWT_SECRET || "development-secret-change-me"

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization || ""
    const [scheme, token] = authHeader.split(" ")

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ success: false, message: "Authentication required." })
    }

    try {
        const decoded = jwt.verify(token, jwtSecret)
        req.userId = decoded.id
        next()
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired session." })
    }
}

export default authMiddleware