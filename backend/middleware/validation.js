import mongoose from "mongoose"
import validator from "validator"

const foodCategories = ["rice", "soup", "dessert", "swallow", "snacks", "drinks", "pepper-soup"]
const orderStatuses = ["Food Processing", "Out for Delivery", "Delivered"]
const paymentMethods = ["Cash On Delivery", "Card"]
const imageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const addressFields = [
    "firstName",
    "lastName",
    "email",
    "street",
    "city",
    "state",
    "zipCode",
    "country",
    "phone",
]

const createValidationError = (message, fields = []) => ({
    success: false,
    message,
    fields,
})

const addFieldError = (errors, field, message) => {
    errors.push({ field, message })
}

const sendValidationErrors = (res, errors, fallbackMessage = "Invalid request input.") => {
    const message = errors[0]?.message || fallbackMessage
    return res.status(400).json(createValidationError(message, errors))
}

const normalizeString = (value) => String(value ?? "").trim()

const validateMongoId = (value) => mongoose.isValidObjectId(normalizeString(value))
const legacyFoodIdPattern = /^[A-Za-z0-9_-]+(?: [A-Za-z0-9_-]+){0,15}$/
const validateFoodId = (value) => {
    const normalizedId = normalizeString(value)
    return (
        normalizedId.length > 0
        && normalizedId.length <= 64
        && (validateMongoId(normalizedId) || legacyFoodIdPattern.test(normalizedId))
    )
}

const validateImageUpload = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json(createValidationError("Image file is required.", [
            { field: "image", message: "Image file is required." },
        ]))
    }

    if (!imageMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json(createValidationError("Image must be a JPG, PNG, WEBP, or GIF file.", [
            { field: "image", message: "Image must be a JPG, PNG, WEBP, or GIF file." },
        ]))
    }

    next()
}

const validateAddFood = (req, res, next) => {
    const errors = []
    const name = normalizeString(req.body.name)
    const description = normalizeString(req.body.description)
    const category = normalizeString(req.body.category)
    const priceValue = normalizeString(req.body.price)
    const price = Number(priceValue)

    if (!name) {
        addFieldError(errors, "name", "Name is required.")
    } else if (name.length > 120) {
        addFieldError(errors, "name", "Name must be 120 characters or fewer.")
    }

    if (!description) {
        addFieldError(errors, "description", "Description is required.")
    } else if (description.length > 1000) {
        addFieldError(errors, "description", "Description must be 1000 characters or fewer.")
    }

    if (!category) {
        addFieldError(errors, "category", "Category is required.")
    } else if (!foodCategories.includes(category)) {
        addFieldError(errors, "category", "Category is invalid.")
    }

    if (!priceValue) {
        addFieldError(errors, "price", "Price is required.")
    } else if (!Number.isFinite(price) || price < 0) {
        addFieldError(errors, "price", "Price must be a valid non-negative number.")
    }

    if (errors.length > 0) {
        return sendValidationErrors(res, errors)
    }

    req.body.name = name
    req.body.description = description
    req.body.category = category
    req.body.price = Number(price.toFixed(2))

    next()
}

const validateRemoveFood = (req, res, next) => {
    const id = normalizeString(req.body.id)

    if (!validateMongoId(id)) {
        return res.status(400).json(createValidationError("A valid food id is required.", [
            { field: "id", message: "A valid food id is required." },
        ]))
    }

    req.body.id = id
    next()
}

const validateUpdateFood = (req, res, next) => {
    const errors = []
    const id = normalizeString(req.body.id)
    const name = normalizeString(req.body.name)
    const description = normalizeString(req.body.description)
    const category = normalizeString(req.body.category)
    const priceValue = normalizeString(req.body.price)
    const price = Number(priceValue)

    if (!validateMongoId(id)) {
        addFieldError(errors, "id", "A valid food id is required.")
    }

    if (!name) {
        addFieldError(errors, "name", "Name is required.")
    } else if (name.length > 120) {
        addFieldError(errors, "name", "Name must be 120 characters or fewer.")
    }

    if (!description) {
        addFieldError(errors, "description", "Description is required.")
    } else if (description.length > 1000) {
        addFieldError(errors, "description", "Description must be 1000 characters or fewer.")
    }

    if (!category) {
        addFieldError(errors, "category", "Category is required.")
    } else if (!foodCategories.includes(category)) {
        addFieldError(errors, "category", "Category is invalid.")
    }

    if (!priceValue) {
        addFieldError(errors, "price", "Price is required.")
    } else if (!Number.isFinite(price) || price < 0) {
        addFieldError(errors, "price", "Price must be a valid non-negative number.")
    }

    if (errors.length > 0) {
        return sendValidationErrors(res, errors)
    }

    req.body.id = id
    req.body.name = name
    req.body.description = description
    req.body.category = category
    req.body.price = Number(price.toFixed(2))

    next()
}

