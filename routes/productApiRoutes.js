const express = require('express');
const router = express.Router();
const authenticateToken = require('./auth/authenticateMiddleware');

router.use(express.json());

router.get('/products', authenticateToken, async (req, res) => {
    try {
        // console.log(req.user); < - name
        const result = await req.db.query(
            `SELECT 
                    p.name,
                    description,
                    b.name,
                    c.name
                FROM products p
                JOIN brands b
                    ON p.brand_id = b.id
                JOIN categories c
                    ON p.category_id = c.id;`
        );

        res.status(200).send(result[0]);
    } catch (err) {
        res.status(400).send({success: false, message: err, data: null});
    }
});

router.get('/brands', async (req, res) => {
    try {
        const result = await req.db.query(
            `SELECT * FROM brands;`
        );

        res.status(200).send(result[0]);
    } catch (err) {
        res.status(400).send({success: false, message: err, data: null});
    }
});

router.get('/categories', async (req, res) => {
    try {
        const result = await req.db.query(
            `SELECT * FROM categories;`
        );

        res.status(200).send(result[0]);
    } catch (err) {
        res.status(400).send({success: false, message: err, data: null});
    }
});

router.get('/favorites', authenticateToken, async (req, res) => {
    try {
        const result = await req.db.query(
            `SELECT p.name, uf.notes
                FROM user_favorites uf
                LEFT JOIN products p
                    ON uf.product_id = p.id
                WHERE user_name = :user;`,
            {
                user: req.user
            }
        );

        res.status(200).send(result[0]);
    } catch (err) {
        res.status(400).send({success: false, message: err, data: null});
    }
});

router.post('/favorites', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.body;

        if(req.body.notes) {
            await req.db.query(
                `INSERT INTO user_favorites (user_name, notes, product_id)
                    VALUES (:user, :notes, :productId)`,
                {
                    user: req.user,
                    notes: req.body.notes,
                    productId
                }
            );

            res.status(200).send({success: true, message: `Favorite product added!`, data: null});
        } else {
            await req.db.query(
                `INSERT INTO user_favorites (user_name, product_id)
                    VALUES (:user, :productId)`,
                {
                    user: req.user,
                    productId
                }
            );

            res.status(200).send({success: true, message: `Favorite product added!`, data: null});
        }

    } catch (err) {
        res.status(400).send({success: false, message: err, data: null});
    }
});

router.put('/favorites/notes', authenticateToken, async (req, res) => {
    try {
        const { notes, productId } = req.body;

        await req.db.query(
            `UPDATE user_favorites
                SET notes = :notes
                WHERE user_name = :user AND product_id = :productId;`,
            {
                notes,
                productId,
                user: req.user
            }
        );

        res.status(200).send({success: true, message: `Favorite product updated!`, data: null});
    } catch (err) {
        res.status(400).send({success: false, message: err, data: null});
    }
});

router.delete('/favorites', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.body;

        const result = await req.db.query(
            `SELECT id FROM user_favorites
            WHERE product_id = :productId AND user_name = :user`,
            {
                productId,
                user: req.user
            }
        );
        const { id } = result[0][0]; 

        await req.db.query(
            `DELETE FROM user_favorites
                WHERE id = :id`,
            {
                id
            }
        );

        res.status(200).send({success: true, message: `Favorite product deleted`, data: null});
    } catch (err) {
        res.status(400).send({success: false, message: err, data: null});
    }
});

module.exports = router;