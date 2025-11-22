import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDebounce } from 'use-debounce';

/**
 * LocationFields Component for React Native
 * Props:
 *  - type: "pickup" | "delivery" (used for labels)
 *  - value: { province, city, barangay, street }
 *  - onChange: (valueObj) => void
 *  - showStreetSearch: boolean (default true)
 *  - required: boolean (default false)
 */

const LocationFields = ({
  type = 'pickup',
  value = {},
  onChange = () => {},
  showStreetSearch = true,
  required = false,
}) => {
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [streetOptions, setStreetOptions] = useState([]);
  const [isLoadingStreet, setIsLoadingStreet] = useState(false);
  const [streetInput, setStreetInput] = useState(value.street || '');
  const [debouncedStreet] = useDebounce(streetInput, 300);

  // Load provinces
  useEffect(() => {
    fetch('https://psgc.gitlab.io/api/provinces/')
      .then((r) => r.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setProvinces(sorted);
      })
      .catch(console.error);
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (!value.province) {
      setCities([]);
      setBarangays([]);
      return;
    }

    const province = provinces.find(p => p.name === value.province);
    if (!province) return;

    fetch(`https://psgc.gitlab.io/api/provinces/${province.code}/cities-municipalities`)
      .then((r) => r.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setCities(sorted);
      })
      .catch(console.error);
  }, [value.province, provinces]);

  // Load barangays when city changes
  useEffect(() => {
    if (!value.city) {
      setBarangays([]);
      return;
    }

    const city = cities.find(c => c.name === value.city);
    if (!city) return;

    fetch(`https://psgc.gitlab.io/api/cities-municipalities/${city.code}/barangays`)
      .then((r) => r.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setBarangays(sorted);
      })
      .catch(console.error);
  }, [value.city, cities]);

  // Street search
  useEffect(() => {
    let mounted = true;

    const searchStreets = async () => {
      if (!debouncedStreet || debouncedStreet.trim().length < 2) {
        setStreetOptions([]);
        return;
      }

      if (!value.city || !value.province) {
        setStreetOptions([]);
        return;
      }

      setIsLoadingStreet(true);

      try {
        const baseLocation = value.barangay 
          ? `${value.barangay}, ${value.city}, ${value.province}, Philippines`
          : `${value.city}, ${value.province}, Philippines`;

        const queries = [
          `${debouncedStreet}, ${baseLocation}`,
          `${debouncedStreet} Street, ${baseLocation}`,
        ];

        const results = await Promise.all(
          queries.map(q =>
            fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                q
              )}&countrycodes=ph&limit=3`
            ).then(r => r.ok ? r.json() : [])
          )
        );

        const flatResults = results.flat();
        const uniqueResults = flatResults.filter((item, index, self) =>
          index === self.findIndex(t => t.display_name === item.display_name)
        );

        const options = uniqueResults.slice(0, 5).map(item => ({
          label: item.display_name.split(',')[0] || item.display_name,
          value: item.display_name,
        }));

        if (mounted) setStreetOptions(options);
      } catch (error) {
        console.error('Street search error:', error);
        if (mounted) setStreetOptions([]);
      } finally {
        if (mounted) setIsLoadingStreet(false);
      }
    };

    searchStreets();

    return () => {
      mounted = false;
    };
  }, [debouncedStreet, value.city, value.province, value.barangay]);

  const handleFieldChange = (field, newValue) => {
    const updates = { [field]: newValue };
    
    // Clear dependent fields when parent field changes
    if (field === 'province') {
      updates.city = '';
      updates.barangay = '';
      updates.street = '';
      setStreetInput('');
    } else if (field === 'city') {
      updates.barangay = '';
      updates.street = '';
      setStreetInput('');
    } else if (field === 'barangay') {
      updates.street = '';
      setStreetInput('');
    }

    onChange({ ...value, ...updates });
  };

  const handleStreetSelect = (streetValue) => {
    setStreetInput(streetValue);
    onChange({ ...value, street: streetValue });
  };

  const pickerStyle = {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: 'white',
  };

  return (
    <View className="space-y-4">
      <View className="space-y-3">
        {/* Province */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Province {required && <Text className="text-red-500">*</Text>}
          </Text>
          <View style={pickerStyle}>
            <Picker
              selectedValue={value.province}
              onValueChange={(value) => handleFieldChange('province', value)}
            >
              <Picker.Item label="Select province" value="" />
              {provinces.map((province, index) => (
                <Picker.Item key={index} label={province.name} value={province.name} />
              ))}
            </Picker>
          </View>
        </View>

        {/* City */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            City / Municipality {required && <Text className="text-red-500">*</Text>}
          </Text>
          <View style={pickerStyle}>
            <Picker
              selectedValue={value.city}
              onValueChange={(value) => handleFieldChange('city', value)}
            >
              <Picker.Item label="Select city/municipality" value="" />
              {cities.map((city, index) => (
                <Picker.Item key={index} label={city.name} value={city.name} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Barangay */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Barangay {required && <Text className="text-red-500">*</Text>}
          </Text>
          <View style={pickerStyle}>
            <Picker
              selectedValue={value.barangay}
              onValueChange={(value) => handleFieldChange('barangay', value)}
            >
              <Picker.Item label="Select barangay" value="" />
              {barangays.map((barangay, index) => (
                <Picker.Item key={index} label={barangay.name} value={barangay.name} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Street */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Street / Address {required && <Text className="text-red-500">*</Text>}
          </Text>
          {showStreetSearch ? (
            <View>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 bg-white"
                placeholder="Start typing street address..."
                value={streetInput}
                onChangeText={(text) => {
                  setStreetInput(text);
                  if (!text) {
                    onChange({ ...value, street: '' });
                  }
                }}
              />
              
              {isLoadingStreet && (
                <View className="flex-row items-center mt-2">
                  <ActivityIndicator size="small" color="#3b82f6" />
                  <Text className="text-blue-600 ml-2">Searching addresses...</Text>
                </View>
              )}

              {streetOptions.length > 0 && (
                <View className="mt-2 border border-gray-300 rounded-lg bg-white max-h-40">
                  {streetOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      className="p-3 border-b border-gray-100"
                      onPress={() => handleStreetSelect(option.value)}
                    >
                      <Text className="text-gray-800">{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white"
              placeholder="Street, house no., unit, etc."
              value={value.street || ''}
              onChangeText={(text) => handleFieldChange('street', text)}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default LocationFields;