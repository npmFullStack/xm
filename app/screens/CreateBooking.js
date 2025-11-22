import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../hooks/useAuth';
import { useBooking } from '../hooks/useBooking';
import { bookingSchema } from '../schema/bookingSchema';
import tw from '../../lib/tailwind';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import LocationFields from '../components/LocationFields';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateBooking = ({ navigation }) => {
  const { user } = useAuth();
  const { 
    createBookingMutation, 
    categoriesQuery, 
    portsQuery, 
    containerTypesQuery,
    shippingLinesQuery,
    truckCompaniesQuery 
  } = useBooking();

  const [items, setItems] = useState([{ id: 1, name: '', weight: '', quantity: '', category: '', customCategory: '' }]);
  const [formData, setFormData] = useState({
    // Shipper Information
    shipperFirstName: '',
    shipperLastName: '',
    shipperContact: '',
    
    // Consignee Information
    consigneeFirstName: '',
    consigneeLastName: '',
    consigneeContact: '',
    
    // Shipping Details
    modeOfService: '',
    containerSize: '',
    containerQuantity: 1,
    origin: '',
    destination: '',
    shippingLine: '',
    truckCompany: '',
    terms: '1',
    
    // Preferred Dates
    departureDate: null,
    deliveryDate: null,
    
    // Location Data
    pickupLocation: {},
    deliveryLocation: {},
  });
  
  const [errors, setErrors] = useState({});
  const [weightValidation, setWeightValidation] = useState({ isValid: true, message: '' });
  
  // FIXED: Date picker state management
  const [showDatePicker, setShowDatePicker] = useState({
    departure: false,
    delivery: false
  });

  // Fix dropdown data - ensure we always have arrays
  const shippingLines = shippingLinesQuery.data || [];
  const containerTypes = Array.isArray(containerTypesQuery.data) ? containerTypesQuery.data : (containerTypesQuery.data?.data || []);
  const ports = portsQuery.data || [];
  const categories = categoriesQuery.data || [];
  const truckCompanies = truckCompaniesQuery.data || [];

  // Category options with "Other" option
  const categoryOptions = React.useMemo(() => {
    const baseOptions = categories.map(category => ({
      value: category.name,
      label: category.name,
    }));
    return [...baseOptions, { value: "other", label: "Other" }];
  }, [categories]);

  // Format ports for display with port name and code - FIXED VERSION
  const formattedPorts = React.useMemo(() => {
    return ports.map(port => ({
      ...port,
      // Use port_name if available, otherwise use name or route_name
      displayName: port.port_name 
        ? `${port.port_name} (${port.route_name || port.code || ''})`
        : port.name 
          ? `${port.name} (${port.route_name || port.code || ''})`
          : port.route_name || 'Unknown Port'
    }));
  }, [ports]);

  // Calculate total weight
  const calculateTotalWeight = () => {
    return items.reduce((total, item) => {
      const weight = parseFloat(item.weight) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (weight * quantity);
    }, 0);
  };

  // Validate weight against container capacity
  useEffect(() => {
    if (formData.containerSize && items.length > 0) {
      const totalWeight = calculateTotalWeight();
      const selectedContainer = containerTypes.find(container => container.id.toString() === formData.containerSize);
      
      if (selectedContainer && totalWeight > 0) {
        const maxWeight = (selectedContainer.max_weight || 0) * formData.containerQuantity;
        if (totalWeight > maxWeight) {
          const excessWeight = (totalWeight - maxWeight).toFixed(2);
          setWeightValidation({
            isValid: false,
            message: `Total weight (${totalWeight.toFixed(2)} kg) exceeds container capacity (${maxWeight.toFixed(2)} kg) by ${excessWeight} kg. Please add more containers or choose a larger container size.`
          });
        } else {
          const remainingCapacity = (maxWeight - totalWeight).toFixed(2);
          setWeightValidation({ 
            isValid: true, 
            message: `Total weight: ${totalWeight.toFixed(2)} kg / ${maxWeight.toFixed(2)} kg (${remainingCapacity} kg remaining capacity)`
          });
        }
      }
    }
  }, [items, formData.containerSize, formData.containerQuantity, containerTypes]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // FIXED: Date picker handler - properly manage visibility
  const handleDateChange = (field, event, selectedDate) => {
    // Always hide the picker first
    setShowDatePicker(prev => ({ ...prev, [field]: false }));
    
    // Only update if date was selected (not cancelled)
    if (selectedDate) {
      handleInputChange(field, selectedDate);
    }
  };

  const showDatepicker = (field) => {
    setShowDatePicker(prev => ({ ...prev, [field]: true }));
  };

  const formatDate = (date) => {
    if (!date) return 'Select date';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const addItem = () => {
    setItems(prev => [...prev, { 
      id: Date.now(), 
      name: '', 
      weight: '', 
      quantity: '', 
      category: '', 
      customCategory: '' 
    }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleCategoryChange = (id, value) => {
    handleItemChange(id, "category", value);
    if (value !== "other") {
      handleItemChange(id, "customCategory", "");
    }
  };

  // Contact number validation - only numbers
  const handleContactNumberChange = (field, value) => {
    const numericValue = value.replace(/[^\d]/g, '');
    handleInputChange(field, numericValue);
  };

  // Container quantity increment/decrement
  const incrementContainerQuantity = () => {
    setFormData(prev => ({ ...prev, containerQuantity: prev.containerQuantity + 1 }));
  };

  const decrementContainerQuantity = () => {
    setFormData(prev => ({ ...prev, containerQuantity: prev.containerQuantity > 1 ? prev.containerQuantity - 1 : 1 }));
  };

  // FIXED: Transform form data for validation
  const transformFormDataForValidation = () => {
    return {
      ...formData,
      items: items.map(item => ({
        ...item,
        weight: item.weight ? parseFloat(item.weight) : 0,
        quantity: item.quantity ? parseInt(item.quantity, 10) : 0,
      })),
      containerQuantity: parseInt(formData.containerQuantity, 10),
      // Add user data for validation
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
      contactNumber: user?.contact_number || '',
      pickupLocation: formData.pickupLocation,
      deliveryLocation: formData.deliveryLocation,
    };
  };

  const validateForm = () => {
    try {
      const formDataForValidation = transformFormDataForValidation();
      bookingSchema.parse(formDataForValidation);
      
      // Additional item validation
      if (items.some(item => !item.name || !item.weight || !item.quantity || !item.category)) {
        Alert.alert('Error', 'Please fill all item fields');
        return false;
      }

      // Check for custom category without name
      if (items.some(item => item.category === "other" && !item.customCategory)) {
        Alert.alert('Error', 'Please specify category name for "Other" category items');
        return false;
      }

      // Weight validation
      if (!weightValidation.isValid) {
        Alert.alert('Error', weightValidation.message);
        return false;
      }

      return true;
    } catch (error) {
      const newErrors = {};
      error.errors.forEach(err => {
        if (err.path) {
          newErrors[err.path[0]] = err.message;
        }
      });
      setErrors(newErrors);
      console.log('Validation errors:', newErrors);
      Alert.alert('Validation Error', 'Please check all required fields');
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const bookingData = {
      user_id: user.id,
      
      // Shipper Information
      shipper_first_name: formData.shipperFirstName,
      shipper_last_name: formData.shipperLastName,
      shipper_contact: formData.shipperContact,
      
      // Consignee Information
      consignee_first_name: formData.consigneeFirstName,
      consignee_last_name: formData.consigneeLastName,
      consignee_contact: formData.consigneeContact,
      
      // Shipping Details
      mode_of_service: formData.modeOfService,
      container_size_id: formData.containerSize,
      container_quantity: parseInt(formData.containerQuantity, 10),
      origin_id: formData.origin,
      destination_id: formData.destination,
      shipping_line_id: formData.shippingLine || null,
      truck_comp_id: formData.truckCompany || null,
      terms: parseInt(formData.terms, 10),
      
      // Preferred Dates - format for API
      departure_date: formData.departureDate ? formData.departureDate.toISOString().split('T')[0] : null,
      delivery_date: formData.deliveryDate ? formData.deliveryDate.toISOString().split('T')[0] : null,
      
      // Location Data
      pickup_location: formData.pickupLocation,
      delivery_location: formData.deliveryLocation,
      
      // Items - ensure proper data types
      items: items.map(item => ({
        name: item.name,
        weight: parseFloat(item.weight),
        quantity: parseInt(item.quantity, 10),
        category: item.category === "other" ? item.customCategory : item.category,
      })),
    };

    console.log('Submitting booking data to storeCustomerBooking:', bookingData);

    createBookingMutation.mutate(bookingData, {
      onSuccess: (data) => {
        Alert.alert(
          'Booking Submitted Successfully!', 
          'Your booking has been submitted and is now pending admin approval. You will be notified once it is approved.',
          [{ 
            text: 'OK', 
            onPress: () => navigation.navigate('Booking')
          }]
        );
      },
      onError: (error) => {
        console.error('Booking error:', error);
        Alert.alert('Error', 'Failed to submit booking. Please try again.');
      }
    });
  };

  if (categoriesQuery.isLoading || portsQuery.isLoading || containerTypesQuery.isLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={tw`mt-4 text-gray-600`}>Loading data...</Text>
      </View>
    );
  }

  // Mode-based visibility
  const showPickup = formData.modeOfService === "door-to-door" || formData.modeOfService === "door-to-port";
  const showDelivery = formData.modeOfService === "door-to-door" || formData.modeOfService === "port-to-door";

  return (
    <View style={tw`flex-1 bg-white`}>
      <StatusBar backgroundColor="#3b82f6" barStyle="light-content" />
      <Header 
        title="Create Booking" 
        showBack={true}
        leftIcon="arrow-back"
      />
      
      <SafeAreaView style={tw`flex-1`} edges={['left', 'right', 'bottom']}>
        <ScrollView style={tw`flex-1 bg-gray-50`} contentContainerStyle={tw`pb-6`}>
          <View style={tw`bg-white rounded-lg p-6 mx-4 mt-4 shadow-sm`}>
            <Text style={tw`text-2xl font-bold text-gray-800 mb-2`}>Create Booking</Text>
            
            {/* Customer Info Notice */}
            <View style={tw`bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6`}>
              <View style={tw`flex-row items-start gap-3`}>
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <View style={tw`flex-1`}>
                  <Text style={tw`font-bold text-blue-600 mb-1`}>Your Information</Text>
                  <Text style={tw`text-blue-700 text-sm`}>
                    Your account information ({user?.first_name} {user?.last_name}) will be used as the customer contact for this booking.
                  </Text>
                </View>
              </View>
            </View>

            {/* Section 1: Shipper Information */}
            <View style={tw`mb-6`}>
              <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>1. Shipper Information</Text>
              
              <View style={tw`gap-4`}>
                <View style={tw`flex-row gap-4`}>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Shipper First Name *</Text>
                    <TextInput
                      style={tw`border ${errors.shipperFirstName ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 bg-white`}
                      value={formData.shipperFirstName}
                      onChangeText={(value) => handleInputChange('shipperFirstName', value)}
                      placeholder="Enter shipper's first name"
                    />
                    {errors.shipperFirstName && (
                      <Text style={tw`text-red-500 text-xs mt-1`}>{errors.shipperFirstName}</Text>
                    )}
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Shipper Last Name *</Text>
                    <TextInput
                      style={tw`border ${errors.shipperLastName ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 bg-white`}
                      value={formData.shipperLastName}
                      onChangeText={(value) => handleInputChange('shipperLastName', value)}
                      placeholder="Enter shipper's last name"
                    />
                    {errors.shipperLastName && (
                      <Text style={tw`text-red-500 text-xs mt-1`}>{errors.shipperLastName}</Text>
                    )}
                  </View>
                </View>

                <View>
                  <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Shipper Contact Number</Text>
                  <TextInput
                    style={tw`border border-gray-300 rounded-lg p-3 bg-white`}
                    value={formData.shipperContact}
                    onChangeText={(value) => handleContactNumberChange('shipperContact', value)}
                    placeholder="Enter shipper's contact number"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            {/* Section 2: Consignee Information */}
            <View style={tw`mb-6`}>
              <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>2. Consignee Information</Text>
              
              <View style={tw`gap-4`}>
                <View style={tw`flex-row gap-4`}>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Consignee First Name *</Text>
                    <TextInput
                      style={tw`border ${errors.consigneeFirstName ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 bg-white`}
                      value={formData.consigneeFirstName}
                      onChangeText={(value) => handleInputChange('consigneeFirstName', value)}
                      placeholder="Enter consignee's first name"
                    />
                    {errors.consigneeFirstName && (
                      <Text style={tw`text-red-500 text-xs mt-1`}>{errors.consigneeFirstName}</Text>
                    )}
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Consignee Last Name *</Text>
                    <TextInput
                      style={tw`border ${errors.consigneeLastName ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 bg-white`}
                      value={formData.consigneeLastName}
                      onChangeText={(value) => handleInputChange('consigneeLastName', value)}
                      placeholder="Enter consignee's last name"
                    />
                    {errors.consigneeLastName && (
                      <Text style={tw`text-red-500 text-xs mt-1`}>{errors.consigneeLastName}</Text>
                    )}
                  </View>
                </View>

                <View>
                  <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Consignee Contact Number</Text>
                  <TextInput
                    style={tw`border border-gray-300 rounded-lg p-3 bg-white`}
                    value={formData.consigneeContact}
                    onChangeText={(value) => handleContactNumberChange('consigneeContact', value)}
                    placeholder="Enter consignee's contact number"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            {/* Section 3: Items Section */}
            <View style={tw`mb-6`}>
              <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>3. Item Information</Text>
              
              {items.map((item, index) => {
                const showCustomCategory = item.category === "other";
                
                return (
                  <View key={item.id} style={tw`bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4`}>
                    <View style={tw`flex-row justify-between items-center mb-3`}>
                      <Text style={tw`text-lg font-semibold text-gray-800`}>Item {index + 1}</Text>
                      {items.length > 1 && (
                        <TouchableOpacity onPress={() => removeItem(item.id)}>
                          <Ionicons name="close-circle" size={24} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    <View style={tw`gap-3`}>
                      <View>
                        <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Item Name *</Text>
                        <TextInput
                          style={tw`border border-gray-300 rounded-lg p-3 bg-white`}
                          value={item.name}
                          onChangeText={(value) => handleItemChange(item.id, 'name', value)}
                          placeholder="Enter item name"
                        />
                      </View>
                      
                      <View>
                        <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Category *</Text>
                        <View style={tw`border border-gray-300 rounded-lg bg-white`}>
                          <Picker
                            selectedValue={item.category}
                            onValueChange={(value) => handleCategoryChange(item.id, value)}
                          >
                            <Picker.Item label="Select category" value="" />
                            {categoryOptions.map((category, idx) => (
                              <Picker.Item key={idx} label={category.label} value={category.value} />
                            ))}
                          </Picker>
                        </View>
                        {showCustomCategory && (
                          <View style={tw`mt-2`}>
                            <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Category Name *</Text>
                            <TextInput
                              style={tw`border border-gray-300 rounded-lg p-3 bg-white`}
                              value={item.customCategory}
                              onChangeText={(value) => handleItemChange(item.id, 'customCategory', value)}
                              placeholder="Please specify category name"
                            />
                          </View>
                        )}
                      </View>
                      
                      <View style={tw`flex-row gap-3`}>
                        <View style={tw`flex-1`}>
                          <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Weight (kg) *</Text>
                          <TextInput
                            style={tw`border border-gray-300 rounded-lg p-3 bg-white`}
                            value={item.weight}
                            onChangeText={(value) => handleItemChange(item.id, 'weight', value)}
                            placeholder="Weight in kg"
                            keyboardType="decimal-pad"
                          />
                        </View>
                        <View style={tw`flex-1`}>
                          <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Quantity *</Text>
                          <TextInput
                            style={tw`border border-gray-300 rounded-lg p-3 bg-white`}
                            value={item.quantity}
                            onChangeText={(value) => handleItemChange(item.id, 'quantity', value)}
                            placeholder="Quantity"
                            keyboardType="number-pad"
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
              
              <TouchableOpacity onPress={addItem} style={tw`flex-row items-center`}>
                <Ionicons name="add-circle" size={20} color="#3b82f6" />
                <Text style={tw`text-blue-600 font-medium text-sm ml-2`}>Add another item</Text>
              </TouchableOpacity>
            </View>

            {/* Section 4: Shipping Preferences */}
            <View style={tw`mb-6`}>
              <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>4. Shipping Preferences</Text>
              
              {/* Basic Shipping Details */}
              <View style={tw`mb-6`}>
                <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>Basic Details</Text>
                
                <View style={tw`gap-4`}>
                  <View>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Mode of Service *</Text>
                    <View style={tw`border ${errors.modeOfService ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white`}>
                      <Picker
                        selectedValue={formData.modeOfService}
                        onValueChange={(value) => handleInputChange('modeOfService', value)}
                      >
                        <Picker.Item label="Select mode of service" value="" />
                        <Picker.Item label="Port to Port" value="port-to-port" />
                        <Picker.Item label="Door to Door" value="door-to-door" />
                        <Picker.Item label="Port to Door" value="port-to-door" />
                        <Picker.Item label="Door to Port" value="door-to-port" />
                      </Picker>
                    </View>
                    {errors.modeOfService && (
                      <Text style={tw`text-red-500 text-xs mt-1`}>{errors.modeOfService}</Text>
                    )}
                  </View>
                  
                  <View>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Terms (Days) *</Text>
                    <TextInput
                      style={tw`border ${errors.terms ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 bg-white`}
                      value={formData.terms}
                      onChangeText={(value) => handleInputChange('terms', value)}
                      placeholder="Enter terms in days"
                      keyboardType="number-pad"
                    />
                    {errors.terms && (
                      <Text style={tw`text-red-500 text-xs mt-1`}>{errors.terms}</Text>
                    )}
                  </View>

                  {/* Preferred Dates - FIXED: Date pickers */}
                  <View style={tw`gap-3`}>
                    <View>
                      <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Preferred Departure Date</Text>
                      <TouchableOpacity 
                        style={tw`border border-gray-300 rounded-lg p-3 bg-white`}
                        onPress={() => showDatepicker('departure')}
                      >
                        <Text style={tw`text-gray-800`}>{formatDate(formData.departureDate)}</Text>
                      </TouchableOpacity>
                      {showDatePicker.departure && (
                        <DateTimePicker
                          value={formData.departureDate || new Date()}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={(event, date) => handleDateChange('departureDate', event, date)}
                          minimumDate={new Date()}
                        />
                      )}
                    </View>

                    <View>
                      <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Preferred Delivery Date</Text>
                      <TouchableOpacity 
                        style={tw`border border-gray-300 rounded-lg p-3 bg-white`}
                        onPress={() => showDatepicker('delivery')}
                      >
                        <Text style={tw`text-gray-800`}>{formatDate(formData.deliveryDate)}</Text>
                      </TouchableOpacity>
                      {showDatePicker.delivery && (
                        <DateTimePicker
                          value={formData.deliveryDate || new Date()}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={(event, date) => handleDateChange('deliveryDate', event, date)}
                          minimumDate={formData.departureDate || new Date()}
                        />
                      )}
                    </View>
                  </View>
                </View>
              </View>

              {/* Container Information */}
              <View style={tw`mb-6`}>
                <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>Container Information</Text>
                
                <View style={tw`gap-4`}>
                  <View>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Container Type *</Text>
                    <View style={tw`border ${errors.containerSize ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white`}>
                      <Picker
                        selectedValue={formData.containerSize}
                        onValueChange={(value) => handleInputChange('containerSize', value)}
                      >
                        <Picker.Item label="Select container type" value="" />
                        {containerTypes.map((container) => (
                          <Picker.Item key={container.id} label={container.size} value={container.id.toString()} />
                        ))}
                      </Picker>
                    </View>
                    {errors.containerSize && (
                      <Text style={tw`text-red-500 text-xs mt-1`}>{errors.containerSize}</Text>
                    )}
                  </View>
                  
                  {formData.containerSize && (
                    <View>
                      <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Container Quantity</Text>
                      <View style={tw`flex-row items-center`}>
                        <TouchableOpacity 
                          onPress={decrementContainerQuantity}
                          style={tw`bg-gray-200 rounded-l-lg p-3`}
                        >
                          <Ionicons name="remove" size={20} color="#374151" />
                        </TouchableOpacity>
                        <View style={tw`bg-white border-t border-b border-gray-300 px-4 py-3`}>
                          <Text style={tw`text-gray-800 font-medium`}>{formData.containerQuantity}</Text>
                        </View>
                        <TouchableOpacity 
                          onPress={incrementContainerQuantity}
                          style={tw`bg-gray-200 rounded-r-lg p-3`}
                        >
                          <Ionicons name="add" size={20} color="#374151" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  
                  {/* Enhanced Weight Display */}
                  {items.some(item => item.weight && item.quantity) && formData.containerSize && (
                    <View style={tw`border ${
                      !weightValidation.isValid 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-blue-300 bg-blue-50'
                    } rounded-lg p-4`}>
                      <View style={tw`flex-row items-start gap-3`}>
                        <Ionicons 
                          name={!weightValidation.isValid ? "warning" : "information-circle"} 
                          size={20} 
                          color={!weightValidation.isValid ? "#dc2626" : "#2563eb"} 
                        />
                        <View style={tw`flex-1`}>
                          <Text style={tw`font-bold ${
                            !weightValidation.isValid 
                              ? 'text-red-600' 
                              : 'text-blue-600'
                          } mb-1`}>
                            {!weightValidation.isValid ? 'Weight Capacity Exceeded:' : 'Weight Status:'}
                          </Text>
                          <Text style={tw`${
                            !weightValidation.isValid 
                              ? 'text-red-700' 
                              : 'text-blue-700'
                          }`}>
                            {weightValidation.message}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Route Information */}
              <View style={tw`mb-6`}>
                <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>Route Information</Text>
                
                <View style={tw`gap-4`}>
                  <View>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Origin Port *</Text>
                    <View style={tw`border ${errors.origin ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white`}>
                      <Picker
                        selectedValue={formData.origin}
                        onValueChange={(value) => handleInputChange('origin', value)}
                      >
                        <Picker.Item label="Select origin port" value="" />
                        {formattedPorts.map((port) => (
                          <Picker.Item key={port.id} label={port.displayName} value={port.id.toString()} />
                        ))}
                      </Picker>
                    </View>
                    {errors.origin && (
                      <Text style={tw`text-red-500 text-xs mt-1`}>{errors.origin}</Text>
                    )}
                  </View>
                  
                  <View>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Destination Port *</Text>
                    <View style={tw`border ${errors.destination ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white`}>
                      <Picker
                        selectedValue={formData.destination}
                        onValueChange={(value) => handleInputChange('destination', value)}
                      >
                        <Picker.Item label="Select destination port" value="" />
                        {formattedPorts.map((port) => (
                          <Picker.Item key={port.id} label={port.displayName} value={port.id.toString()} />
                        ))}
                      </Picker>
                    </View>
                    {errors.destination && (
                      <Text style={tw`text-red-500 text-xs mt-1`}>{errors.destination}</Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Service Providers */}
              <View style={tw`mb-6`}>
                <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>Service Providers (Optional)</Text>
                
                <View style={tw`gap-4`}>
                  <View>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Preferred Shipping Line</Text>
                    <View style={tw`border border-gray-300 rounded-lg bg-white`}>
                      <Picker
                        selectedValue={formData.shippingLine}
                        onValueChange={(value) => handleInputChange('shippingLine', value)}
                      >
                        <Picker.Item label="Select shipping line" value="" />
                        {shippingLines.map((line) => (
                          <Picker.Item key={line.id} label={line.name} value={line.id.toString()} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  
                  <View>
                    <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Preferred Trucking Company</Text>
                    <View style={tw`border border-gray-300 rounded-lg bg-white`}>
                      <Picker
                        selectedValue={formData.truckCompany}
                        onValueChange={(value) => handleInputChange('truckCompany', value)}
                      >
                        <Picker.Item label="Select trucking company" value="" />
                        {truckCompanies.map((truck) => (
                          <Picker.Item key={truck.id} label={truck.name} value={truck.id.toString()} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>
              </View>

              {/* Location Fields */}
              {showPickup && (
                <View style={tw`mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4`}>
                  <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>Pickup Location</Text>
                  <LocationFields
                    type="pickup"
                    value={formData.pickupLocation}
                    onChange={(location) => handleInputChange('pickupLocation', location)}
                    showStreetSearch={true}
                  />
                </View>
              )}

              {showDelivery && (
                <View style={tw`mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4`}>
                  <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>Delivery Location</Text>
                  <LocationFields
                    type="delivery"
                    value={formData.deliveryLocation}
                    onChange={(location) => handleInputChange('deliveryLocation', location)}
                    showStreetSearch={true}
                  />
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={createBookingMutation.isPending || !weightValidation.isValid}
              style={tw`bg-blue-600 rounded-lg p-4 items-center ${
                createBookingMutation.isPending || !weightValidation.isValid ? 'opacity-50' : ''
              }`}
            >
              {createBookingMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={tw`text-white font-semibold text-lg`}>Submit Booking</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default CreateBooking;