const validatePlaceOrder = (req, res, next) => {
    const errors = []
    const items = Array.isArray(req.body.items) ? req.body.items : null
    const rawAddress = req.body.address && typeof req.body.address === "object" && !Array.isArray(req.body.address)
        ? req.body.address
        : null
    const paymentMethod = normalizeString(req.body.paymentMethod || "Cash On Delivery")

    if (!items || items.length === 0) {
        addFieldError(errors, "items", "Add at least one item before placing an order.")
    }

    if (!rawAddress) {
        addFieldError(errors, "address", "Delivery address is required.")
    }

    if (!paymentMethods.includes(paymentMethod)) {
        addFieldError(errors, "paymentMethod", "Payment method is invalid.")
    }

    const sanitizedAddress = {}

    if (rawAddress) {
        for (const field of addressFields) {
            const value = normalizeString(rawAddress[field])

            if (!value) {
                addFieldError(errors, `address.${field}`, `${field} is required.`)
            }

            sanitizedAddress[field] = value
        }

        if (sanitizedAddress.email && !validator.isEmail(sanitizedAddress.email)) {
            addFieldError(errors, "address.email", "Email address is invalid.")
        }

        if (sanitizedAddress.phone && !validator.isMobilePhone(sanitizedAddress.phone, "any", { strictMode: false })) {
            addFieldError(errors, "address.phone", "Phone number is invalid.")
        }
    }

    const sanitizedItems = []

    if (items) {
        items.forEach((item, index) => {
            const foodId = normalizeString(item?.foodId || item?._id)
            const name = normalizeString(item?.name)
            const price = Number(item?.price)
            const quantity = Number(item?.quantity)

            if (!validateFoodId(foodId)) {
                addFieldError(errors, `items[${index}].foodId`, "Item foodId is invalid.")
            }

            if (!name) {
                addFieldError(errors, `items[${index}].name`, "Item name is required.")
            }

            if (!Number.isFinite(price) || price < 0) {
                addFieldError(errors, `items[${index}].price`, "Item price must be a valid non-negative number.")
            }

            if (!Number.isInteger(quantity) || quantity < 1) {
                addFieldError(errors, `items[${index}].quantity`, "Item quantity must be an integer of at least 1.")
            }

            sanitizedItems.push({
                foodId,
                name,
                price: Number.isFinite(price) ? Number(price.toFixed(2)) : price,
                quantity,
            })
        })
    }

    if (errors.length > 0) {
        return sendValidationErrors(res, errors)
    }

    req.body.items = sanitizedItems
    req.body.address = sanitizedAddress
    req.body.paymentMethod = paymentMethod

    next()
}

const validateVerifyOrderPayment = (req, res, next) => {
    const orderId = normalizeString(req.body.orderId)
    const sessionId = normalizeString(req.body.sessionId)
    const errors = []

    if (!validateMongoId(orderId)) {
        addFieldError(errors, "orderId", "A valid orderId is required.")
    }

    if (!sessionId || !/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId)) {
        addFieldError(errors, "sessionId", "A valid Stripe sessionId is required.")
    }

    if (errors.length > 0) {
        return sendValidationErrors(res, errors)
    }

    req.body.orderId = orderId
    req.body.sessionId = sessionId

    next()
}

const validateUpdateOrderStatus = (req, res, next) => {
    const orderId = normalizeString(req.body.orderId)
    const status = normalizeString(req.body.status)
    const errors = []

    if (!validateMongoId(orderId)) {
        addFieldError(errors, "orderId", "A valid orderId is required.")
    }

    if (!orderStatuses.includes(status)) {
        addFieldError(errors, "status", "Invalid order status.")
    }

    if (errors.length > 0) {
        return sendValidationErrors(res, errors)
    }

    req.body.orderId = orderId
    req.body.status = status

    next()
}

export {
    foodCategories,
    orderStatuses,
    paymentMethods,
    validateAddFood,
    validateImageUpload,
    validatePlaceOrder,
    validateRemoveFood,
    validateUpdateFood,
    validateVerifyOrderPayment,
    validateUpdateOrderStatus,
}