import jwt from "jsonwebtoken"

const jwtSecret = process.env.JWT_SECRET || "development-secret-change-me"

const adminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization || ""
    const [scheme, token] = authHeader.split(" ")

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ success: false, message: "Admin authentication required." })
    }

    try {
        const decoded = jwt.verify(token, jwtSecret)

        if (decoded.role !== "admin") {
            return res.status(403).json({ success: false, message: "Admin access required." })
        }

        req.adminEmail = decoded.email
        next()
    } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired admin session." })
    }
}

export default adminAuth