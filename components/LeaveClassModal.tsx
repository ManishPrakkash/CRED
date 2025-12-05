import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

interface LeaveClassModalProps {
  visible: boolean;
  targetClassName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LeaveClassModal({ visible, targetClassName, onConfirm, onCancel }: LeaveClassModalProps) {
  const [inputText, setInputText] = useState('');
  const [showError, setShowError] = useState(false);

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setInputText('');
      setShowError(false);
    }
  }, [visible]);

  const leavePhrase = `leave ${targetClassName}`;

  const handleConfirm = () => {
    if (targetClassName && targetClassName.trim() !== '' && inputText.trim() === leavePhrase) {
      onConfirm();
      setInputText('');
      setShowError(false);
    } else {
      setShowError(true);
    }
  };

  const handleCancel = () => {
    setInputText('');
    setShowError(false);
    onCancel();
  };

  const isValid = targetClassName && targetClassName.trim() !== '' && inputText.trim() === leavePhrase;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
          {/* Header */}
          <View className="items-center mb-5">
            <View className="w-16 h-16 rounded-full bg-yellow-100 items-center justify-center mb-3">
              <Text className="text-3xl">⚠️</Text>
            </View>
            <Text className="text-gray-900 text-xl font-bold text-center">
              Confirm Leave Class
            </Text>
            <Text className="text-gray-600 text-sm text-center mt-2">
              You are about to leave this class. You can rejoin later if needed.
            </Text>
          </View>

          {/* Class Info */}
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <Text className="text-gray-700 text-sm mb-2">
              To confirm, please type:
            </Text>
            <Text className="text-yellow-700 font-mono font-bold text-lg" numberOfLines={2}>
              {leavePhrase}
            </Text>
          </View>

          {/* Input Field */}
          <View className="mb-4">
            <TextInput
              className={`border ${showError && !isValid ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-lg px-4 py-3 text-gray-900 font-mono`}
              placeholder="Type here..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
                setShowError(false);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {showError && !isValid && (
              <Text className="text-red-600 text-sm mt-2">
                ❌ Text doesn't match. Please type exactly: {leavePhrase}
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-3.5 rounded-lg items-center justify-center bg-gray-200 border border-gray-300"
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text className="text-gray-700 font-semibold text-base">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3.5 rounded-lg items-center justify-center ${
                isValid ? 'bg-yellow-600' : 'bg-gray-300'
              } shadow-sm`}
              onPress={handleConfirm}
              disabled={!isValid}
              activeOpacity={0.7}
            >
              <Text className={`font-semibold text-base ${isValid ? 'text-white' : 'text-gray-500'}`}>
                Leave Class
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
