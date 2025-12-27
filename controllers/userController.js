const { getConnection, sql } = require('../config/database');

// Create a new user
const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('name', sql.VarChar, name)
      .input('email', sql.VarChar, email)
      .query(`
        INSERT INTO Users (name, email, created_at) 
        OUTPUT INSERTED.*
        VALUES (@name, @email, GETDATE())
      `);

    res.status(201).json({
      message: 'User created successfully',
      user: result.recordset[0]
    });
  } catch (err) {
    console.error('Error creating user:', err);
    if (err.number === 2627) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT * FROM Users ORDER BY created_at DESC');

    res.status(200).json({
      count: result.recordset.length,
      users: result.recordset
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Users WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user: result.recordset[0] });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user by ID
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({ error: 'At least one field (name or email) is required' });
    }

    const pool = await getConnection();
    
    // Check if user exists
    const checkUser = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Users WHERE id = @id');

    if (checkUser.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build update query dynamically
    let updateFields = [];
    const request = pool.request().input('id', sql.Int, id);

    if (name) {
      updateFields.push('name = @name');
      request.input('name', sql.VarChar, name);
    }
    if (email) {
      updateFields.push('email = @email');
      request.input('email', sql.VarChar, email);
    }

    const result = await request.query(`
      UPDATE Users 
      SET ${updateFields.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    res.status(200).json({
      message: 'User updated successfully',
      user: result.recordset[0]
    });
  } catch (err) {
    console.error('Error updating user:', err);
    if (err.number === 2627) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user by ID
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getConnection();
    
    // Check if user exists
    const checkUser = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Users WHERE id = @id');

    if (checkUser.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Users WHERE id = @id');

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};