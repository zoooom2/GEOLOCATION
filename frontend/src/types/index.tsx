//Axios Request Types
// export type AxiosResponseType = Awaited<ReturnType<typeof axios.get>>['data'];

// import { LatLng } from 'leaflet';

// import { SyntheticEvent } from 'react';
// import { IconType } from 'react-icons';

//User Types
export type UserType = {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  companyID: string;
  photo: string;
  role: string;
  currentLocation: string;

  locationHistory: {
    location: string;
    checkInTime: Date;
    checkOutTime: Date;
  }[];
};

export type UserStateType = {
  remove_auth_error: string;
  visitor_count: number;
  fetch_user_error: string;
  visitor_count_error: string;
  loading: boolean;
  isAuthenticated: boolean;
  authentication_error: string;
  fetch_fences_error: string;
  user: UserType;
  imageFile: {
    file?: File;
    filePreview?: string;
  };
};

export type GeoStateType = {
  loading: boolean;
  companyGeoFences: {
    uid: string;
    vertices: {
      type: 'Polygon';
      coordinates: [number, number][];
    };
    center: {
      type: 'Point';
      coordinates: [number, number];
    };
  }[];
  fetch_fences_error: string;
  center: { lat: number; lng: number };
  mapLayers: Array<{
    id: number;
    latlngs: Array<{ lat: number; lng: number }>;
  }>;
  // polygons: Array<{
  //   center: { lat: number; lng: number };
  //   vertices: Array<{ lat: number; lng: number }>;
  //   uid: string;
  // }>;
  polygons: {
    center: { lat: number; lng: number };
    vertices: { lat: number; lng: number }[];
    uid: string;
  }[];
  editMode: boolean;
};

// export type userActionType = {
//   type: string;
//   payload?:  UserType | File;
// };

// // Commerce Types
// export type ShippingInfoTypes = {
//   address: string;
//   city: string;
//   phoneNumber: string;
//   postCode: string;
//   country: string;
//   shippingFee: number;
//   shippingMethod: string;
// };

// export type OrderItemType = {
//   productName: string;
//   amount: number;
//   price: number;
//   image: string;
//   size: string;
//   productID: string;
// };

// export type PaymentInfoType = {
//   reference: string;
//   gateway: string;
//   channel?: string;
//   status?: string;
// };

// export type OrderType = {
//   _id: string;
//   shippingInfo: ShippingInfoTypes;
//   user: UserType;
//   orderItems: OrderItemType[];
//   paymentInfo: PaymentInfoType;
//   createdAt: string;
//   paidAt?: string;
//   taxPrice: number;
//   deliveredAt: string;
//   total_amount: number;
//   subtotal: number;
//   orderStatus: 'processing' | 'shipped' | 'completed' | 'failed';
//   total_items: number;
// };

// export interface ChildrenProps {
//   children: React.ReactNode;
// }

// //product types

// export type CategoryType =
//   | 'bags'
//   | 'bracelets'
//   | 'waistbeads'
//   | 'necklaces'
//   | 'anklet'
//   | 'earrings'
//   | 'all'
//   | 'body jewelry'
//   | 'custom';

// export type SingleProductType = {
//   _id: string;
//   productName: string;
//   description: string;
//   featured: boolean;
//   price: number;
//   priceID: string;
//   taxPrice: number;
//   discount: number;
//   category: CategoryType;
//   collectionName: string;
//   reviews: string[];
//   images: string[];
//   numberOfReviews: number;
//   quantitySold: number;
//   stock: number;
//   ratingsAverage: number;
//   sizes: { size: string; quantity: number }[];
// };
// export type ProductStateType = {
//   isSidebarOpen: boolean;
//   products_loading: boolean;
//   products_error: string;
//   products: SingleProductType[];
//   featured_products: SingleProductType[];
//   single_product_loading: boolean;
//   single_product_error: string;
//   single_product: SingleProductType;
// };
// export type ProductActionType = {
//   type: string;
//   payload?: SingleProductType[] | SingleProductType;
// };
// //filter types

