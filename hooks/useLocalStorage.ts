"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

type UseLocalStorageOptions<T> = {
  deserialize?: (rawValue: string) => T;
  serialize?: (value: T) => string;
  legacyKeys?: readonly string[];
};

type UseLocalStorageResult<T> = {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  isHydrated: boolean;
  remove: () => void;
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {},
): UseLocalStorageResult<T> {
  const initialValueRef = useRef(initialValue);
  const optionsRef = useRef(options);
  const [value, setValue] = useState(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const currentOptions = optionsRef.current;
    const deserialize = currentOptions.deserialize ?? ((rawValue: string) => JSON.parse(rawValue) as T);
    const candidateKeys = [key, ...(currentOptions.legacyKeys ?? [])];

    try {
      let storedKey: string | null = null;
      let rawValue: string | null = null;

      for (const candidateKey of candidateKeys) {
        const candidateValue = window.localStorage.getItem(candidateKey);
        if (candidateValue !== null) {
          storedKey = candidateKey;
          rawValue = candidateValue;
          break;
        }
      }

      if (rawValue !== null) {
        const parsedValue = deserialize(rawValue);
        setValue(parsedValue);

        if (storedKey && storedKey !== key) {
          const serialize = currentOptions.serialize ?? JSON.stringify;
          window.localStorage.setItem(key, serialize(parsedValue));
          window.localStorage.removeItem(storedKey);
        }
      }
    } catch {
      candidateKeys.forEach((candidateKey) => window.localStorage.removeItem(candidateKey));
      setValue(initialValueRef.current);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      const serialize = optionsRef.current.serialize ?? JSON.stringify;
      window.localStorage.setItem(key, serialize(value));
    } catch {
      // Storage can be unavailable in private browsing or when quota is exceeded.
    }
  }, [isHydrated, key, value]);

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      optionsRef.current.legacyKeys?.forEach((legacyKey) => window.localStorage.removeItem(legacyKey));
    } catch {
      // Keep the in-memory reset usable even when browser storage is unavailable.
    }
    setValue(initialValueRef.current);
  }, [key]);

  return { value, setValue, isHydrated, remove };
}
