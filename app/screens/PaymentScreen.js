// src/screens/PaymentScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePayment } from '../hooks/usePayment';
import { useBooking } from '../hooks/useBooking';
import tw from '../../lib/tailwind';

const PaymentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId, bookingData } = route.params;
  const { getBookingQuery } = useBooking();
  const { createPaymentMutation, getPaymentBreakdownQuery } = usePayment();
  
  const { data: booking } = getBookingQuery(bookingId);
  const ar = booking?.accounts_receivable;
  const { data: breakdownData } = getPaymentBreakdownQuery(ar?.id);
  
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentInstructions = {
    accountName: 'NO*** M',
    accountNumber: '09944435770',
    steps: [
      'Open your GCash app',
      'Go to "Send Money"',
      'Enter GCash number: 09944435770',
      'Enter exact amount to pay',
      'Take a screenshot of the receipt',
      'Upload it below'
    ]
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0]);
    }
  };

  const removeImage = () => {
    setReceiptImage(null);
  };

  const handleSubmitPayment = async () => {
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (paymentMethod === 'gcash' && !receiptImage) {
      Alert.alert('Error', 'Please upload your GCash receipt');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('booking_id', bookingId);
      formData.append('payment_method', paymentMethod);
      formData.append('amount', ar?.collectible_amount || 0);
      
      if (referenceNumber) {
        formData.append('reference_number', referenceNumber);
      }
      
      if (receiptImage) {
        const localUri = receiptImage.uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('gcash_receipt_image', {
          uri: localUri,
          name: filename,
          type,
        });
      }

      await createPaymentMutation.mutateAsync(formData);
      
      Alert.alert(
        'Success!',
        paymentMethod === 'cod' 
          ? 'COD payment recorded! Payment will be collected upon delivery.'
          : 'Payment submitted successfully! Please wait for admin verification.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <StatusBar backgroundColor="#1e40af" barStyle="light-content" />
      
      {/* Header */}
      <View style={tw`bg-blue-700 px-4 pt-12 pb-4`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-white text-xl font-bold ml-4`}>
            Make Payment
          </Text>
        </View>
        <Text style={tw`text-blue-200 text-sm mt-2`}>
          Booking #{bookingData?.booking_number}
        </Text>
      </View>

      <SafeAreaView style={tw`flex-1`} edges={['left', 'right', 'bottom']}>
        <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-6`}>
          <View style={tw`px-4 pt-6`}>
            {/* Amount Due Card */}
            <View style={tw`bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6`}>
              <View style={tw`flex-row justify-between items-center`}>
                <View>
                  <Text style={tw`text-sm text-blue-700 font-medium`}>Total Amount Due</Text>
                  <View style={tw`flex-row items-center mt-1`}>
                    <Icon name="cash" size={20} color="#1e40af" />
                    <Text style={tw`text-2xl font-bold text-blue-900 ml-2`}>
                      {formatCurrency(ar?.collectible_amount || 0)}
                    </Text>
                  </View>
                </View>
                <View style={tw`items-end`}>
                  <View style={tw`bg-blue-100 px-2 py-1 rounded`}>
                    <Text style={tw`text-xs text-blue-600 font-medium`}>
                      Fixed Amount
                    </Text>
                  </View>
                  <Text style={tw`text-xs text-blue-500 mt-1`}>Cannot be edited</Text>
                </View>
              </View>
            </View>

            {/* Charges Breakdown */}
            {breakdownData?.charges && (
              <View style={tw`bg-white rounded-xl p-4 mb-6 shadow-sm`}>
                <Text style={tw`text-lg font-bold text-gray-900 mb-4`}>
                  Charges Breakdown
                </Text>
                
                {breakdownData.charges.map((charge, index) => (
                  <View key={index} style={tw`flex-row justify-between items-center py-3 border-b border-gray-100`}>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-sm font-medium text-gray-900`}>
                        {charge.description}
                      </Text>
                      <Text style={tw`text-xs text-gray-500 mt-1`}>
                        Base: {formatCurrency(charge.amount)} + Markup: {formatCurrency(charge.markup_amount)}
                      </Text>
                    </View>
                    <Text style={tw`text-sm font-semibold text-gray-900`}>
                      {formatCurrency(charge.total)}
                    </Text>
                  </View>
                ))}
                
                {/* Totals */}
                <View style={tw`mt-4 pt-4 border-t border-gray-200`}>
                  <View style={tw`flex-row justify-between items-center mb-2`}>
                    <Text style={tw`text-sm font-bold text-gray-900`}>Total Amount:</Text>
                    <Text style={tw`text-sm font-bold text-gray-900`}>
                      {formatCurrency(breakdownData.total_payment)}
                    </Text>
                  </View>
                  
                  {breakdownData.paid_amount > 0 && (
                    <View style={tw`flex-row justify-between items-center mb-2`}>
                      <Text style={tw`text-sm font-medium text-gray-700`}>Paid Amount:</Text>
                      <Text style={tw`text-sm font-medium text-green-600`}>
                        {formatCurrency(breakdownData.paid_amount)}
                      </Text>
                    </View>
                  )}
                  
                  <View style={tw`flex-row justify-between items-center`}>
                    <Text style={tw`text-sm font-bold text-orange-600`}>Balance Due:</Text>
                    <Text style={tw`text-sm font-bold text-orange-600`}>
                      {formatCurrency(breakdownData.collectible_amount)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Payment Method Selection */}
            <View style={tw`bg-white rounded-xl p-4 mb-6 shadow-sm`}>
              <Text style={tw`text-lg font-bold text-gray-900 mb-4`}>
                Select Payment Method
              </Text>
              
              <View style={tw`space-y-3`}>
                <TouchableOpacity
                  onPress={() => setPaymentMethod('cod')}
                  style={tw`p-4 border rounded-lg ${
                    paymentMethod === 'cod' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <View style={tw`flex-row items-center justify-between`}>
                    <View style={tw`flex-row items-center`}>
                      <View style={tw`p-2 rounded-lg bg-blue-100 mr-3`}>
                        <Icon name="truck" size={20} color="#3b82f6" />
                      </View>
                      <View>
                        <Text style={tw`font-medium text-gray-900`}>
                          Cash on Delivery
                        </Text>
                        <Text style={tw`text-xs text-gray-500`}>
                          Pay when your shipment arrives
                        </Text>
                      </View>
                    </View>
                    {paymentMethod === 'cod' && (
                      <Icon name="check-circle" size={20} color="#3b82f6" />
                    )}
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setPaymentMethod('gcash')}
                  style={tw`p-4 border rounded-lg ${
                    paymentMethod === 'gcash' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <View style={tw`flex-row items-center justify-between`}>
                    <View style={tw`flex-row items-center`}>
                      <View style={tw`p-2 rounded-lg bg-blue-100 mr-3`}>
                        <Icon name="cellphone" size={20} color="#3b82f6" />
                      </View>
                      <View>
                        <Text style={tw`font-medium text-gray-900`}>
                          GCash
                        </Text>
                        <Text style={tw`text-xs text-gray-500`}>
                          Pay instantly via GCash
                        </Text>
                      </View>
                    </View>
                    {paymentMethod === 'gcash' && (
                      <Icon name="check-circle" size={20} color="#3b82f6" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* GCash Instructions */}
            {paymentMethod === 'gcash' && (
              <View style={tw`bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6`}>
                <View style={tw`flex-row items-start mb-4`}>
                  <Icon name="information" size={20} color="#3b82f6" style={tw`mt-0.5 mr-2`} />
                  <View style={tw`flex-1`}>
                    <Text style={tw`font-medium text-blue-800 mb-1`}>
                      Payment Instructions
                    </Text>
                    <Text style={tw`text-sm text-blue-700`}>
                      Send payment to the following GCash account:
                    </Text>
                  </View>
                </View>

                {/* Account Details */}
                <View style={tw`bg-white rounded-lg p-3 mb-4`}>
                  <View style={tw`flex-row justify-between items-center mb-2`}>
                    <View style={tw`flex-row items-center`}>
                      <Icon name="phone" size={16} color="#64748b" style={tw`mr-2`} />
                      <Text style={tw`text-sm font-medium text-gray-700`}>
                        Account Number:
                      </Text>
                    </View>
                    <Text style={tw`font-mono font-bold text-gray-900`}>
                      {paymentInstructions.accountNumber}
                    </Text>
                  </View>
                  <View style={tw`flex-row justify-between items-center`}>
                    <View style={tw`flex-row items-center`}>
                      <Icon name="account" size={16} color="#64748b" style={tw`mr-2`} />
                      <Text style={tw`text-sm font-medium text-gray-700`}>
                        Account Name:
                      </Text>
                    </View>
                    <Text style={tw`font-bold text-gray-900`}>
                      {paymentInstructions.accountName}
                    </Text>
                  </View>
                </View>

                {/* Steps */}
                <View style={tw`space-y-2`}>
                  {paymentInstructions.steps.map((step, index) => (
                    <View key={index} style={tw`flex-row items-start`}>
                      <View style={tw`w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2`}>
                        <Text style={tw`text-xs font-bold text-blue-700`}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={tw`text-sm text-gray-700 flex-1`}>
                        {step}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Reference Number (GCash) */}
            {paymentMethod === 'gcash' && (
              <View style={tw`bg-white rounded-xl p-4 mb-6 shadow-sm`}>
                <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                  Reference Number (Optional)
                </Text>
                <TextInput
                  style={tw`border border-gray-300 rounded-lg p-3 bg-gray-50`}
                  placeholder="Enter GCash reference number"
                  value={referenceNumber}
                  onChangeText={setReferenceNumber}
                />
                <Text style={tw`text-xs text-gray-500 mt-1`}>
                  Found in your GCash transaction receipt
                </Text>
              </View>
            )}

            {/* Receipt Upload (GCash) */}
            {paymentMethod === 'gcash' && (
              <View style={tw`bg-white rounded-xl p-4 mb-6 shadow-sm`}>
                <Text style={tw`text-sm font-medium text-gray-700 mb-3`}>
                  Upload Receipt Screenshot
                </Text>
                
                {!receiptImage ? (
                  <TouchableOpacity
                    onPress={pickImage}
                    style={tw`border-2 border-dashed border-gray-300 rounded-lg p-6 items-center`}
                  >
                    <Icon name="upload" size={32} color="#94a3b8" />
                    <Text style={tw`text-sm text-gray-600 mt-2 text-center`}>
                      Tap to upload your receipt screenshot
                    </Text>
                    <Text style={tw`text-xs text-gray-500 mt-1`}>
                      Supports JPG, PNG up to 2MB
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={tw`border border-gray-300 rounded-lg overflow-hidden`}>
                    <View style={tw`bg-gray-50 px-4 py-3 flex-row justify-between items-center`}>
                      <View style={tw`flex-row items-center`}>
                        <Icon name="receipt" size={20} color="#3b82f6" style={tw`mr-2`} />
                        <Text style={tw`text-sm font-medium text-gray-900`}>
                          {receiptImage.fileName || 'receipt.jpg'}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={removeImage}>
                        <Text style={tw`text-red-600 text-sm font-medium`}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Image
                      source={{ uri: receiptImage.uri }}
                      style={tw`h-48 w-full`}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>
            )}

            {/* COD Notice */}
            {paymentMethod === 'cod' && (
              <View style={tw`bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6`}>
                <View style={tw`flex-row items-start`}>
                  <Icon name="alert-circle" size={20} color="#3b82f6" style={tw`mt-0.5 mr-2`} />
                  <View style={tw`flex-1`}>
                    <Text style={tw`font-medium text-blue-800 mb-2`}>
                      Important Notice
                    </Text>
                    <View style={tw`space-y-1`}>
                      <Text style={tw`text-sm text-blue-700`}>
                        • Payment will be collected in cash when your shipment arrives
                      </Text>
                      <Text style={tw`text-sm text-blue-700`}>
                        • Please prepare exact amount: {formatCurrency(ar?.collectible_amount || 0)}
                      </Text>
                      <Text style={tw`text-sm text-blue-700`}>
                        • Driver will provide an official receipt upon payment
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmitPayment}
              disabled={isSubmitting || !paymentMethod}
              style={tw`bg-blue-600 rounded-lg p-4 items-center ${
                isSubmitting || !paymentMethod ? 'opacity-50' : ''
              }`}
            >
              {isSubmitting ? (
                <View style={tw`flex-row items-center`}>
                  <Icon name="loading" size={20} color="white" style={tw`animate-spin mr-2`} />
                  <Text style={tw`text-white font-semibold text-lg`}>
                    Processing...
                  </Text>
                </View>
              ) : (
                <Text style={tw`text-white font-semibold text-lg`}>
                  {paymentMethod === 'cod' ? 'Confirm COD' : 'Submit Payment'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default PaymentScreen;