import { AlertCircle, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface DeleteClassModalProps {
  visible: boolean;
  className: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteClassModal({ visible, className, onConfirm, onCancel }: DeleteClassModalProps) {
  const [inputText, setInputText] = useState('');
  const deletePhrase = `delete ${className}`;
  const isValid = inputText.trim() === deletePhrase;

  const handleConfirm = () => {
    if (isValid) {
      setInputText('');
      onConfirm();
    }
  };

  const handleCancel = () => {
    setInputText('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-white rounded-2xl w-full max-w-md p-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3">
                <AlertCircle size={20} color="#ef4444" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Confirm Deletion</Text>
            </View>
            <TouchableOpacity onPress={handleCancel} className="p-1">
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View className="mb-6">
            <Text className="text-gray-700 mb-4">
              To confirm deletion of this class, please type:
            </Text>
            <View className="bg-gray-100 rounded-lg p-3 mb-4">
              <Text className="font-mono text-gray-900 font-bold">
                {deletePhrase}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm">
              This action cannot be undone. All students and data will be permanently removed.
            </Text>
          </View>

          {/* Input Field */}
          <View className="mb-6">
            <TextInput
              className="border-2 border-gray-300 rounded-lg p-3 text-gray-900"
              placeholder={`Type: ${deletePhrase}`}
              value={inputText}
              onChangeText={setInputText}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            {inputText.length > 0 && !isValid && (
              <Text className="text-red-600 text-sm mt-2">
                Text does not match. Please type exactly: {deletePhrase}
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
            >
              <Text className="text-gray-700 font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!isValid}
              className={`flex-1 py-3 rounded-lg items-center ${
                isValid ? 'bg-red-600' : 'bg-red-300'
              }`}
            >
              <Text className="text-white font-bold">Confirm Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
