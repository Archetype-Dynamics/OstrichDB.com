/**
 * =================================================
 * Author: Marshall A Burns
 * GitHub: @SchoolyB
 * Contributors:
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    This file contains Record data types and validation logic
 * =================================================
 **/

// Supported record data types
export type RecordDataType = 
  | 'CHAR'
  | 'STRING' 
  | 'INTEGER'
  | 'BOOLEAN'
  | 'FLOAT'
  | 'NULL'
  | '[]CHAR'
  | '[]STRING'
  | '[]INTEGER'
  | '[]BOOLEAN'
  | '[]FLOAT'
  | 'DATE'
  | 'TIME'
  | 'DATETIME'
  | 'UUID'
  | '[]DATE'
  | '[]TIME'
  | '[]DATETIME'
  | '[]UUID';

// All available data types
export const DATA_TYPES: RecordDataType[] = [
  'CHAR',
  'STRING',
  'INTEGER', 
  'BOOLEAN',
  'FLOAT',
  'NULL',
  '[]CHAR',
  '[]STRING',
  '[]INTEGER',
  '[]BOOLEAN',
  '[]FLOAT',
  'DATE',
  'TIME',
  'DATETIME',
  'UUID',
  '[]DATE',
  '[]TIME',
  '[]DATETIME',
  '[]UUID'
];

// Data type categories for filtering/grouping
export const DATA_TYPE_CATEGORIES = {
  PRIMITIVE: ['CHAR', 'STRING', 'INTEGER', 'BOOLEAN', 'FLOAT', 'NULL'] as RecordDataType[],
  TEMPORAL: ['DATE', 'TIME', 'DATETIME'] as RecordDataType[],
  IDENTIFIER: ['UUID'] as RecordDataType[],
  ARRAY: ['[]CHAR', '[]STRING', '[]INTEGER', '[]BOOLEAN', '[]FLOAT', '[]DATE', '[]TIME', '[]DATETIME', '[]UUID'] as RecordDataType[]
};

// Data type descriptions
export const DATA_TYPE_DESCRIPTIONS: Record<RecordDataType, string> = {
  'CHAR': 'A single character',
  'STRING': 'Text of any length',
  'INTEGER': 'Whole numbers (e.g., -42, 0, 123)',
  'BOOLEAN': 'True or false values',
  'FLOAT': 'Decimal numbers (e.g., 3.14, -0.5)',
  'NULL': 'Empty/null value',
  '[]CHAR': 'Array of single characters',
  '[]STRING': 'Array of text strings',
  '[]INTEGER': 'Array of whole numbers',
  '[]BOOLEAN': 'Array of boolean values',
  '[]FLOAT': 'Array of decimal numbers',
  'DATE': 'Date in YYYY-MM-DD format',
  'TIME': 'Time in HH:MM:SS format',
  'DATETIME': 'Date and time in YYYY-MM-DDTHH:MM:SS format',
  'UUID': 'Universally unique identifier',
  '[]DATE': 'Array of dates',
  '[]TIME': 'Array of times',
  '[]DATETIME': 'Array of date-times',
  '[]UUID': 'Array of UUIDs'
};

// Data type examples
export const DATA_TYPE_EXAMPLES: Record<RecordDataType, string> = {
  'CHAR': 'A',
  'STRING': 'Hello, World!',
  'INTEGER': '42',
  'BOOLEAN': 'true',
  'FLOAT': '3.14159',
  'NULL': 'null',
  '[]CHAR': '["A", "B", "C"]',
  '[]STRING': '["apple", "banana", "cherry"]',
  '[]INTEGER': '[1, 2, 3, 42]',
  '[]BOOLEAN': '[true, false, true]',
  '[]FLOAT': '[3.14, 2.71, 1.41]',
  'DATE': '2025-01-15',
  'TIME': '14:30:45',
  'DATETIME': '2025-01-15T14:30:45',
  'UUID': '550e8400-e29b-41d4-a716-446655440000',
  '[]DATE': '["2025-01-15", "2025-01-16"]',
  '[]TIME': '["14:30:45", "09:15:30"]',
  '[]DATETIME': '["2025-01-15T14:30:45", "2025-01-16T09:15:30"]',
  '[]UUID': '["550e8400-e29b-41d4-a716-446655440000", "6ba7b810-9dad-11d1-80b4-00c04fd430c8"]'
};

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

// Regular expressions for validation
const PATTERNS = {
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIME: /^\d{2}:\d{2}:\d{2}$/,
  DATETIME: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  INTEGER: /^-?\d+$/,
  FLOAT: /^-?\d*\.?\d+$/
};

/**
 * Validates a record name
 */
