import { AddressBookService } from '@/service/addressBookService';
import { Network, SUPPORTED_NETWORKS } from '@/utils/networks.util';
import { Request, Response } from 'express';

/**
 * Get all address book entries for a user
 */
export const getAddressBook = async (
  req: Request<{ walletAddress: string }>,
  res: Response
): Promise<void> => {
  try {
    const { walletAddress } = req.params;

    const entries = await AddressBookService.getAllEntries(walletAddress);

    res.json({
      success: true,
      data: entries,
    });
  } catch (err: any) {
    console.error('[getAddressBook] Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'An error occurred retrieving the address book',
    });
  }
};

/**
 * Get a specific address book entry
 */
export const getAddressBookEntry = async (
  req: Request<{ walletAddress: string; entryId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { walletAddress, entryId } = req.params;

    const entry = await AddressBookService.getEntryById(walletAddress, entryId);

    if (!entry) {
      res.status(404).json({
        success: false,
        error: 'Address book entry not found',
      });
      return;
    }

    res.json({
      success: true,
      data: entry,
    });
  } catch (err: any) {
    console.error('[getAddressBookEntry] Error:', err);
    res.status(500).json({
      success: false,
      error:
        err.message || 'An error occurred retrieving the address book entry',
    });
  }
};

/**
 * Create a new address book entry
 */
export const createAddressBookEntry = async (
  req: Request<
    { walletAddress: string },
    {},
    {
      name: string;
      address: string;
      description?: string;
      network?: string;
      tags?: string[];
      is_favorite?: boolean;
    }
  >,
  res: Response
): Promise<void> => {
  try {
    const { walletAddress } = req.params;
    const { name, address, description, network, tags, is_favorite } = req.body;

    if (!name || !address) {
      res.status(400).json({
        success: false,
        error: 'Name and address are required',
      });
      return;
    }

    const existingEntry = await AddressBookService.getEntryByAddress(
      walletAddress,
      address
    );
    if (existingEntry) {
      res.status(409).json({
        success: false,
        error: 'Address book entry already exists',
      });
      return;
    }

    const existingEntryByName = await AddressBookService.getEntryByName(
      walletAddress,
      name
    );
    if (existingEntryByName) {
      res.status(409).json({
        success: false,
        error: 'Address book entry already exists',
      });
      return;
    }

    if (!SUPPORTED_NETWORKS.includes(network as Network)) {
      res.status(400).json({
        success: false,
        error: 'Unsupported network',
      });
      return;
    }

    const entry = await AddressBookService.createEntry({
      user_id: walletAddress,
      name,
      address,
      description,
      network,
      tags,
      is_favorite,
    });

    res.status(201).json({
      success: true,
      data: entry,
    });
  } catch (err: any) {
    console.error('[createAddressBookEntry] Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'An error occurred creating the address book entry',
    });
  }
};

/**
 * Update an existing address book entry
 */
export const updateAddressBookEntry = async (
  req: Request<
    { walletAddress: string; entryId: string },
    {},
    { name?: string; address?: string }
  >,
  res: Response
): Promise<void> => {
  try {
    const { walletAddress, entryId } = req.params;
    const { name, address } = req.body;

    // Check if entry exists and belongs to this user
    const existingEntry = await AddressBookService.getEntryById(
      walletAddress,
      entryId
    );

    if (!existingEntry) {
      res.status(404).json({
        success: false,
        error: 'Address book entry not found or does not belong to this user',
      });
      return;
    }

    if (name) {
      const existingEntryByName = await AddressBookService.getEntryByName(
        walletAddress,
        name
      );
      if (existingEntryByName && existingEntryByName.id !== entryId) {
        res.status(409).json({
          success: false,
          error: 'Address book entry already exists',
        });
        return;
      }
    }

    if (address) {
      const existingEntryByAddress = await AddressBookService.getEntryByAddress(
        walletAddress,
        address
      );
      if (existingEntryByAddress && existingEntryByAddress.id !== entryId) {
        res.status(409).json({
          success: false,
          error: 'Address book entry already exists',
        });
        return;
      }
    }

    if (!name && !address) {
      res.status(400).json({
        success: false,
        error:
          'At least one field (name or address) must be provided for update',
      });
      return;
    }

    const updatedEntry = await AddressBookService.updateEntry(entryId, {
      name,
      address,
    });

    res.json({
      success: true,
      data: updatedEntry,
    });
  } catch (err: any) {
    console.error('[updateAddressBookEntry] Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'An error occurred updating the address book entry',
    });
  }
};

/**
 * Delete an address book entry
 */
export const deleteAddressBookEntry = async (
  req: Request<{ walletAddress: string; entryId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { walletAddress, entryId } = req.params;

    // Check if entry exists and belongs to this user
    const existingEntry = await AddressBookService.getEntryById(
      walletAddress,
      entryId
    );

    if (!existingEntry) {
      res.status(404).json({
        success: false,
        error: 'Address book entry not found or does not belong to this user',
      });
      return;
    }

    await AddressBookService.deleteEntry(walletAddress, entryId);

    res.status(204);
  } catch (err: any) {
    console.error('[deleteAddressBookEntry] Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'An error occurred deleting the address book entry',
    });
  }
};
