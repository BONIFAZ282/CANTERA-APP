export interface Producto {
  productId: number;
  categoryId: number;
  categoryname: string;
  productName: string;
  productDescription: string;
  productimg: string;
  productPryce: number;
  productRegisterDate: Date;
  stateproduct?: boolean;
}
