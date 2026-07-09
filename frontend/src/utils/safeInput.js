/**
 * Global control input null-safe fallback utility helper.
 * Prevents React "uncontrolled input changing to controlled" warnings by ensuring
 * that any bound state value is never undefined or null.
 * 
 * Usage:
 *   import { safeVal } from '../utils/safeInput';
 *   <input value={safeVal(formState.name)} onChange={...} />
 */
export const safeVal = (value, fallback = '') => {
  return value === undefined || value === null ? fallback : value;
};