export function validateRecordName(name: string): ValidationResult {
  if (!name.trim()) {
    return { isValid: false, errorMessage: 'Record name is required' };
  }

  if (name.length > 64) {
    return { isValid: false, errorMessage: 'Record name must be 64 characters or less' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return { isValid: false, errorMessage: 'Record name can only contain letters, numbers, underscores (_), and hyphens (-)' };
  }

  if (name.includes(' ')) {
    return { isValid: false, errorMessage: 'Record name cannot contain spaces' };
  }

  // Reserved keywords check
  const reservedKeywords = ['null', 'true', 'false', 'undefined'];
  if (reservedKeywords.includes(name.toLowerCase())) {
    return { isValid: false, errorMessage: 'Record name cannot be a reserved keyword' };
  }

  return { isValid: true };
}

/**
 * Validates a date string (YYYY-MM-DD)
 */
function validateDate(dateStr: string): ValidationResult {
  if (!PATTERNS.DATE.test(dateStr)) {
    return { isValid: false, errorMessage: 'Date must be in YYYY-MM-DD format' };
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { isValid: false, errorMessage: 'Invalid date' };
  }

  // Check if the date components match the input (handles invalid dates like 2025-02-30)
  const [year, month, day] = dateStr.split('-').map(Number);
  if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
    return { isValid: false, errorMessage: 'Invalid date' };
  }

  return { isValid: true };
}

/**
 * Validates a time string (HH:MM:SS)
 */
function validateTime(timeStr: string): ValidationResult {
  if (!PATTERNS.TIME.test(timeStr)) {
    return { isValid: false, errorMessage: 'Time must be in HH:MM:SS format' };
  }

  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  
  if (hours < 0 || hours > 23) {
    return { isValid: false, errorMessage: 'Hours must be between 00 and 23' };
  }
  
  if (minutes < 0 || minutes > 59) {
    return { isValid: false, errorMessage: 'Minutes must be between 00 and 59' };
  }
  
  if (seconds < 0 || seconds > 59) {
    return { isValid: false, errorMessage: 'Seconds must be between 00 and 59' };
  }

  return { isValid: true };
}

/**
 * Validates a datetime string (YYYY-MM-DDTHH:MM:SS)
 */
function validateDateTime(datetimeStr: string): ValidationResult {
  if (!PATTERNS.DATETIME.test(datetimeStr)) {
    return { isValid: false, errorMessage: 'DateTime must be in YYYY-MM-DDTHH:MM:SS format' };
  }

  const [datePart, timePart] = datetimeStr.split('T');
  
  const dateValidation = validateDate(datePart);
  if (!dateValidation.isValid) {
    return dateValidation;
  }

  const timeValidation = validateTime(timePart);
  if (!timeValidation.isValid) {
    return timeValidation;
  }

  return { isValid: true };
}

/**
 * Validates a UUID string
 */
function validateUUID(uuidStr: string): ValidationResult {
  if (!PATTERNS.UUID.test(uuidStr)) {
    return { isValid: false, errorMessage: 'UUID must be in format XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX (0-9 and a-f)' };
  }

  return { isValid: true };
}

/**
 * Validates an array value
 */
