const { v4: uuidv4 } = require('uuid');
const db = require('../models')
const User = db.User
const Op = db.Sequelize.Op

exports.create = (req, res, next) => {
    const { name, surName, email, password, password2 } = req.body 

    if (password !== password2) return next({ name: "passwordValidationError", message: 'Contraseñas no coinciden' })
    
    try {
        const user = {
            _id: uuidv4(),
            name,
            surName,
            email,
            password
        }
        User.create(user).then(data => {
            res.status(201).send(data)
        }).catch(err => {
            next(err)
        })
    } catch (error) {
        next(error)
    }
}

exports.findOneById = (req, res) => {
    const { id } = req.body

    User.findByPk(id).then(data => {
        if (data) res.send(data)
        else res.status(404).send({ message: 'Usuario no encontrado' })
    }).catch(err => {
        res.status(500).send({
            message: 'Error recuperando los datos'
        })
    })
}

exports.findOneByEmail = (req, res) => {
    const { email } = req.body

    User.findOne({ where: { email } }).then(data => {
        if (data) res.send(data)
        else res.status(404).send({ message: 'Usuario no encontrado' })
    }).catch(err => {
        res.status(500).send({
            message: 'Error recuperando los datos'
        })
    })
}