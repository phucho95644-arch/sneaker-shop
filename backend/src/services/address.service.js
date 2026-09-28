const ApiError = require('../utils/ApiError');
const {
  findByUserId,
  findByIdAndUserId,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  unsetDefaultAddresses,
  countByUserId
} = require('../models/address.model');
const { pool } = require('../config/db');

const getAddresses = async (userId) => findByUserId(userId);

const createAddressService = async (userId, data) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const existingCount = await countByUserId(userId);
    const isDefault = existingCount === 0 || data.isDefault === true;

    if (isDefault) {
      await unsetDefaultAddresses(userId, connection);
    }

    const address = await createAddress(userId, { ...data, isDefault }, connection);
    await connection.commit();
    return address;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateAddressService = async (userId, addressId, data) => {
  const address = await findByIdAndUserId(addressId, userId);
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (data.isDefault === true) {
      await unsetDefaultAddresses(userId, connection);
    }

    const updatedAddress = await updateAddress(addressId, userId, data, connection);
    await connection.commit();
    return updatedAddress;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteAddressService = async (userId, addressId) => {
  const address = await findByIdAndUserId(addressId, userId);
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await deleteAddress(addressId, userId, connection);

    if (address.isDefault) {
      const [rows] = await connection.query(
        `SELECT id FROM addresses WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1`,
        [userId]
      );
      if (rows.length > 0) {
        await setDefaultAddress(rows[0].id, userId, connection);
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const setDefaultAddressService = async (userId, addressId) => {
  const address = await findByIdAndUserId(addressId, userId);
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await unsetDefaultAddresses(userId, connection);
    await setDefaultAddress(addressId, userId, connection);
    await connection.commit();
    return await findByIdAndUserId(addressId, userId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAddresses,
  createAddress: createAddressService,
  updateAddress: updateAddressService,
  deleteAddress: deleteAddressService,
  setDefaultAddress: setDefaultAddressService
};