// export type FilterStatetype = {
//   filtered_product: SingleProductType[];
//   all_products: SingleProductType[];
//   grid_view: boolean;
//   sort: string | undefined;
//   openFilter: boolean;
//   filters: FilterType;
// };

// export type FilterType = {
//   text: string;
//   category: CategoryType;
//   min_price?: number;
//   max_price?: number;
//   price: number;
//   shipping: boolean;
//   collection: string;
// };
// export type FilterActionType = {
//   type: string;
//   payload?:
//     | { products: SingleProductType[] }
//     | Pick<FilterStatetype, 'sort'>
//     | { value: string }
//     | Record<'name' | 'value', string | boolean | null>;
// };
// //Cart types

// export type CartItemType = {
//   productName: string;
//   amount: number;
//   size: string;
//   image: string;
//   price: number;
//   max: number;
//   productID: string;
// };

// export type CartStateType = {
//   cart: CartItemType[];
//   total_items: number;
//   subtotal: number;
//   loading: boolean;
//   handle_paystack_error: string;
//   total_amount: number;
//   shippingInfo: {
//     firstName: string;
//     lastName: string;
//     address: string;
//     city: string;
//     state: string;
//     country: string;
//     countryCode: string;
//     phoneNumber: string;
//     postCode: string;
//     email: string;
//     shippingMethod: string;
//     shippingFee: number;
//   };
// };

// export type CartShippingTypes = CartStateType['shippingInfo'];

// export type CartItemAndProduct = CartItemType & {
//   product: SingleProductType;
// };

// export type CartActionType = {
//   type: string;
//   payload?:
//     | Partial<CartItemType>
//     | CartItemAndProduct
//     | { product: SingleProductType; value: string }
//     | { detail: string; info: string };
// };

// export type countryTypes = {
//   value: string;
//   label: string;
//   countryCode: string;
// };

// export type AdminState = {
//   loading: boolean;
//   openModal: boolean;
//   modalTitle: string;
//   modalRef: string;
//   showSidebar: boolean;
//   showDelBtn: boolean;
//   fetch_order_stat_error: string;
//   fetch_visitor_stat_error: string;
//   fetch_recent_order_error: string;
//   fetch_best_seller_error: string;
//   product_error: string;
//   period: string;
//   totalRevenue: number;
//   previousTotalRevenue: number;
//   totalOrder: number;
//   previousTotalOrder: number;
//   visitor: number;
//   previousVisitor: number;
//   totalSale: number;
//   previousTotalSales: number;
//   percentageRevenue: number;
//   percentageOrder: number;
//   percentageVisitor: number;
//   percentageSales: number;
//   orders: OrderType[];
//   recentOrders: OrderType[];
//   bestSeller: SingleProductType[];
// };
// export type stats = {
//   time: string;
//   stats: {
//     current: number;
//     previous: number;
//     percentageDifference: number;
//   };
// };

// export type StoreType = {
//   admin: AdminState;
//   cart: CartStateType;
//   filter: FilterStatetype;
//   product: ProductStateType;
//   user: UserStateType;
// };

// export type HeroProps = {
//   title: string;
//   subtitle?: string;
//   description: string;
//   timeBased?: boolean;
//   buttonType?: boolean;
//   button?: {
//     icon: IconType;
//     name: string;
//     action: (e: SyntheticEvent<HTMLButtonElement>) => void;
//   }[];
// };

// export type AdminPageType = 'overview' | 'product' | 'order' | 'users';
// // export interface FormData {
// //   productName: string;
// //   price: number;
// //   description: string;
// //   sizes: { name: string; quantity: number }[];
// //   coverImages: FileList | null;
// //   category: string;
// //   collectionName: string;
// // }

// export type orderTableDataProps = (Omit<OrderType, '_id'> & {
//   _id: JSX.Element;
// })[];
