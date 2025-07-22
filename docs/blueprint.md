# **App Name**: Chefs' BD

## Core Features:

- Browse Products: Browse food items with name, image, description, category, rating, and price. Products will appear in an attractive glass-style card layout. Responsive grid system for both desktop and mobile views.
- Product Filtering: Filter food items by category (Burger, Pizza, etc.) and minimum rating (1⭐ to 5⭐). Optional filter by price range (future upgrade-ready).
- Search Products: Instant product search using name (case-insensitive). Real-time search updates as you type.
- Language Switcher: Switch between English and Bengali using a toggle button. All UI texts dynamically change based on selected language.
- User Authentication: Register and Login functionalities using Firebase Auth. Role-based system: Buyer and Seller. Navigation and access changes based on user roles.
- Seller Product Management: Sellers can: Add product with name, image, description, category, rating, and price. Edit or delete their own products from dashboard. Image upload via Cloudinary.
- Buyer Product Page: Browse all products. Filter + Search. Option to view seller profile.
- Add to Cart System: Buyers can add products to cart (using LocalStorage). Cart page displays selected items, quantity, subtotal. Place Order button confirms purchase (Firestore-based).
- Order System: Buyer can place orders with address and contact. Seller can view their own product orders in a dashboard. Order status (Pending, Preparing, Delivered) system.
- Seller Profile System: Each seller has a public profile showing: Name, image, and all products they uploaded. Clicking seller avatar opens their product list.
- Product Details Page: Individual product page shows: Larger image, full description, seller info, and Add to Cart button.
- Landing Page: Eye-catching landing page with hero section. Scroll animations and links to login/register/browse. Featured items carousel (optional future upgrade).
- Admin Panel (Optional Future Upgrade): Manage users, delete abusive content, etc.

## Style Guidelines:

- Primary color: Vibrant orange (#FF7800) to reflect the energy and flavors of Rangpur cuisine.
- Background color: Light beige (#F5F5DC), a desaturated tone of the primary color, will contribute a calm, uncluttered look.
- Accent color: Muted red (#D14906) for interactive elements and key calls to action. Its darker brightness and greater saturation than the primary color ensure prominence and visibility.
- Body font: 'PT Sans' for readability and a modern feel. Headline font: 'Space Grotesk', for a bit of digital flair.
- Utilize modern icons (such as Font Awesome or React Icons) throughout the platform to enhance the user experience.
- Design a clean, mobile-first responsive layout with glassmorphism-style navbar and card layouts for an appealing visual experience.
- Implement subtle transitions and animations to improve user engagement.