import {
  createAddressBookEntry,
  deleteAddressBookEntry,
  getAddressBook,
  getAddressBookEntry,
  updateAddressBookEntry,
} from '@/controllers/addressBookController';
import { Router } from 'express';

const router = Router();

// Get all address book entries for a user
router.get('/:walletAddress', getAddressBook);

// Get a specific address book entry
router.get('/:walletAddress/:entryId', getAddressBookEntry);

// Create a new address book entry
router.post('/:walletAddress', createAddressBookEntry);

// Update an existing address book entry
router.patch('/:walletAddress/:entryId', updateAddressBookEntry);

// Delete an address book entry
router.delete('/:walletAddress/:entryId', deleteAddressBookEntry);

export default router;
