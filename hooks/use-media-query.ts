import { useEffect, useState } from 'react';

/**
 * Custom hook that returns whether a given media query matches.
 * @param query The media query to check for (e.g., "(max-width: 768px)")
 * @returns A boolean indicating whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Default to false in SSR
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    // Set the initial value
    setMatches(mediaQuery.matches);

    // Define the callback function to update state
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Older browsers support
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Older browsers support
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}