function validateArray(value: string, arrayType: RecordDataType): ValidationResult {
  let parsedArray: any[];
  
  try {
    parsedArray = JSON.parse(value);
  } catch {
    return { isValid: false, errorMessage: 'Value must be a valid array eg. [item1, item2, etc]' };
  }

  if (!Array.isArray(parsedArray)) {
    return { isValid: false, errorMessage: 'Value must be an array' };
  }

  // Get the element type (remove [] prefix)
  const elementType = arrayType.slice(2) as RecordDataType;
  
  // Validate each element
  for (let i = 0; i < parsedArray.length; i++) {
    const element = parsedArray[i];
    const elementValidation = validateRecordValue(String(element), elementType);
    
    if (!elementValidation.isValid) {
      return { 
        isValid: false, 
        errorMessage: `Array element ${i + 1}: ${elementValidation.errorMessage}` 
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates a record value based on its data type
 */
export function validateRecordValue(value: string, type: RecordDataType): ValidationResult {
  // Handle empty values
  if (!value.trim()) {
    if (type === 'NULL') {
      return { isValid: true };
    }
    return { isValid: false, errorMessage: 'Value is required' };
  }

  // Handle NULL type
  if (type === 'NULL') {
    if (value.toLowerCase() !== 'null') {
      return { isValid: false, errorMessage: 'NULL type must have value "null"' };
    }
    return { isValid: true };
  }

  // Handle array types
  if (type.startsWith('[]')) {
    return validateArray(value, type);
  }

  // Validate based on type
  switch (type) {
    case 'CHAR':
      if (value.length !== 1) {
        return { isValid: false, errorMessage: 'CHAR must be exactly one character' };
      }
      return { isValid: true };

    case 'STRING':
      // Any string is valid, but check for reasonable length
      if (value.length > 10000) {
        return { isValid: false, errorMessage: 'String is too long (max 10,000 characters)' };
      }
      return { isValid: true };

    case 'INTEGER':
      if (!PATTERNS.INTEGER.test(value)) {
        return { isValid: false, errorMessage: 'Value must be a valid integer' };
      }
      // Check for safe integer range
      const intValue = parseInt(value, 10);
      if (!Number.isSafeInteger(intValue)) {
        return { isValid: false, errorMessage: 'Integer value is outside safe range' };
      }
      return { isValid: true };

    case 'FLOAT':
      if (!PATTERNS.FLOAT.test(value)) {
        return { isValid: false, errorMessage: 'Value must be a valid float' };
      }
      const floatValue = parseFloat(value);
      if (!isFinite(floatValue)) {
        return { isValid: false, errorMessage: 'Float value must be finite' };
      }
      return { isValid: true };

    case 'BOOLEAN':
      if (!['true', 'false'].includes(value.toLowerCase())) {
        return { isValid: false, errorMessage: 'Boolean must be "true" or "false"' };
      }
      return { isValid: true };

    case 'DATE':
      return validateDate(value);

    case 'TIME':
      return validateTime(value);

    case 'DATETIME':
      return validateDateTime(value);

    case 'UUID':
      return validateUUID(value);

    default:
      return { isValid: false, errorMessage: `Unknown data type: ${type}` };
  }
}

/**
 * Get a default/example value for a data type
 */
export function getDefaultValue(type: RecordDataType): string {
  return DATA_TYPE_EXAMPLES[type];
}

/**
 * Check if a data type is an array type
 */
export function isArrayType(type: RecordDataType): boolean {
  return type.startsWith('[]');
}

/**
 * Get the element type of an array type
 */
export function getArrayElementType(arrayType: RecordDataType): RecordDataType | null {
  if (!isArrayType(arrayType)) {
    return null;
  }
  return arrayType.slice(2) as RecordDataType;
}

/**
 * Get data types grouped by category
 */
export function getDataTypesByCategory(): Record<string, RecordDataType[]> {
  return {
    'Primitive Types': DATA_TYPE_CATEGORIES.PRIMITIVE,
    'Date & Time': DATA_TYPE_CATEGORIES.TEMPORAL,
    'Identifiers': DATA_TYPE_CATEGORIES.IDENTIFIER,
    'Array Types': DATA_TYPE_CATEGORIES.ARRAY
  };
}

/**
 * Format a value for display based on its type
 */
export function formatValueForDisplay(value: string, type: RecordDataType): string {
  if (!value) return '';
  
  // For arrays, try to format nicely
  if (isArrayType(type)) {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 0);
    } catch {
      return value;
    }
  }
  
  return value;
}

/**
 * Get type-specific input props for form fields
 */
export function getInputPropsForType(type: RecordDataType): {
  type: string;
  placeholder: string;
  maxLength?: number;
  pattern?: string;
} {
  switch (type) {
    case 'CHAR':
      return {
        type: 'text',
        placeholder: 'A',
        maxLength: 1
      };
    
    case 'STRING':
      return {
        type: 'text',
        placeholder: 'Enter text...',
        maxLength: 10000
      };
    
    case 'INTEGER':
      return {
        type: 'text',
        placeholder: '42',
        pattern: '-?\\d+'
      };
    
    case 'FLOAT':
      return {
        type: 'text',
        placeholder: '3.14159',
        pattern: '-?\\d*\\.?\\d+'
      };
    
    case 'BOOLEAN':
      return {
        type: 'text',
        placeholder: 'true or false'
      };
    
    case 'DATE':
      return {
        type: 'text',
        placeholder: '2025-01-15',
        pattern: '\\d{4}-\\d{2}-\\d{2}'
      };
    
    case 'TIME':
      return {
        type: 'text',
        placeholder: '14:30:45',
        pattern: '\\d{2}:\\d{2}:\\d{2}'
      };
    
    case 'DATETIME':
      return {
        type: 'text',
        placeholder: '2025-01-15T14:30:45'
      };
    
    case 'UUID':
      return {
        type: 'text',
        placeholder: '550e8400-e29b-41d4-a716-446655440000'
      };
    
    case 'NULL':
      return {
        type: 'text',
        placeholder: 'null'
      };
    
    default:
      // Array types
      return {
        type: 'text',
        placeholder: getDefaultValue(type)
      };
  }
}

/**
 * Format a record value for API transmission
 * Handles proper quoting for STRING and []STRING types
 */
export function formatValueForAPI(value: string, type: RecordDataType): string {
  switch (type) {
    case 'STRING':
      // Encapsulate STRING values in double quotes
      return `"${value}"`;
    
    case '[]STRING':
      try {
        // Parse the array and encapsulate each element in double quotes
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          const quotedElements = parsed.map(item => `"${String(item)}"`);
          return `[${quotedElements.join(', ')}]`;
        }
        return value;
      } catch {
        // If parsing fails, return as-is
        return value;
      }
    
    default:
      // For all other types, return value as-is (no additional quoting)
      return value;
  }
}