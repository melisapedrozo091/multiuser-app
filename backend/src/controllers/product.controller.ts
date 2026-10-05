import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma/client';

export const getAllProducts = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { owner: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener productos', details: error.message });
  }
};

export const getProductById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { owner: true }
    });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al buscar producto', details: error.message });
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, price, stock } = req.body;
  const ownerId = req.user?.uid;

  if (!ownerId) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        owner: { connect: { id: ownerId } }
      }
    });
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ error: 'Error al crear producto', details: error.message });
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, price, stock } = req.body;

  try {
    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(stock !== undefined && { stock: Number(stock) })
      }
    });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: 'Error al actualizar producto', details: error.message });
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: 'Error al eliminar producto', details: error.message });
  }
};
