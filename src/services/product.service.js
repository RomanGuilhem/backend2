import ProductRepository from "../repositories/product.repository.js";

export const getproducts = async (filters) => {
  return await ProductRepository.getproducts(filters);
};

export const getById = async (id) => {
  return await ProductRepository.getById(id);
};

export const createProduct = async (productData) => {
  return await ProductRepository.createProduct(productData);
};

export const updateProduct = async (id, updateData) => {
  return await ProductRepository.updateProduct(id, updateData);
};

export const deleteProduct = async (id) => {
  return await ProductRepository.deleteProduct(id);
};
