import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase-config'; // Make sure this path to your firebase config is correct!

function ProductDetails() {
  const { productId } = useParams(); // Gets 'productId' from the URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Assumes your products are in a collection named 'products'
        const productRef = doc(db, 'products', productId);
        const docSnap = await getDoc(productRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Product not found!');
        }
      } catch (err) {
        setError('Failed to fetch product data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <div className="product-details-container">
      <img src={product.image} alt={product.name} className="product-details-image" />
      <div className="product-details-info">
        <h1>{product.name}</h1>
        <p className="product-details-category">{product.category}</p>
        <p className="product-details-description">{product.description}</p>
        <div className="product-details-price-rating">
          <span className="product-details-price">${product.price}</span>
          <span className="product-details-rating">{product.rating}⭐</span>
        </div>
        <button className="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  );
}

export default ProductDetails;