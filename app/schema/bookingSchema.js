// bookingSchema.js
import { z } from 'zod';

export const bookingSchema = z.object({
  // Customer Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  contactNumber: z.string().optional(),

  // Shipper Information
  shipperFirstName: z.string().min(1, 'Shipper first name is required'),
  shipperLastName: z.string().min(1, 'Shipper last name is required'),
  shipperContact: z.string().optional(),

  // Consignee Information
  consigneeFirstName: z.string().min(1, 'Consignee first name is required'),
  consigneeLastName: z.string().min(1, 'Consignee last name is required'),
  consigneeContact: z.string().optional(),

  // Shipping Details
  modeOfService: z.string().min(1, 'Mode of service is required'),
  containerSize: z.string().min(1, 'Container size is required'),
  containerQuantity: z.number().min(1, 'Container quantity must be at least 1'),
  origin: z.string().min(1, 'Origin port is required'),
  destination: z.string().min(1, 'Destination port is required'),
  shippingLine: z.string().optional(),
  truckCompany: z.string().optional(),
  // FIXED: Accept string and transform to number
  terms: z.union([
    z.string().transform((val) => parseInt(val, 10)),
    z.number()
  ]).refine((val) => val >= 1, 'Terms must be at least 1 day'),

  // Location Data
  pickupLocation: z.object({}).optional(),
  deliveryLocation: z.object({}).optional(),

  // Items
  items: z.array(z.object({
    name: z.string().min(1, 'Item name is required'),
    // FIXED: Accept string and transform to number
    weight: z.union([
      z.string().transform((val) => parseFloat(val)),
      z.number()
    ]).refine((val) => val >= 0.01, 'Weight must be greater than 0'),
    // FIXED: Accept string and transform to number
    quantity: z.union([
      z.string().transform((val) => parseInt(val, 10)),
      z.number()
    ]).refine((val) => val >= 1, 'Quantity must be at least 1'),
    category: z.string().min(1, 'Category is required'),
  })).min(1, 'At least one item is required'),
});

export const defaultBookingValues = {
  firstName: '',
  lastName: '',
  email: '',
  contactNumber: '',
  shipperFirstName: '',
  shipperLastName: '',
  shipperContact: '',
  consigneeFirstName: '',
  consigneeLastName: '',
  consigneeContact: '',
  modeOfService: '',
  containerSize: '',
  containerQuantity: 1,
  origin: '',
  destination: '',
  shippingLine: '',
  truckCompany: '',
  terms: '1',
  pickupLocation: {},
  deliveryLocation: {},
};

export const transformBookingToApi = (data) => {
  return {
    user_id: data.userId,
    // Customer Information
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    contact_number: data.contactNumber,
    
    // Shipper Information
    shipper_first_name: data.shipperFirstName,
    shipper_last_name: data.shipperLastName,
    shipper_contact: data.shipperContact,
    
    // Consignee Information
    consignee_first_name: data.consigneeFirstName,
    consignee_last_name: data.consigneeLastName,
    consignee_contact: data.consigneeContact,
    
    // Shipping Details
    mode_of_service: data.modeOfService,
    container_size_id: data.containerSize,
    container_quantity: data.containerQuantity,
    origin_id: data.origin,
    destination_id: data.destination,
    shipping_line_id: data.shippingLine,
    truck_comp_id: data.truckCompany,
    
    // Terms - ensure it's a number
    terms: typeof data.terms === 'string' ? parseInt(data.terms, 10) : data.terms,
    
    // Location Data
    pickup_location: data.pickupLocation,
    delivery_location: data.deliveryLocation,
    
    // Items
    items: data.items,
  };
};