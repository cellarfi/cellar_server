import {
  AddressBookDto,
  UpdateAddressBookDto,
} from '@/utils/dto/addressBook.dto'
import { prismaService } from '../service/prismaService'

const prisma = prismaService.prisma

/**
 * AddressBookService - Service for managing user's address book entries
 *
 * This service provides CRUD operations for address book functionality:
 * - Getting all entries for a user
 * - Getting a specific entry by ID
 * - Creating new entries
 * - Updating existing entries
 * - Deleting entries
 */
export class AddressBookModel {
  /**
   * Get all address book entries for a user
   * @param userId User wallet address
   * @returns Array of address book entries
   */
  static async getAllEntries(userId: string) {
    return prisma.addressBook.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    })
  }

  /**
   * Get a specific address book entry by ID
   * @param userId User wallet address
   * @param entryId Address book entry ID
   * @returns Address book entry if found
   */
  static async getEntryById(userId: string, entryId: string) {
    return prisma.addressBook.findFirst({
      where: {
        id: entryId,
        user_id: userId,
      },
    })
  }

  /**
   * Get a specific address book entry by address
   * @param userId User wallet address
   * @param address Address book entry address
   * @returns Address book entry if found
   */
  static async getEntryByAddress(userId: string, address: string) {
    return prisma.addressBook.findFirst({
      where: {
        user_id: userId,
        address,
      },
    })
  }

  /**
   * Get a specific address book entry by name
   * @param userId User wallet address
   * @param name Address book entry name
   * @returns Address book entry if found
   */
  static async getEntryByName(userId: string, name: string) {
    return prisma.addressBook.findFirst({
      where: {
        user_id: userId,
        name,
      },
    })
  }

  /**
   * Create a new address book entry
   * @param userId User wallet address
   * @param entry Address book entry data
   * @returns Created address book entry
   */
  static async createEntry(entry: AddressBookDto) {
    const addressBookEntry = await prisma.addressBook.findFirst({
      where: {
        address: entry.address,
        user_id: entry.user_id,
      },
    })
    if (addressBookEntry) {
      throw new Error('Address book entry already exists')
    }

    return prisma.addressBook.create({
      data: {
        user_id: entry.user_id,
        name: entry.name,
        address: entry.address,
        description: entry.description,
        network: entry.network,
        tags: entry.tags || [],
        is_favorite: entry.is_favorite,
      },
    })
  }

  /**
   * Update an existing address book entry
   * @param entryId Address book entry ID
   * @param entry Updated address book entry data
   * @returns Updated address book entry
   */
  static async updateEntry(entryId: string, entry: UpdateAddressBookDto) {
    return prisma.addressBook.update({
      where: {
        id: entryId,
        user_id: entry.user_id,
      },
      data: {
        name: entry.name,
        address: entry.address,
        description: entry.description,
        network: entry.network,
        tags: entry.tags || [],
        is_favorite: entry.is_favorite,
      },
    })
  }

  /**
   * Delete an address book entry
   * @param userId User wallet address
   * @param entryId Address book entry ID
   * @returns Deleted address book entry
   */
  static async deleteEntry(userId: string, entryId: string) {
    return prisma.addressBook.delete({
      where: {
        id: entryId,
        user_id: userId,
      },
    })
  }
}
