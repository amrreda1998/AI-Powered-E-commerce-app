// Mock products data (in a real app, this would come from MongoDB)
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 99.99,
    category: 'Electronics',
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with heart rate monitoring',
    price: 199.99,
    category: 'Electronics',
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
  },
  {
    id: '3',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable organic cotton t-shirt in various colors',
    price: 29.99,
    category: 'Clothing',
    imageUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
  },
  {
    id: '4',
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated water bottle that keeps drinks cold for 24 hours',
    price: 24.99,
    category: 'Lifestyle',
    imageUrl:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop',
  },
  {
    id: '5',
    name: 'Wireless Phone Charger',
    description: 'Fast wireless charging pad compatible with all Qi devices',
    price: 39.99,
    category: 'Electronics',
    imageUrl:
      'https://images.unsplash.com/photo-1609592806596-4d8b6b0e1b8b?w=300&h=300&fit=crop',
  },
];
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}
