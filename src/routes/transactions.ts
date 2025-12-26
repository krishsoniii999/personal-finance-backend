// Transaction routes - handles all transaction-related API endpoints
import { Router, Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to ALL routes in this file
router.use(requireAuth);

// GET /api/transactions - Get all transactions for a user
router.get('/', async (req: Request, res: Response) => {
  try {
    // req.user is set by the requireAuth middleware
    const userId = req.user!.id;

    // Query Supabase for all transactions belonging to this user
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false }); // Newest first

    if (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }

    res.json({ transactions: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/transactions - Create a new transaction
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('Received request body:', req.body);
    const { amount, description, transaction_type, category_id, date } = req.body;

    // Validate required fields
    if (!amount || !transaction_type) {
      return res.status(400).json({
        error: 'Missing required fields: amount and transaction_type are required'
      });
    }

    // Validate transaction_type
    if (transaction_type !== 'income' && transaction_type !== 'expense') {
      return res.status(400).json({
        error: 'transaction_type must be either "income" or "expense"'
      });
    }

    console.log('About to insert transaction...');

    // Get the authenticated user's ID
    const userId = req.user!.id;

    // Insert the new transaction into the database
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          amount: parseInt(amount), // Convert to integer (cents)
          description: description || null,
          transaction_type,
          category_id: category_id || null,
          date: date || new Date().toISOString().split('T')[0], // Use today if no date provided
        }
      ])
      .select(); // Return the created transaction

    console.log('Supabase response - data:', data, 'error:', error);

    if (error) {
      console.error('Error creating transaction:', error);
      return res.status(500).json({ error: 'Failed to create transaction', details: error });
    }

    console.log('Transaction created successfully!');
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: data[0]
    });
  } catch (err) {
    console.error('Unexpected error in catch block:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
});

// DELETE /api/transactions/:id - Delete a transaction
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Delete the transaction (only if it belongs to the user)
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Make sure user owns this transaction

    if (error) {
      console.error('Error deleting transaction:', error);
      return res.status(500).json({ error: 'Failed to delete transaction' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
