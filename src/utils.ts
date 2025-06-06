import qs from 'query-string';

/**
 * This function is used to filter out any elements that are not truthy and plays nice with TypeScript.
 * @param x - The value to check for truthiness.
 * @example
 * ```typeScript
 * let numbers: number[] = [1, undefined, 3, null, 5].filter(isTruthy);
 * ```
 */
export const isNotNil = <T>(x?: T): x is Exclude<T, null | undefined> => {
  return x !== null && x !== undefined;
};

export function sortBy<A>(arr: A[], comp: (v: A) => number): A[] {
  return arr.sort((a, b) => {
    const aComp = comp(a);
    const bComp = comp(b);
    if (aComp < bComp) {
      return -1;
    }
    if (aComp > bComp) {
      return 1;
    }
    return 0;
  });
}

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const uniqByReference = <T>(arr: T[]): T[] => Array.from(new Set(arr));

export const splitToChunks = <T>(numChunks: number, arr: T[]): T[][] => {
  const chunkSize = Math.ceil(arr.length / numChunks);
  return Array.from({length: numChunks}, (_, i) =>
    arr.slice(i * chunkSize, i * chunkSize + chunkSize)
  );
};

type Page = {
  context: {
    sidebar_hidden?: boolean;
    sidebar_order?: number;
    sidebar_title?: string;
    title?: string;
  };
};

export const sortPages = <T>(arr: T[], extractor: (entity: T) => Page) => {
  return arr.sort((entityA, entityB) => {
    const pageA = extractor(entityA);
    const pageB = extractor(entityB);

    const aBase = pageA.context.sidebar_order ?? 10;
    const bBase = pageB.context.sidebar_order ?? 10;
    const aso = aBase >= 0 ? aBase : 10;
    const bso = bBase >= 0 ? bBase : 10;

    if (aso > bso) {
      return 1;
    }
    if (bso > aso) {
      return -1;
    }
    return ((pageA.context.sidebar_title || pageA.context.title) ?? '').localeCompare(
      (pageB.context.sidebar_title || pageB.context.title) ?? ''
    );
  });
};

type URLQueryObject = {
  [key: string]: string;
};

const paramsToSync = [/utm_/i, /promo_/i, /gclid/i, /original_referrer/i];

export const marketingUrlParams = (): URLQueryObject => {
  const query = qs.parse(window.location.search);
  const marketingParams: Record<string, string> = Object.keys(query).reduce((a, k) => {
    const matcher = paramsToSync.find(m => m.test(k));
    return matcher ? {...a, [k]: query[k]} : a;
  }, {});

  // add in original_referrer
  if (document.referrer && !marketingParams.original_referrer) {
    marketingParams.original_referrer = document.referrer;
  }

  return marketingParams;
};

export function captureException(exception: unknown): void {
  try {
    // Sentry may not be available, as we are using the Loader Script
    // so we guard defensively against all of these existing.
    window.Sentry.captureException(exception);
  } catch {
    // ignore
  }
}

export const isLocalStorageAvailable = () => typeof localStorage !== 'undefined';

export const stripTrailingSlash = (url: string) => {
  return url.replace(/\/$/, '');
};

/**
 * Debounce function to limit the number of times a function is called.
 * @param func The function to be debounced.
 * @param wait The time to wait before calling the function.
 * @returns A debounced function that only calls the original function after the wait time has passed.
 */
export function debounce<T extends unknown[]>(func: (...args: T) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return function (...args: T) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}
