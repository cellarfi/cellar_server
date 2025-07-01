import {
  createAddressBookEntry,
  deleteAddressBookEntry,
  getAddressBook,
  getAddressBookEntry,
  updateAddressBookEntry,
} from '@/controllers/addressBookController';
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';

const router = Router();

// Get all address book entries for a user
router.get('/', authMiddleware, getAddressBook);

// Get a specific address book entry
router.get('/:entryId', authMiddleware, getAddressBookEntry);

// Create a new address book entry
router.post('/', authMiddleware, createAddressBookEntry);

// Update an existing address book entry
router.patch('/:entryId', authMiddleware, updateAddressBookEntry);

// Delete an address book entry
router.delete('/:entryId', authMiddleware, deleteAddressBookEntry);

export default router;
